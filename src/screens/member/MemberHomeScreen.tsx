import { useEffect, useMemo, useReducer, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { MemberBottomNav, type MemberTabId } from '../../components/member/MemberBottomNav';
import { Dashboard, type DailyActivity, type DailyTracker, type FoodLogListItem, type Workout } from '../../components/member/Dashboard';
import { MessagesTab } from '../../components/member/MessagesTab';
import { ProfileTab } from '../../components/member/ProfileTab';
import { ProgressTab } from '../../components/member/ProgressTab';
import { WorkoutTracking } from '../../components/member/WorkoutTracking';
import { useAuth } from '../../context/AuthContext';
import { useFeatureFlag } from '../../context/FeatureFlagsContext';
import { useMessaging } from '../../context/MessagingContext';
import { MemberDataProvider, type DailyHistoryEntry, type UserProfile } from '../../context/MemberDataContext';
import { useTheme } from '../../context/ThemeContext';
import { useWorkoutProposals } from '../../context/WorkoutProposalsContext';
import { getMemberById, getTrainerById } from '../../lib/mockDirectory';
import type { MemberStackParamList } from '../../navigation/MemberNavigator';

const STORAGE_WORKOUTS = 'member:workouts';
const STORAGE_DAILY_TRACKER = 'member:dailyTracker';
const STORAGE_DAILY_HISTORY = 'member:dailyHistory';
const STORAGE_USER_PROFILE = 'member:userProfile';
const STORAGE_SAVED_RECS = 'member:savedRecommendations';

const todayKey = () => new Date().toISOString().slice(0, 10);

function computeDailyActivity(workouts: Workout[], dateKey: string): DailyActivity {
  const todays = workouts.filter(w => w.date.slice(0, 10) === dateKey);
  const totalWorkouts = todays.length;
  const totalDuration = todays.reduce((sum, w) => sum + (Number(w.duration) || 0), 0);
  const caloriesBurned = Math.round(totalDuration * 6); // simple MVP estimate
  return { date: dateKey, totalWorkouts, totalDuration, caloriesBurned };
}

type State = {
  workouts: Workout[];
  selectedWorkoutId: string | null;
  dailyTracker: DailyTracker;
  dailyHistory: Record<string, DailyHistoryEntry>;
  userProfile: UserProfile;
};

type Action =
  | { type: 'hydrate'; workouts: Workout[]; dailyTracker: DailyTracker; dailyHistory: Record<string, DailyHistoryEntry>; userProfile: UserProfile }
  | { type: 'logWorkout'; workout: Workout; dateKey: string }
  | { type: 'selectWorkout'; id: string | null }
  | { type: 'patchDailyTracker'; patch: Partial<Pick<DailyTracker, 'caloriesConsumed' | 'steps'>>; dateKey: string }
  | {
      type: 'updateUserProfile';
      patch: Partial<
        Pick<UserProfile, 'name' | 'email' | 'avatarUri' | 'age' | 'weight' | 'height' | 'goal' | 'notificationsEnabled'>
      >;
    }
  | { type: 'rolloverDay'; dateKey: string };

const defaultProfile = (args: { name?: string | null; email?: string | null }): UserProfile => ({
  name: args.name ?? 'Member',
  email: args.email ?? '',
  avatarUri: null,
  age: 22,
  weight: null,
  height: null,
  goal: 'maintain',
  totalWorkouts: 0,
  totalSteps: 0,
  streakDays: 0,
  notificationsEnabled: true,
  lastActiveDate: null,
});

const isYesterday = (prev: string, next: string) => {
  const p = new Date(prev + 'T00:00:00Z').getTime();
  const n = new Date(next + 'T00:00:00Z').getTime();
  return n - p === 24 * 60 * 60 * 1000;
};

function markActive(profile: UserProfile, dateKey: string): UserProfile {
  if (profile.lastActiveDate === dateKey) return profile;
  if (!profile.lastActiveDate) {
    return { ...profile, lastActiveDate: dateKey, streakDays: 1 };
  }
  const nextStreak = isYesterday(profile.lastActiveDate, dateKey) ? profile.streakDays + 1 : 1;
  return { ...profile, lastActiveDate: dateKey, streakDays: nextStreak };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return {
        ...state,
        workouts: action.workouts,
        dailyTracker: action.dailyTracker,
        dailyHistory: action.dailyHistory,
        userProfile: action.userProfile,
      };
    case 'logWorkout':
      return (() => {
        const workouts = [action.workout, ...state.workouts];
        const entry: DailyHistoryEntry = state.dailyHistory[action.dateKey] ?? {
          date: action.dateKey,
          caloriesConsumed: state.dailyTracker.caloriesConsumed ?? 0,
          steps: state.dailyTracker.steps ?? 0,
          workouts: 0,
          caloriesBurned: 0,
          duration: 0,
        };
        const duration = (Number(action.workout.duration) || 0);
        const caloriesBurned = Math.round(duration * 6);
        const nextEntry: DailyHistoryEntry = {
          ...entry,
          workouts: entry.workouts + 1,
          duration: entry.duration + duration,
          caloriesBurned: entry.caloriesBurned + caloriesBurned,
        };
        const dailyHistory = { ...state.dailyHistory, [action.dateKey]: nextEntry };

        const prof1 = markActive(state.userProfile, action.dateKey);
        const userProfile: UserProfile = {
          ...prof1,
          totalWorkouts: prof1.totalWorkouts + 1,
        };

        return { ...state, workouts, dailyHistory, userProfile };
      })();
    case 'selectWorkout':
      return { ...state, selectedWorkoutId: action.id };
    case 'patchDailyTracker':
      return (() => {
        const prevSteps = Number(state.dailyTracker.steps || 0);
        const nextSteps = action.patch.steps !== undefined ? Number(action.patch.steps || 0) : prevSteps;
        const deltaSteps = nextSteps - prevSteps;

        const dailyTracker = { ...state.dailyTracker, ...action.patch };
        const entry: DailyHistoryEntry = state.dailyHistory[action.dateKey] ?? {
          date: action.dateKey,
          caloriesConsumed: 0,
          steps: 0,
          workouts: 0,
          caloriesBurned: 0,
          duration: 0,
        };
        const dailyHistory = {
          ...state.dailyHistory,
          [action.dateKey]: {
            ...entry,
            caloriesConsumed: dailyTracker.caloriesConsumed ?? 0,
            steps: dailyTracker.steps ?? 0,
          },
        };
        const prof1 = markActive(state.userProfile, action.dateKey);
        const userProfile = { ...prof1, totalSteps: prof1.totalSteps + deltaSteps };
        return { ...state, dailyTracker, dailyHistory, userProfile };
      })();
    case 'updateUserProfile':
      return { ...state, userProfile: { ...state.userProfile, ...action.patch } };
    case 'rolloverDay':
      return {
        ...state,
        dailyTracker: { date: action.dateKey, caloriesConsumed: 0, steps: 0 },
      };
    default:
      return state;
  }
}

type Props = NativeStackScreenProps<MemberStackParamList, 'MemberHome'>;

export function MemberHomeScreen({ route, navigation }: Props) {
  const [tab, setTab] = useState<MemberTabId>('home');
  const [quickLog, setQuickLog] = useState(false);
  const [dailyTrackerOpen, setDailyTrackerOpen] = useState(false);
  const { user } = useAuth();
  const enableMessaging = useFeatureFlag('enable_member_messaging');
  const enableProgress = useFeatureFlag('enable_progress_tracking');
  const { proposals, getProposalsForMember, setProposalStatus } = useWorkoutProposals();
  const { sendMessage } = useMessaging();
  const { colors } = useTheme();

  const memberId = useMemo(() => {
    if (!user?.id) return 'member-1';
    if (user.id === 'dev-member') return 'member-1';
    return user.id;
  }, [user?.id]);
  const memberRow = useMemo(() => getMemberById(memberId), [memberId]);
  const assignedTrainer = useMemo(() => getTrainerById(memberRow?.assignedTrainerId), [memberRow?.assignedTrainerId]);

  useEffect(() => {
    const initialTab = route.params?.initialTab;
    if (initialTab) setTab(initialTab);
  }, [route.params?.initialTab]);

  useEffect(() => {
    if (tab === 'messages' && !enableMessaging) setTab('home');
    if (tab === 'progress' && !enableProgress) setTab('home');
  }, [enableMessaging, enableProgress, tab]);

  const [state, dispatch] = useReducer(reducer, {
    workouts: [],
    selectedWorkoutId: null,
    dailyTracker: { date: todayKey(), caloriesConsumed: 0, steps: 0 },
    dailyHistory: {},
    userProfile: defaultProfile({ name: user?.name, email: user?.email }),
  });

  const [savedRecIds, setSavedRecIds] = useState<string[]>([]);

  // Mock backend data so UI stays functional without Supabase.
  const caloriesGoal = 2000;
  const caloriesToday = 1240;
  const recentFood: FoodLogListItem[] = [
    { id: 1, foodName: 'Greek yogurt + berries', calories: 220, loggedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 2, foodName: 'Chicken salad wrap', calories: 540, loggedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
    { id: 3, foodName: 'Iced latte', calories: 180, loggedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString() },
  ];

  const dateKey = todayKey();
  useEffect(() => {
    // If app stays open past midnight, reset daily tracker automatically.
    if (state.dailyTracker.date !== dateKey) {
      dispatch({ type: 'rolloverDay', dateKey });
    }
  }, [dateKey, state.dailyTracker.date]);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_SAVED_RECS)
      .then(raw => {
        if (!mounted) return;
        const parsed = raw ? (JSON.parse(raw) as string[]) : [];
        setSavedRecIds(Array.isArray(parsed) ? parsed.filter(Boolean) : []);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_SAVED_RECS, JSON.stringify(savedRecIds)).catch(() => {});
  }, [savedRecIds]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [wRaw, tRaw, hRaw, pRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_WORKOUTS),
          AsyncStorage.getItem(STORAGE_DAILY_TRACKER),
          AsyncStorage.getItem(STORAGE_DAILY_HISTORY),
          AsyncStorage.getItem(STORAGE_USER_PROFILE),
        ]);
        const workouts = (wRaw ? (JSON.parse(wRaw) as Workout[]) : []).filter(Boolean);
        const tracker = tRaw ? (JSON.parse(tRaw) as DailyTracker) : null;
        const dailyHistory = hRaw ? (JSON.parse(hRaw) as Record<string, DailyHistoryEntry>) : {};
        const profileRaw = pRaw ? (JSON.parse(pRaw) as UserProfile) : null;
        const baseProfile = profileRaw
          ? { ...defaultProfile({ name: user?.name, email: user?.email }), ...profileRaw }
          : defaultProfile({ name: user?.name, email: user?.email });
        const userProfile =
          (user?.name && baseProfile.name === 'Member') || (user?.email && !baseProfile.email)
            ? { ...baseProfile, name: user?.name ?? baseProfile.name, email: user?.email ?? baseProfile.email }
            : baseProfile;
        const dailyTracker =
          tracker && tracker.date === todayKey()
            ? tracker
            : { date: todayKey(), caloriesConsumed: 0, steps: 0 };
        if (mounted) dispatch({ type: 'hydrate', workouts, dailyTracker, dailyHistory, userProfile });
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_WORKOUTS, JSON.stringify(state.workouts)).catch(() => {});
  }, [state.workouts]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_DAILY_TRACKER, JSON.stringify(state.dailyTracker)).catch(() => {});
  }, [state.dailyTracker]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_DAILY_HISTORY, JSON.stringify(state.dailyHistory)).catch(() => {});
  }, [state.dailyHistory]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_USER_PROFILE, JSON.stringify(state.userProfile)).catch(() => {});
  }, [state.userProfile]);

  const dailyActivity = useMemo(() => computeDailyActivity(state.workouts, dateKey), [state.workouts, dateKey]);
  const selectedWorkout = useMemo(
    () => (state.selectedWorkoutId ? state.workouts.find(w => w.id === state.selectedWorkoutId) ?? null : null),
    [state.selectedWorkoutId, state.workouts],
  );

  const proposedWorkouts = useMemo(() => {
    const list = getProposalsForMember(memberId);
    return list.map(p => ({
      id: p.id,
      trainerId: p.trainerId,
      workoutName: p.workoutName,
      trainerName: getTrainerById(p.trainerId)?.name ?? assignedTrainer?.name ?? 'Trainer',
      scheduledAt: p.scheduledAt,
      exercises: p.exercises,
      durationMinutes: p.durationMinutes,
      status: p.status,
    }));
  }, [assignedTrainer?.name, getProposalsForMember, memberId, proposals]);

  const notifyTrainer = (text: string) => {
    if (!assignedTrainer?.id) return;
    sendMessage({
      trainerId: assignedTrainer.id,
      memberId,
      fromRole: 'member',
      fromId: memberId,
      text,
    });
  };

  const confirmProposal = (id: string) => {
    setProposalStatus({ id, status: 'confirmed' });
    const p = proposals.find(x => x.id === id);
    if (p) notifyTrainer(`I confirmed "${p.workoutName}" for ${new Date(p.scheduledAt).toLocaleString()}.`);
  };

  const declineProposal = (id: string) => {
    setProposalStatus({ id, status: 'declined' });
    const p = proposals.find(x => x.id === id);
    if (p) notifyTrainer(`I declined "${p.workoutName}" for ${new Date(p.scheduledAt).toLocaleString()}.`);
  };

  const aiRecommendations = useMemo(() => {
    const goal = state.userProfile.goal;
    const workoutCount = state.workouts.length;
    const activityLevel = workoutCount >= 12 ? 'high' : workoutCount >= 4 ? 'medium' : 'low';

    const templates: Array<{
      id: string;
      title: string;
      difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
      durationMinutes: number;
      muscleGroups: string[];
      tags: Array<UserProfile['goal']>;
    }> = [
      {
        id: 'rec-1',
        title: 'Full-Body Strength Circuit',
        difficulty: activityLevel === 'high' ? ('Advanced' as const) : ('Intermediate' as const),
        durationMinutes: 35,
        muscleGroups: ['Legs', 'Back', 'Core'],
        tags: ['build muscle', 'maintain'],
      },
      {
        id: 'rec-2',
        title: 'Low-Impact Cardio + Core',
        difficulty: ('Beginner' as const),
        durationMinutes: 25,
        muscleGroups: ['Core', 'Cardio'],
        tags: ['lose fat', 'maintain'],
      },
      {
        id: 'rec-3',
        title: 'Upper Body Push/Pull',
        difficulty: ('Intermediate' as const),
        durationMinutes: 40,
        muscleGroups: ['Chest', 'Shoulders', 'Back', 'Arms'],
        tags: ['build muscle'],
      },
      {
        id: 'rec-4',
        title: 'Mobility + Recovery Flow',
        difficulty: ('Beginner' as const),
        durationMinutes: 20,
        muscleGroups: ['Hips', 'Hamstrings', 'Shoulders'],
        tags: ['maintain', 'lose fat', 'build muscle'],
      },
      {
        id: 'rec-5',
        title: 'Interval Run (Treadmill/Outdoor)',
        difficulty: activityLevel === 'low' ? ('Beginner' as const) : ('Intermediate' as const),
        durationMinutes: 30,
        muscleGroups: ['Cardio', 'Legs'],
        tags: ['lose fat', 'maintain'],
      },
    ];

    const scored = templates
      .map(t => {
        let score = 0;
        if (t.tags.includes(goal)) score += 5;
        if (activityLevel === 'low' && t.difficulty === 'Beginner') score += 2;
        if (activityLevel === 'high' && t.difficulty === 'Advanced') score += 2;
        if (dailyActivity.totalWorkouts === 0 && t.title.toLowerCase().includes('recovery')) score += 1;
        return { ...t, score };
      })
      .sort((a, b) => b.score - a.score);

    return scored.map(s => ({
      id: s.id,
      title: s.title,
      difficulty: s.difficulty,
      durationMinutes: s.durationMinutes,
      muscleGroups: [...s.muscleGroups],
      saved: savedRecIds.includes(s.id),
    }));
  }, [dailyActivity.totalWorkouts, savedRecIds, state.userProfile.goal, state.workouts.length]);

  const toggleSaveRecommendation = (id: string) => {
    setSavedRecIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [id, ...prev]));
  };

  const startRecommendation = (_id: string) => {
    setTab('workouts');
  };

  const render = () => {
    if (quickLog) {
      return (
        <WorkoutTracking
          onClose={() => setQuickLog(false)}
          onLogWorkout={w => dispatch({ type: 'logWorkout', workout: w, dateKey })}
        />
      );
    }
    switch (tab) {
      case 'home':
        return (
          <Dashboard
            onQuickLog={() => setQuickLog(true)}
            onOpenDailyTracker={() => setDailyTrackerOpen(true)}
            userName={user?.name}
            caloriesToday={caloriesToday}
            caloriesGoal={caloriesGoal}
            recentFood={recentFood}
            loading={false}
            error={null}
            workouts={state.workouts}
            onSelectWorkout={id => dispatch({ type: 'selectWorkout', id })}
            dailyActivity={dailyActivity}
            dailyTracker={state.dailyTracker}
            onUpdateDailyTracker={patch => dispatch({ type: 'patchDailyTracker', patch, dateKey })}
            proposedWorkouts={proposedWorkouts}
            onConfirmProposedWorkout={confirmProposal}
            onDeclineProposedWorkout={declineProposal}
            aiRecommendations={aiRecommendations}
            onStartRecommendation={startRecommendation}
            onToggleSaveRecommendation={toggleSaveRecommendation}
            onOpenTrainerProfile={tid => navigation.navigate('TrainerProfile', { trainerId: tid, memberId })}
          />
        );
      case 'workouts':
        return (
          <WorkoutTracking
            embedded
            onClose={() => setTab('home')}
            onLogWorkout={w => dispatch({ type: 'logWorkout', workout: w, dateKey })}
          />
        );
      case 'messages':
        return (
          <MessagesTab
            memberId={memberId}
            trainerId={assignedTrainer?.id ?? null}
            onOpenTrainerProfile={tid => navigation.navigate('TrainerProfile', { trainerId: tid, memberId })}
          />
        );
      case 'progress':
        return <ProgressTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return (
          <Dashboard
            onQuickLog={() => setQuickLog(true)}
            onOpenDailyTracker={() => setDailyTrackerOpen(true)}
            workouts={state.workouts}
            onSelectWorkout={id => dispatch({ type: 'selectWorkout', id })}
            dailyActivity={dailyActivity}
            dailyTracker={state.dailyTracker}
            onUpdateDailyTracker={patch => dispatch({ type: 'patchDailyTracker', patch, dateKey })}
            proposedWorkouts={proposedWorkouts}
            onConfirmProposedWorkout={confirmProposal}
            onDeclineProposedWorkout={declineProposal}
            aiRecommendations={aiRecommendations}
            onStartRecommendation={startRecommendation}
            onToggleSaveRecommendation={toggleSaveRecommendation}
            onOpenTrainerProfile={tid => navigation.navigate('TrainerProfile', { trainerId: tid, memberId })}
          />
        );
    }
  };

  return (
    <MemberDataProvider
      value={{
        workouts: state.workouts,
        dailyTracker: state.dailyTracker,
        dailyActivity,
        dailyHistory: state.dailyHistory,
        userProfile: state.userProfile,
        updateUserProfile: patch => dispatch({ type: 'updateUserProfile', patch }),
        updateDailyTracker: patch => dispatch({ type: 'patchDailyTracker', patch, dateKey }),
        logWorkout: workout => dispatch({ type: 'logWorkout', workout, dateKey }),
        selectWorkout: id => dispatch({ type: 'selectWorkout', id }),
      }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={{ flex: 1 }}>
          {tab === 'messages' ? (
            <View style={{ flex: 1, padding: 20, paddingBottom: 32 }}>{render()}</View>
          ) : (
            <ScrollView
              contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
              keyboardShouldPersistTaps="handled"
            >
              {render()}
            </ScrollView>
          )}
          {!quickLog && <MemberBottomNav active={tab} onChange={setTab} />}
        </View>

        <Modal
          visible={!!selectedWorkout}
          transparent
          animationType="fade"
          onRequestClose={() => dispatch({ type: 'selectWorkout', id: null })}
        >
          <Pressable
            onPress={() => dispatch({ type: 'selectWorkout', id: null })}
            style={{ flex: 1, backgroundColor: colors.overlay, padding: 20, justifyContent: 'center' }}
          >
            <Pressable
              onPress={() => {}}
              style={{
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text }}>Workout Details</Text>
                <Pressable onPress={() => dispatch({ type: 'selectWorkout', id: null })} style={{ padding: 6 }}>
                  <Ionicons name="close" size={20} color={colors.textMuted} />
                </Pressable>
              </View>

            {selectedWorkout ? (
              <View style={{ marginTop: 12, gap: 8 }}>
                <Text style={{ color: colors.textMuted }}>
                  Type: <Text style={{ color: colors.text, fontWeight: '800' }}>{selectedWorkout.type}</Text>
                </Text>
                <Text style={{ color: colors.textMuted }}>
                  Date: <Text style={{ color: colors.text, fontWeight: '800' }}>{new Date(selectedWorkout.date).toLocaleString()}</Text>
                </Text>
                <Text style={{ color: colors.textMuted }}>
                  Duration: <Text style={{ color: colors.text, fontWeight: '800' }}>{selectedWorkout.duration} min</Text>
                </Text>
                <Text style={{ color: colors.textMuted }}>
                  Summary: <Text style={{ color: colors.text, fontWeight: '800' }}>{selectedWorkout.summary}</Text>
                </Text>

                <View style={{ marginTop: 10, padding: 12, borderRadius: 12, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ fontWeight: '800', marginBottom: 6, color: colors.text }}>All data (raw)</Text>
                  <Text style={{ fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }), color: colors.textMuted }}>
                    {JSON.stringify(selectedWorkout.details, null, 2)}
                  </Text>
                </View>
              </View>
            ) : null}
            </Pressable>
          </Pressable>
        </Modal>

        <Modal
          visible={dailyTrackerOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setDailyTrackerOpen(false)}
        >
          <Pressable
            onPress={() => setDailyTrackerOpen(false)}
            style={{ flex: 1, backgroundColor: colors.overlay, padding: 20, justifyContent: 'center' }}
          >
            <Pressable
              onPress={() => {}}
              style={{
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text }}>Daily Tracker</Text>
                <Pressable onPress={() => setDailyTrackerOpen(false)} style={{ padding: 6 }}>
                  <Ionicons name="close" size={20} color={colors.textMuted} />
                </Pressable>
              </View>

              <View style={{ marginTop: 12, gap: 10 }}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text }}>Calories consumed</Text>
                    <TextInput
                      value={String(state.dailyTracker.caloriesConsumed ?? 0)}
                      onChangeText={t =>
                        dispatch({ type: 'patchDailyTracker', patch: { caloriesConsumed: Number(t || 0) }, dateKey })
                      }
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      style={{
                        marginTop: 6,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 12,
                        padding: 12,
                        backgroundColor: colors.background,
                        color: colors.text,
                      }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text }}>Steps</Text>
                    <TextInput
                      value={String(state.dailyTracker.steps ?? 0)}
                      onChangeText={t =>
                        dispatch({ type: 'patchDailyTracker', patch: { steps: Number(t || 0) }, dateKey })
                      }
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      style={{
                        marginTop: 6,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 12,
                        padding: 12,
                        backgroundColor: colors.background,
                        color: colors.text,
                      }}
                    />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                  <Pressable
                    onPress={() => dispatch({ type: 'patchDailyTracker', patch: { steps: (state.dailyTracker.steps ?? 0) + 500 }, dateKey })}
                    style={({ pressed }) => ({
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: '#eff6ff',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#bfdbfe',
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Text style={{ fontWeight: '900', color: colors.primary }}>+500 steps</Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      dispatch({
                        type: 'patchDailyTracker',
                        patch: { caloriesConsumed: (state.dailyTracker.caloriesConsumed ?? 0) + 250 },
                        dateKey,
                      })
                    }
                    style={({ pressed }) => ({
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: '#fff7ed',
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#fed7aa',
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Text style={{ fontWeight: '900', color: '#c2410c' }}>+250 cal</Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={() => setDailyTrackerOpen(false)}
                  style={({ pressed }) => ({
                    marginTop: 8,
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: 'center',
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ color: '#fff', fontWeight: '900' }}>Done</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </MemberDataProvider>
  );
}

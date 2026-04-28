import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../context/ThemeContext';
import { CircularProgressRing } from './CircularProgressRing';

export type WorkoutType = 'strength' | 'cardio' | 'yoga' | 'custom';

export type Workout = {
  id: string;
  type: WorkoutType;
  date: string;
  duration: number;
  details: Record<string, any>;
  summary: string;
};

export type DailyActivity = {
  date: string;
  totalWorkouts: number;
  totalDuration: number;
  caloriesBurned: number;
};

export type DailyTracker = {
  date: string;
  caloriesConsumed: number;
  steps: number;
};

export type FoodLogListItem = {
  id: number;
  foodName: string;
  calories: number;
  loggedAt: string;
};

type Props = {
  onQuickLog: () => void;
  onOpenDailyTracker: () => void;
  userName?: string;
  caloriesToday?: number;
  caloriesGoal?: number;
  recentFood?: FoodLogListItem[];
  loading?: boolean;
  error?: string | null;
  workouts: Workout[];
  onSelectWorkout: (id: string) => void;
  dailyActivity: DailyActivity;
  dailyTracker: DailyTracker;
  onUpdateDailyTracker: (patch: Partial<Pick<DailyTracker, 'caloriesConsumed' | 'steps'>>) => void;
};

export function Dashboard({
  onQuickLog,
  onOpenDailyTracker,
  userName,
  caloriesToday = 0,
  caloriesGoal = 2000,
  recentFood = [],
  loading = false,
  error = null,
  workouts,
  onSelectWorkout,
  dailyActivity,
  dailyTracker,
  onUpdateDailyTracker,
}: Props) {
  const { colors } = useTheme();
  const stats = {
    steps: dailyTracker.steps,
    stepsGoal: 10000,
    calories: caloriesToday,
    caloriesGoal,
    activeMinutes: dailyActivity.totalDuration,
    activeGoal: 60,
  };
  const recentWorkouts = workouts.slice(0, 8);

  return (
    <View style={{ gap: 24 }}>
      <View>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>
          {userName ? `Welcome back, ${userName}!` : 'Welcome back!'}
        </Text>
        <Text style={{ color: colors.textMuted, marginTop: 4 }}>
          Calories today: <Text style={{ fontWeight: '800', color: colors.text }}>{caloriesToday}</Text> /{' '}
          <Text style={{ fontWeight: '800', color: colors.text }}>{caloriesGoal}</Text>
        </Text>
      </View>

      <View
        style={{
          borderRadius: 16,
          padding: 20,
          backgroundColor: '#ecfdf5',
          borderWidth: 1,
          borderColor: '#d1fae5',
        }}
      >
        <Text style={{ marginBottom: 16, fontWeight: '600', color: colors.text }}>
          Today&apos;s Activity
        </Text>
        <Text style={{ color: colors.textMuted, marginBottom: 12 }}>
          Workouts: <Text style={{ fontWeight: '900', color: colors.text }}>{dailyActivity.totalWorkouts}</Text>
          {'  '}•{'  '}Duration:{' '}
          <Text style={{ fontWeight: '900', color: colors.text }}>{dailyActivity.totalDuration} min</Text>
        </Text>
        {error ? (
          <View
            style={{
              marginBottom: 12,
              padding: 12,
              borderRadius: 12,
              backgroundColor: '#fef2f2',
              borderWidth: 1,
              borderColor: '#fecaca',
            }}
          >
            <Text style={{ color: colors.danger }}>{error}</Text>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <CircularProgressRing
            value={stats.steps}
            max={stats.stepsGoal}
            label="Steps"
            accent="#0ea5e9"
            icon={<Ionicons name="walk" size={18} color={colors.primary} />}
          />
          <CircularProgressRing
            value={stats.calories}
            max={stats.caloriesGoal}
            label="Calories"
            accent="#f97316"
            icon={<Ionicons name="flame" size={18} color="#ea580c" />}
          />
          <CircularProgressRing
            value={stats.activeMinutes}
            max={stats.activeGoal}
            label="Active Min"
            accent="#10b981"
            icon={<Ionicons name="trending-up" size={18} color="#059669" />}
          />
        </View>
        {loading ? (
          <View style={{ marginTop: 12, alignItems: 'center' }}>
            <ActivityIndicator />
          </View>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable
          onPress={onQuickLog}
          style={{
            flex: 1,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: colors.primary,
          }}
        >
          <Ionicons name="barbell" size={20} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '600' }}>Log Workout</Text>
        </Pressable>
        <Pressable
          onPress={onOpenDailyTracker}
          style={{
            flex: 1,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
          }}
        >
          <Ionicons name="checkbox" size={20} color={colors.text} />
          <Text style={{ fontWeight: '600', color: colors.text }}>Daily Tracker</Text>
        </Pressable>
      </View>

      <View>
        <Text style={{ fontWeight: '600', marginBottom: 12, color: colors.text }}>
          Recent Food Logs
        </Text>
        {recentFood.length === 0 ? (
          <View
            style={{
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
            }}
          >
            <Text style={{ color: colors.textMuted }}>
              No food logs yet. Add a row in Supabase `food_logs` to see it here.
            </Text>
          </View>
        ) : (
          recentFood.map(item => (
            <View
              key={item.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 8,
                backgroundColor: colors.card,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: '#ffedd5',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="restaurant" size={20} color="#ea580c" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: colors.text }} numberOfLines={1}>
                    {item.foodName}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted }} numberOfLines={1}>
                    {new Date(item.loggedAt).toLocaleString()}
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontWeight: '700', color: colors.text }}>{item.calories} cal</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View>
        <Text style={{ fontWeight: '600', marginBottom: 12, color: colors.text }}>
          Recent Workouts
        </Text>
        {recentWorkouts.length === 0 ? (
          <View
            style={{
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
            }}
          >
            <Text style={{ color: colors.textMuted }}>No workouts logged yet.</Text>
          </View>
        ) : (
          recentWorkouts.map((w, idx) => {
            const isMostRecent = idx === 0;
            const when = new Date(w.date).toLocaleString();
            const icon =
              w.type === 'strength'
                ? ('barbell' as const)
                : w.type === 'cardio'
                  ? ('timer' as const)
                  : w.type === 'yoga'
                    ? ('leaf' as const)
                    : ('flash' as const);
            const tint =
              w.type === 'strength'
                ? '#7c3aed'
                : w.type === 'cardio'
                  ? '#2563eb'
                  : w.type === 'yoga'
                    ? '#059669'
                    : '#ea580c';

            return (
              <Pressable
                key={w.id}
                onPress={() => onSelectWorkout(w.id)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 14,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: isMostRecent ? tint : colors.border,
                  marginBottom: 8,
                  backgroundColor: isMostRecent ? tint + '12' : colors.card,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: tint + '22',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name={icon} size={20} color={tint} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '800', color: colors.text }} numberOfLines={1}>
                      {w.type.toUpperCase()}
                      {isMostRecent ? ' • Latest' : ''}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textMuted }} numberOfLines={1}>
                      {w.summary}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }} numberOfLines={1}>
                      {when}
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontWeight: '800', color: colors.text }}>{w.duration} min</Text>
                </View>
              </Pressable>
            );
          })
        )}
      </View>
    </View>
  );
}

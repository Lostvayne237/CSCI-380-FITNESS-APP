import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type ChallengeDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type ChallengeCategory = 'Strength' | 'Cardio' | 'Flexibility' | 'Endurance' | 'Core';
export type ChallengeType = 'reps' | 'time' | 'distance';
export type ChallengeDeadline = 'daily' | 'weekly' | 'ongoing';

export type Challenge = {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  target: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  pointsReward: number;
  deadline?: ChallengeDeadline;
  completedBy: string[];
  completedAtByUserId?: Record<string, string>; // ISO
};

type ChallengesContextValue = {
  challenges: Challenge[];
  markComplete: (args: { challengeId: string; userId: string }) => { ok: true; pointsAwarded: number } | { ok: false };
  isCompleted: (challengeId: string, userId: string) => boolean;
  getCompletedAt: (challengeId: string, userId: string) => string | null;
  hasIncompleteDaily: (userId: string) => boolean;
};

const STORAGE_KEY = 'challenges:v1';

const seed: Challenge[] = [
  { id: 'c1', title: '20 Push-Ups', description: 'Complete 20 push-ups in one set.', type: 'reps', target: '20 reps', category: 'Strength', difficulty: 'Beginner', pointsReward: 50, deadline: 'daily', completedBy: [] },
  { id: 'c2', title: '60-Second Plank', description: 'Hold a plank for 60 seconds.', type: 'time', target: '60 sec', category: 'Core', difficulty: 'Intermediate', pointsReward: 75, deadline: 'weekly', completedBy: [] },
  { id: 'c3', title: '10 Pull-Ups', description: 'Complete 10 pull-ups.', type: 'reps', target: '10 reps', category: 'Strength', difficulty: 'Advanced', pointsReward: 100, deadline: 'ongoing', completedBy: [] },
  { id: 'c4', title: '1 Mile Run', description: 'Run 1 mile (outdoor or treadmill).', type: 'distance', target: '1 mile', category: 'Cardio', difficulty: 'Intermediate', pointsReward: 80, deadline: 'weekly', completedBy: [] },
  { id: 'c5', title: '50 Squats', description: 'Complete 50 bodyweight squats.', type: 'reps', target: '50 reps', category: 'Strength', difficulty: 'Beginner', pointsReward: 50, deadline: 'daily', completedBy: [] },
  { id: 'c6', title: '5-Minute Jump Rope', description: 'Jump rope for 5 minutes total.', type: 'time', target: '5 min', category: 'Cardio', difficulty: 'Beginner', pointsReward: 60, deadline: 'daily', completedBy: [] },
  { id: 'c7', title: '30 Burpees', description: 'Complete 30 burpees.', type: 'reps', target: '30 reps', category: 'Cardio', difficulty: 'Advanced', pointsReward: 120, deadline: 'weekly', completedBy: [] },
  { id: 'c8', title: '2-Minute Wall Sit', description: 'Hold a wall sit for 2 minutes.', type: 'time', target: '120 sec', category: 'Endurance', difficulty: 'Intermediate', pointsReward: 70, deadline: 'weekly', completedBy: [] },
];

const ChallengesContext = createContext<ChallengesContextValue | undefined>(undefined);

export function ChallengesProvider({ children }: { children: React.ReactNode }) {
  const [challenges, setChallenges] = useState<Challenge[]>(seed);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as Challenge[]) : null;
        if (!mounted || !parsed) return;
        setChallenges(Array.isArray(parsed) ? parsed.filter(Boolean) : seed);
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(challenges)).catch(() => {});
  }, [challenges]);

  const isCompleted = useCallback(
    (challengeId: string, userId: string) => {
      const c = challenges.find(x => x.id === challengeId);
      return !!c?.completedBy?.includes(userId);
    },
    [challenges],
  );

  const getCompletedAt = useCallback(
    (challengeId: string, userId: string) => {
      const c = challenges.find(x => x.id === challengeId);
      return c?.completedAtByUserId?.[userId] ?? null;
    },
    [challenges],
  );

  const markComplete = useCallback(
    ({ challengeId, userId }: { challengeId: string; userId: string }) => {
      const c = challenges.find(x => x.id === challengeId);
      if (!c) return { ok: false as const };
      if (c.completedBy.includes(userId)) return { ok: false as const };
      const now = new Date().toISOString();
      setChallenges(prev =>
        prev.map(x =>
          x.id !== challengeId
            ? x
            : {
                ...x,
                completedBy: [...x.completedBy, userId],
                completedAtByUserId: { ...(x.completedAtByUserId ?? {}), [userId]: now },
              },
        ),
      );
      return { ok: true as const, pointsAwarded: c.pointsReward };
    },
    [challenges],
  );

  const hasIncompleteDaily = useCallback(
    (userId: string) => {
      const daily = challenges.filter(c => c.deadline === 'daily');
      return daily.some(c => !c.completedBy.includes(userId));
    },
    [challenges],
  );

  const value = useMemo<ChallengesContextValue>(
    () => ({ challenges, markComplete, isCompleted, getCompletedAt, hasIncompleteDaily }),
    [challenges, getCompletedAt, hasIncompleteDaily, isCompleted, markComplete],
  );

  return <ChallengesContext.Provider value={value}>{children}</ChallengesContext.Provider>;
}

export function useChallenges() {
  const ctx = useContext(ChallengesContext);
  if (!ctx) throw new Error('useChallenges must be used within ChallengesProvider');
  return ctx;
}


import { createContext, useContext } from 'react';
import type { DailyActivity, DailyTracker, Workout } from '../components/member/Dashboard';

export type UserProfile = {
  name: string;
  email: string;
  avatarUri: string | null;
  age: number;
  weight?: number | null;
  height?: number | null;
  goal: 'lose fat' | 'build muscle' | 'maintain';
  totalWorkouts: number;
  totalSteps: number;
  streakDays: number;
  notificationsEnabled: boolean;
  lastActiveDate: string | null;
};

export type DailyHistoryEntry = {
  date: string; // YYYY-MM-DD
  caloriesConsumed: number;
  steps: number;
  workouts: number;
  caloriesBurned: number;
  duration: number;
};

export type MemberDataContextValue = {
  workouts: Workout[];
  dailyTracker: DailyTracker;
  dailyActivity: DailyActivity;
  dailyHistory: Record<string, DailyHistoryEntry>;
  userProfile: UserProfile;
  updateUserProfile: (
    patch: Partial<Pick<UserProfile, 'name' | 'email' | 'avatarUri' | 'age' | 'weight' | 'height' | 'goal' | 'notificationsEnabled'>>,
  ) => void;
  updateDailyTracker: (patch: Partial<Pick<DailyTracker, 'caloriesConsumed' | 'steps'>>) => void;
  logWorkout: (workout: Workout) => void;
  selectWorkout: (id: string | null) => void;
};

const MemberDataContext = createContext<MemberDataContextValue | undefined>(undefined);

export function MemberDataProvider({
  value,
  children,
}: {
  value: MemberDataContextValue;
  children: React.ReactNode;
}) {
  return <MemberDataContext.Provider value={value}>{children}</MemberDataContext.Provider>;
}

export function useMemberData() {
  const ctx = useContext(MemberDataContext);
  if (!ctx) throw new Error('useMemberData must be used within MemberDataProvider');
  return ctx;
}


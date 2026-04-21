import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MemberBottomNav, type MemberTabId } from '../../components/member/MemberBottomNav';
import { Dashboard, type FoodLogListItem } from '../../components/member/Dashboard';
import { ProfileTab } from '../../components/member/ProfileTab';
import { ProgressTab } from '../../components/member/ProgressTab';
import { WorkoutTracking } from '../../components/member/WorkoutTracking';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

export function MemberHomeScreen() {
  const [tab, setTab] = useState<MemberTabId>('home');
  const [quickLog, setQuickLog] = useState(false);
  const { user } = useAuth();

  // Mock backend data so UI stays functional without Supabase.
  const caloriesGoal = 2000;
  const caloriesToday = 1240;
  const recentFood: FoodLogListItem[] = [
    { id: 1, foodName: 'Greek yogurt + berries', calories: 220, loggedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 2, foodName: 'Chicken salad wrap', calories: 540, loggedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
    { id: 3, foodName: 'Iced latte', calories: 180, loggedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString() },
  ];

  const render = () => {
    if (quickLog) {
      return <WorkoutTracking onClose={() => setQuickLog(false)} />;
    }
    switch (tab) {
      case 'home':
        return (
          <Dashboard
            onQuickLog={() => setQuickLog(true)}
            userName={user?.name}
            caloriesToday={caloriesToday}
            caloriesGoal={caloriesGoal}
            recentFood={recentFood}
            loading={false}
            error={null}
          />
        );
      case 'workouts':
        return <WorkoutTracking embedded onClose={() => setTab('home')} />;
      case 'progress':
        return <ProgressTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <Dashboard onQuickLog={() => setQuickLog(true)} />;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {render()}
        </ScrollView>
        {!quickLog && <MemberBottomNav active={tab} onChange={setTab} />}
      </View>
    </SafeAreaView>
  );
}

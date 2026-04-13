import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Dashboard } from '../../components/member/Dashboard';
import { MemberBottomNav, type MemberTabId } from '../../components/member/MemberBottomNav';
import { ProfileTab } from '../../components/member/ProfileTab';
import { ProgressTab } from '../../components/member/ProgressTab';
import { WorkoutTracking } from '../../components/member/WorkoutTracking';
import { colors } from '../../theme/colors';

export function MemberHomeScreen() {
  const [tab, setTab] = useState<MemberTabId>('home');
  const [quickLog, setQuickLog] = useState(false);

  const render = () => {
    if (quickLog) {
      return <WorkoutTracking onClose={() => setQuickLog(false)} />;
    }
    switch (tab) {
      case 'home':
        return <Dashboard onQuickLog={() => setQuickLog(true)} />;
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

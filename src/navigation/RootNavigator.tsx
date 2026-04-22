import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { AdminNavigator } from './AdminNavigator';
import { MemberNavigator } from './MemberNavigator';
import { TrainerNavigator } from './TrainerNavigator';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { user, profile, isHydrated, loading } = useAuth();

  if (!isHydrated || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const effectiveRole = profile?.role ?? user?.role ?? null;
  const stackKey = user && effectiveRole ? `app-${effectiveRole}-${user.id}` : 'auth';

  return (
    <Stack.Navigator key={stackKey} screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : effectiveRole === 'member' ? (
        <Stack.Screen name="Member" component={MemberNavigator} />
      ) : effectiveRole === 'trainer' ? (
        <Stack.Screen name="Trainer" component={TrainerNavigator} />
      ) : (
        <Stack.Screen name="Admin" component={AdminNavigator} />
      )}
    </Stack.Navigator>
  );
}

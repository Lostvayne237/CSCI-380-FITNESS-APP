import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { AdminNavigator } from './AdminNavigator';
import { MemberNavigator } from './MemberNavigator';
import { TrainerNavigator } from './TrainerNavigator';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { user, isHydrated } = useAuth();

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const stackKey = user ? `app-${user.role}-${user.id}` : 'auth';

  return (
    <Stack.Navigator key={stackKey} screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : user.role === 'member' ? (
        <Stack.Screen name="Member" component={MemberNavigator} />
      ) : user.role === 'trainer' ? (
        <Stack.Screen name="Trainer" component={TrainerNavigator} />
      ) : (
        <Stack.Screen name="Admin" component={AdminNavigator} />
      )}
    </Stack.Navigator>
  );
}

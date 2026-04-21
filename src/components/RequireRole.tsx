import { type ReactNode } from 'react';
import { View, ActivityIndicator } from 'react-native';

import { useAuth, type UserRole } from '../context/AuthContext';
import { UnauthorizedScreen } from '../screens/auth/UnauthorizedScreen';
import { AuthNavigator } from '../navigation/AuthNavigator';

type Props = {
  allow: UserRole[];
  children: ReactNode;
};

export function RequireRole({ allow, children }: Props) {
  const { user, isHydrated, loading } = useAuth();

  if (!isHydrated || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) return <AuthNavigator />;
  if (!allow.includes(user.role)) return <UnauthorizedScreen />;
  return <>{children}</>;
}


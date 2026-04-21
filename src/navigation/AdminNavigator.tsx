import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AdminHomeScreen } from '../screens/admin/AdminHomeScreen';
import { AnalyticsScreen } from '../screens/admin/AnalyticsScreen';
import { SystemSettingsScreen } from '../screens/admin/SystemSettingsScreen';
import { TrainerManagementScreen } from '../screens/admin/TrainerManagementScreen';
import { UserManagementScreen } from '../screens/admin/UserManagementScreen';
import { RequireRole } from '../components/RequireRole';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export function AdminNavigator() {
  return (
    <RequireRole allow={['admin']}>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          tabBarActiveTintColor: colors.accentPurple,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            borderTopColor: colors.border,
            backgroundColor: colors.card,
          },
        }}
      >
        <Tab.Screen
          name="AdminHome"
          component={AdminHomeScreen}
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => <Ionicons name="grid" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Users"
          component={UserManagementScreen}
          options={{
            title: 'Users',
            tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Trainers"
          component={TrainerManagementScreen}
          options={{
            title: 'Trainers',
            tabBarIcon: ({ color, size }) => <Ionicons name="barbell" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SystemSettingsScreen}
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} />,
          }}
        />
      </Tab.Navigator>
    </RequireRole>
  );
}

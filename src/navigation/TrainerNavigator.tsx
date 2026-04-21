import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { ClientsStack } from './ClientsStack';
import { SessionSchedulerScreen } from '../screens/trainer/SessionSchedulerScreen';
import { TrainerHomeScreen } from '../screens/trainer/TrainerHomeScreen';
import { TrainerMessagingScreen } from '../screens/trainer/TrainerMessagingScreen';
import { WorkoutBuilderScreen } from '../screens/trainer/WorkoutBuilderScreen';
import { RequireRole } from '../components/RequireRole';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export function TrainerNavigator() {
  return (
    <RequireRole allow={['trainer', 'admin']}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            borderTopColor: colors.border,
            backgroundColor: colors.card,
          },
        }}
      >
        <Tab.Screen
          name="TrainerHome"
          component={TrainerHomeScreen}
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Clients"
          component={ClientsStack}
          options={{
            title: 'Clients',
            headerShown: false,
            tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Workouts"
          component={WorkoutBuilderScreen}
          options={{
            title: 'Workouts',
            tabBarIcon: ({ color, size }) => <Ionicons name="barbell" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Schedule"
          component={SessionSchedulerScreen}
          options={{
            title: 'Schedule',
            tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} />,
          }}
        />
        <Tab.Screen
          name="Messages"
          component={TrainerMessagingScreen}
          options={{
            title: 'Messages',
            tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" color={color} size={size} />,
            tabBarBadge: 3,
          }}
        />
      </Tab.Navigator>
    </RequireRole>
  );
}

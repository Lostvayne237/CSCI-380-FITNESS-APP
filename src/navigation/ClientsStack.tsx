import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ClientDetailScreen } from '../screens/trainer/ClientDetailScreen';
import { ClientRosterScreen } from '../screens/trainer/ClientRosterScreen';
import { colors } from '../theme/colors';

export type ClientsStackParamList = {
  ClientRoster: undefined;
  ClientDetail: { id: string };
};

const Stack = createNativeStackNavigator<ClientsStackParamList>();

export function ClientsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="ClientRoster"
        component={ClientRosterScreen}
        options={{ title: 'Clients' }}
      />
      <Stack.Screen
        name="ClientDetail"
        component={ClientDetailScreen}
        options={{ title: 'Client' }}
      />
    </Stack.Navigator>
  );
}

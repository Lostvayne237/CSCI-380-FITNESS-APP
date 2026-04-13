import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MemberHomeScreen } from '../screens/member/MemberHomeScreen';

const Stack = createNativeStackNavigator();

export function MemberNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MemberHome" component={MemberHomeScreen} />
    </Stack.Navigator>
  );
}

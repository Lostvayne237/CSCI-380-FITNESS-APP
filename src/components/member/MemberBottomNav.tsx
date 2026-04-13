import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';

export type MemberTabId = 'home' | 'workouts' | 'progress' | 'profile';

type Props = {
  active: MemberTabId;
  onChange: (tab: MemberTabId) => void;
};

const tabs: { id: MemberTabId; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'workouts', label: 'Workouts', icon: 'barbell' },
  { id: 'progress', label: 'Progress', icon: 'trending-up' },
  { id: 'profile', label: 'Profile', icon: 'person' },
];

export function MemberBottomNav({ active, onChange }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.card,
        paddingBottom: 8,
        paddingTop: 8,
        justifyContent: 'space-around',
      }}
    >
      {tabs.map(tab => {
        const selected = active === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={{ alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4 }}
          >
            <Ionicons
              name={tab.icon}
              size={24}
              color={selected ? colors.primary : colors.textMuted}
            />
            <Text
              style={{
                fontSize: 11,
                marginTop: 4,
                color: selected ? colors.primary : colors.textMuted,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

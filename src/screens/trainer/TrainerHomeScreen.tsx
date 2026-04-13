import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ScreenHeader } from '../../components/ScreenHeader';
import { colors } from '../../theme/colors';

const stats = [
  { label: 'Active Clients', value: '24', icon: 'people' as const, tint: '#2563eb' },
  { label: 'Sessions This Week', value: '18', icon: 'calendar' as const, tint: '#059669' },
  { label: 'Avg Client Progress', value: '+12%', icon: 'trending-up' as const, tint: '#7c3aed' },
];

const upcoming = [
  { id: '1', client: 'Emma Wilson', time: '9:00 AM', type: 'Strength Training', letter: 'E', status: 'confirmed' },
  { id: '2', client: 'Sarah Miller', time: '10:30 AM', type: 'Cardio & HIIT', letter: 'S', status: 'confirmed' },
  { id: '3', client: 'Lisa Anderson', time: '2:00 PM', type: 'Flexibility & Core', letter: 'L', status: 'pending' },
];

const recent = [
  { client: 'Emma Wilson', action: 'Completed workout', detail: 'Upper Body Strength', time: '2h ago', tag: '+2kg PR' },
  { client: 'Michael Brown', action: 'Logged nutrition', detail: 'On track', time: '3h ago' },
  { client: 'Sarah Miller', action: 'Sent message', detail: 'Question about form…', time: '5h ago' },
];

export function TrainerHomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <ScreenHeader title="Welcome back, Mike! 👋" subtitle="You have 3 sessions scheduled for today" />

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {stats.map(s => (
            <View
              key={s.label}
              style={{
                flexGrow: 1,
                flexBasis: '30%',
                minWidth: 100,
                borderRadius: 14,
                padding: 14,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: s.tint + '22',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}
              >
                <Ionicons name={s.icon} size={22} color={s.tint} />
              </View>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>{s.label}</Text>
              <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 4 }}>{s.value}</Text>
            </View>
          ))}
        </View>

        <View
          style={{
            marginTop: 18,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              padding: 14,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontWeight: '800', color: colors.text }}>Today&apos;s Sessions</Text>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Schedule</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </Pressable>
          </View>
          {upcoming.map(s => (
            <View
              key={s.id}
              style={{
                padding: 14,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '800' }}>{s.letter}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontWeight: '700', color: colors.text }}>{s.client}</Text>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 999,
                      backgroundColor: s.status === 'confirmed' ? '#dcfce7' : '#fef9c3',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '700',
                        color: s.status === 'confirmed' ? '#166534' : '#854d0e',
                      }}
                    >
                      {s.status}
                    </Text>
                  </View>
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>{s.type}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="time-outline" size={16} color={colors.primary} />
                  <Text style={{ fontWeight: '800', color: colors.primary }}>{s.time}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View
          style={{
            marginTop: 18,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              padding: 14,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontWeight: '800', color: colors.text }}>Recent Client Activity</Text>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Clients</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </Pressable>
          </View>
          {recent.map((r, i) => (
            <View
              key={i}
              style={{
                padding: 14,
                borderBottomWidth: i === recent.length - 1 ? 0 : 1,
                borderBottomColor: colors.border,
                flexDirection: 'row',
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '800' }}>{r.client.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: colors.text }}>
                  {r.client}{' '}
                  <Text style={{ fontWeight: '400', color: colors.textMuted }}>• {r.action}</Text>
                </Text>
                <Text style={{ color: colors.textMuted, marginTop: 4 }}>{r.detail}</Text>
                {r.tag ? (
                  <View style={{ alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: '#dcfce7' }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#166534' }}>{r.tag}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={{ fontSize: 11, color: colors.textMuted }}>{r.time}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

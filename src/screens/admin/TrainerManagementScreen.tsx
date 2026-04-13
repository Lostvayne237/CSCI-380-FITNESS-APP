import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ScreenHeader } from '../../components/ScreenHeader';
import { colors } from '../../theme/colors';

type TStatus = 'approved' | 'pending' | 'suspended';

type Trainer = {
  id: string;
  name: string;
  email: string;
  status: TStatus;
  clients: number;
  sessions: number;
  revenue: number;
  joinDate: string;
  notes?: string;
};

const trainers: Trainer[] = [
  { id: '1', name: 'Mike Johnson', email: 'mike@fitpro.com', status: 'approved', clients: 24, sessions: 187, revenue: 12450, joinDate: '2025-11-15' },
  { id: '2', name: 'Alex Rodriguez', email: 'alex@fitpro.com', status: 'approved', clients: 18, sessions: 142, revenue: 9680, joinDate: '2025-12-03' },
  { id: '3', name: 'James Chen', email: 'james@email.com', status: 'pending', clients: 0, sessions: 0, revenue: 0, joinDate: '2026-04-08', notes: 'Certs submitted' },
  { id: '4', name: 'Tom Wilson', email: 'tom@email.com', status: 'suspended', clients: 8, sessions: 45, revenue: 3200, joinDate: '2026-02-14', notes: 'Under review' },
];

export function TrainerManagementScreen() {
  const [filter, setFilter] = useState<'all' | TStatus>('all');
  const [selected, setSelected] = useState<Trainer | null>(null);

  const filtered = useMemo(() => {
    return trainers.filter(t => (filter === 'all' ? true : t.status === filter));
  }, [filter]);

  const pill = (status: TStatus) => {
    const map: Record<TStatus, { bg: string; fg: string; label: string; icon: keyof typeof Ionicons.glyphMap }> = {
      approved: { bg: '#dcfce7', fg: '#166534', label: 'Approved', icon: 'checkmark-circle' },
      pending: { bg: '#fef9c3', fg: '#854d0e', label: 'Pending', icon: 'time' },
      suspended: { bg: '#fee2e2', fg: '#b91c1c', label: 'Suspended', icon: 'close-circle' },
    };
    const m = map[status];
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: m.bg }}>
        <Ionicons name={m.icon} size={14} color={m.fg} />
        <Text style={{ color: m.fg, fontWeight: '900', fontSize: 11 }}>{m.label}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <ScreenHeader title="Trainer Management" subtitle="Review applications and trainer accounts" />

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['all', 'approved', 'pending', 'suspended'] as const).map(f => (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: filter === f ? colors.accentPurple : '#f1f5f9',
                }}
              >
                <Text style={{ fontWeight: '900', color: filter === f ? '#fff' : colors.text }}>
                  {f === 'all' ? 'All' : f}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {filtered.map(t => (
          <Pressable
            key={t.id}
            onPress={() => setSelected(t)}
            style={{
              marginTop: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              padding: 14,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <View style={{ flexDirection: 'row', gap: 12, flex: 1 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '900' }}>{t.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '900', color: colors.text }}>{t.name}</Text>
                  <Text style={{ color: colors.textMuted }}>{t.email}</Text>
                  <View style={{ marginTop: 8 }}>{pill(t.status)}</View>
                  {t.notes ? <Text style={{ color: colors.textMuted, marginTop: 8 }}>{t.notes}</Text> : null}
                </View>
              </View>
            </View>

            {t.status === 'approved' ? (
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <View style={{ flex: 1, borderRadius: 12, backgroundColor: '#eff6ff', padding: 10, alignItems: 'center' }}>
                  <Ionicons name="people" size={18} color={colors.primary} />
                  <Text style={{ fontWeight: '900', marginTop: 6 }}>{t.clients}</Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>Clients</Text>
                </View>
                <View style={{ flex: 1, borderRadius: 12, backgroundColor: '#ecfdf5', padding: 10, alignItems: 'center' }}>
                  <Ionicons name="calendar" size={18} color="#059669" />
                  <Text style={{ fontWeight: '900', marginTop: 6 }}>{t.sessions}</Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>Sessions</Text>
                </View>
                <View style={{ flex: 1, borderRadius: 12, backgroundColor: '#f3e8ff', padding: 10, alignItems: 'center' }}>
                  <Ionicons name="wallet" size={18} color={colors.accentPurple} />
                  <Text style={{ fontWeight: '900', marginTop: 6 }}>${t.revenue.toLocaleString()}</Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>Revenue</Text>
                </View>
              </View>
            ) : null}
          </Pressable>
        ))}
      </ScrollView>

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={() => setSelected(null)} />
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>Trainer</Text>
              <Pressable onPress={() => setSelected(null)} style={{ padding: 6 }}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>
            {selected ? (
              <View style={{ marginTop: 12, gap: 10 }}>
                <Text style={{ fontWeight: '900', color: colors.text }}>{selected.name}</Text>
                <Text style={{ color: colors.textMuted }}>{selected.email}</Text>
                {selected.status === 'pending' ? (
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <Pressable style={{ flex: 1, padding: 14, borderRadius: 14, backgroundColor: '#dcfce7', alignItems: 'center' }}>
                      <Text style={{ fontWeight: '900', color: '#166534' }}>Approve</Text>
                    </Pressable>
                    <Pressable style={{ flex: 1, padding: 14, borderRadius: 14, backgroundColor: '#fee2e2', alignItems: 'center' }}>
                      <Text style={{ fontWeight: '900', color: colors.danger }}>Reject</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable style={{ marginTop: 10, padding: 14, borderRadius: 14, backgroundColor: '#fef9c3', alignItems: 'center' }}>
                    <Text style={{ fontWeight: '900', color: '#854d0e' }}>Suspend</Text>
                  </Pressable>
                )}
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

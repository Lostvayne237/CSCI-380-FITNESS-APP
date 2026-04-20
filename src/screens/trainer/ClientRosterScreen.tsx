import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import type { ClientsStackParamList } from '../../navigation/ClientsStack';
import { colors } from '../../theme/colors';

const filters = ['all', 'on-track', 'needs-attention', 'inactive'] as const;

type Client = {
  id: string;
  name: string;
  avatar: string;
  goal: string;
  status: 'on-track' | 'needs-attention' | 'inactive';
  lastActive: string;
  progress: number;
};

const clients: Client[] = [
  { id: '1', name: 'Emma Wilson', avatar: 'E', goal: 'Weight Loss', status: 'on-track', lastActive: '2 hours ago', progress: 85 },
  { id: '2', name: 'Sarah Miller', avatar: 'S', goal: 'Muscle Gain', status: 'on-track', lastActive: '5 hours ago', progress: 78 },
  { id: '3', name: 'Lisa Anderson', avatar: 'L', goal: 'General Fitness', status: 'on-track', lastActive: 'Today', progress: 92 },
  { id: '4', name: 'Michael Brown', avatar: 'M', goal: 'Weight Loss', status: 'needs-attention', lastActive: '2 days ago', progress: 45 },
  { id: '5', name: 'David Chen', avatar: 'D', goal: 'Strength Training', status: 'on-track', lastActive: 'Yesterday', progress: 88 },
];

export function ClientRosterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ClientsStackParamList>>();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('all');

  const filtered = useMemo(() => {
    return clients.filter(c => {
      const match =
        c.name.toLowerCase().includes(q.toLowerCase()) || c.goal.toLowerCase().includes(q.toLowerCase());
      const st = filter === 'all' || c.status === filter;
      return match && st;
    });
  }, [q, filter]);

  const badge = (status: Client['status']) => {
    switch (status) {
      case 'on-track':
        return { bg: '#dcfce7', fg: '#166534', label: 'On Track', icon: 'trending-up' as const };
      case 'needs-attention':
        return { bg: '#fef9c3', fg: '#854d0e', label: 'Needs Attention', icon: 'alert-circle' as const };
      default:
        return { bg: '#f1f5f9', fg: '#475569', label: 'Inactive', icon: 'pause-circle' as const };
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>Client Roster</Text>
            <Text style={{ color: colors.textMuted, marginTop: 4 }}>Manage And Track Your Clients</Text>
          </View>
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: colors.primary,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 12,
            }}
          >
            <Ionicons name="person-add" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '800' }}>Add</Text>
          </Pressable>
        </View>

        <View
          style={{
            marginTop: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search by name or goal..."
              placeholderTextColor={colors.textMuted}
              style={{ flex: 1, paddingVertical: 8, color: colors.text }}
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {filters.map(f => (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: filter === f ? colors.primary : '#f1f5f9',
                  }}
                >
                  <Text style={{ fontWeight: '700', color: filter === f ? '#fff' : colors.text }}>
                    {f === 'all' ? 'All' : f.replace('-', ' ')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={{ marginTop: 14, gap: 12 }}>
          {filtered.map(c => {
            const b = badge(c.status);
            return (
              <Pressable
                key={c.id}
                onPress={() => navigation.navigate('ClientDetail', { id: c.id })}
                style={{
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  padding: 14,
                }}
              >
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      backgroundColor: colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>{c.avatar}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>{c.name}</Text>
                    <Text style={{ color: colors.textMuted }}>{c.goal}</Text>
                    <View
                      style={{
                        alignSelf: 'flex-start',
                        marginTop: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 999,
                        backgroundColor: b.bg,
                      }}
                    >
                      <Ionicons name={b.icon} size={14} color={b.fg} />
                      <Text style={{ fontSize: 12, fontWeight: '800', color: b.fg }}>{b.label}</Text>
                    </View>
                    <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 8 }}>
                      Last active: {c.lastActive}
                    </Text>
                    <View style={{ marginTop: 10 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>Progress</Text>
                        <Text style={{ fontWeight: '800', color: colors.text }}>{c.progress}%</Text>
                      </View>
                      <View style={{ height: 8, borderRadius: 999, backgroundColor: '#f1f5f9', marginTop: 6 }}>
                        <View
                          style={{
                            height: 8,
                            borderRadius: 999,
                            width: `${c.progress}%`,
                            backgroundColor: colors.primary,
                          }}
                        />
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ScreenHeader } from '../../components/ScreenHeader';
import { colors } from '../../theme/colors';

type Role = 'admin' | 'trainer' | 'member';
type Status = 'active' | 'suspended' | 'pending';

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  joinDate: string;
  trainer?: string;
};

const users: UserRow[] = [
  { id: '1', name: 'Emma Wilson', email: 'emma@email.com', role: 'member', status: 'active', joinDate: '2026-04-10', trainer: 'Mike Johnson' },
  { id: '2', name: 'James Chen', email: 'james@email.com', role: 'trainer', status: 'pending', joinDate: '2026-04-08' },
  { id: '3', name: 'Sarah Miller', email: 'sarah@email.com', role: 'member', status: 'active', joinDate: '2026-04-05', trainer: 'Mike Johnson' },
  { id: '4', name: 'Michael Brown', email: 'michael@email.com', role: 'member', status: 'suspended', joinDate: '2026-03-28' },
];

export function UserManagementScreen() {
  const [q, setQ] = useState('');
  const [role, setRole] = useState<'all' | Role>('all');
  const [status, setStatus] = useState<'all' | Status>('all');
  const [selected, setSelected] = useState<UserRow | null>(null);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const match =
        u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase());
      const r = role === 'all' || u.role === role;
      const s = status === 'all' || u.status === status;
      return match && r && s;
    });
  }, [q, role, status]);

  const badge = (t: 'role' | 'status', v: string) => {
    const palettes: Record<string, { bg: string; fg: string }> = {
      admin: { bg: '#f3e8ff', fg: '#6b21a8' },
      trainer: { bg: '#dbeafe', fg: '#1d4ed8' },
      member: { bg: '#dcfce7', fg: '#166534' },
      active: { bg: '#dcfce7', fg: '#166534' },
      suspended: { bg: '#fee2e2', fg: '#b91c1c' },
      pending: { bg: '#fef9c3', fg: '#854d0e' },
    };
    const p = palettes[v] ?? { bg: '#f1f5f9', fg: '#475569' };
    return (
      <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: p.bg }}>
        <Text style={{ color: p.fg, fontWeight: '900', fontSize: 11 }}>{v}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <ScreenHeader title="User Management" subtitle="Manage users, roles, and permissions" />

        <View
          style={{
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 12,
            gap: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search name or email..."
              placeholderTextColor={colors.textMuted}
              style={{ flex: 1, paddingVertical: 8, color: colors.text }}
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['all', 'admin', 'trainer', 'member'] as const).map(r => (
                <Pressable
                  key={r}
                  onPress={() => setRole(r)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: role === r ? colors.accentPurple : '#f1f5f9',
                  }}
                >
                  <Text style={{ fontWeight: '900', color: role === r ? '#fff' : colors.text }}>
                    {r === 'all' ? 'All roles' : r}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['all', 'active', 'suspended', 'pending'] as const).map(s => (
                <Pressable
                  key={s}
                  onPress={() => setStatus(s)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: status === s ? colors.accentPurple : '#f1f5f9',
                  }}
                >
                  <Text style={{ fontWeight: '900', color: status === s ? '#fff' : colors.text }}>
                    {s === 'all' ? 'All status' : s}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <Text style={{ color: colors.textMuted }}>
            Showing {filtered.length} of {users.length} users
          </Text>
        </View>

        {filtered.map(u => (
          <Pressable
            key={u.id}
            onPress={() => setSelected(u)}
            style={{
              marginTop: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              padding: 14,
            }}
          >
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
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
                <Text style={{ color: '#fff', fontWeight: '900' }}>{u.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '900', color: colors.text }}>{u.name}</Text>
                <Text style={{ color: colors.textMuted }}>{u.email}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  {badge('role', u.role)}
                  {badge('status', u.status)}
                </View>
                <Text style={{ color: colors.textMuted, marginTop: 8, fontSize: 12 }}>Joined {u.joinDate}</Text>
                {u.trainer ? (
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>Trainer: {u.trainer}</Text>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={() => setSelected(null)} />
          <View
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              padding: 16,
              maxHeight: '85%',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>User Details</Text>
              <Pressable onPress={() => setSelected(null)} style={{ padding: 6 }}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>
            {selected ? (
              <ScrollView style={{ marginTop: 12 }}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      backgroundColor: colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>
                      {selected.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>{selected.name}</Text>
                    <Text style={{ color: colors.textMuted }}>{selected.email}</Text>
                  </View>
                </View>
                <Text style={{ marginTop: 14, fontWeight: '800', color: colors.text }}>Role: {selected.role}</Text>
                <Text style={{ marginTop: 8, fontWeight: '800', color: colors.text }}>Status: {selected.status}</Text>
                <Text style={{ marginTop: 8, color: colors.textMuted }}>Join Date: {selected.joinDate}</Text>
                {selected.trainer ? (
                  <Text style={{ marginTop: 8, color: colors.textMuted }}>Trainer: {selected.trainer}</Text>
                ) : null}

                <Pressable
                  style={{
                    marginTop: 16,
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: '#f3e8ff',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: colors.accentPurple, fontWeight: '900' }}>Change Role</Text>
                </Pressable>
                <Pressable
                  style={{
                    marginTop: 10,
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: '#fef9c3',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#854d0e', fontWeight: '900' }}>Suspend Account</Text>
                </Pressable>
                <Pressable
                  style={{
                    marginTop: 10,
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: '#fee2e2',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: colors.danger, fontWeight: '900' }}>Delete Account</Text>
                </Pressable>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

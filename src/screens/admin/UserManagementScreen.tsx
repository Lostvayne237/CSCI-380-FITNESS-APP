import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ChangeRoleModal } from '../../components/admin/ChangeRoleModal';
import { RoleBadge } from '../../components/admin/RoleBadge';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useAdminDirectory } from '../../context/AdminDirectoryContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { colors } from '../../theme/colors';

export function UserManagementScreen() {
  const { members, changeRole, deletePerson } = useAdminDirectory();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<(typeof members)[number] | null>(null);
  const [menuFor, setMenuFor] = useState<(typeof members)[number] | null>(null);
  const [roleFor, setRoleFor] = useState<(typeof members)[number] | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const filtered = useMemo(() => {
    return members.filter(u => {
      const query = q.trim().toLowerCase();
      if (!query) return true;
      return u.name.toLowerCase().includes(query);
    });
  }, [q, members]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <ScreenHeader title="Users" subtitle="Members only (exclude trainers)" />
          </View>
          <Pressable
            onPress={() => setAddOpen(true)}
            style={{
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              backgroundColor: colors.accentPurple,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '900' }}>Add New</Text>
          </Pressable>
        </View>

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
              placeholder="Search by name..."
              placeholderTextColor={colors.textMuted}
              style={{ flex: 1, paddingVertical: 8, color: colors.text }}
            />
          </View>
          <Text style={{ color: colors.textMuted }}>
            Showing {filtered.length} of {members.length} users
          </Text>
        </View>

        {filtered.map(u => (
          <View
            key={u.id}
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
              </View>
              <RoleBadge role="member" />
              <Pressable
                onPress={() => setMenuFor(u)}
                style={({ pressed }) => ({ padding: 10, borderRadius: 12, opacity: pressed ? 0.85 : 1 })}
                accessibilityLabel={`Open actions for ${u.name}`}
              >
                <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={!!menuFor} transparent animationType="fade" onRequestClose={() => setMenuFor(null)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={() => setMenuFor(null)} />
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: colors.text }}>Actions</Text>
              <Pressable onPress={() => setMenuFor(null)} style={{ padding: 6 }}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>
            {menuFor ? (
              <View style={{ marginTop: 10, gap: 10 }}>
                <Pressable
                  onPress={() => {
                    setSelected(menuFor);
                    setMenuFor(null);
                  }}
                  style={({ pressed }) => ({
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ fontWeight: '900', color: colors.text }}>View Profile</Text>
                </Pressable>

                {menuFor.id === user?.id ? (
                  <View style={{ paddingVertical: 12, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: '#f8fafc' }}>
                    <Text style={{ fontWeight: '900', color: colors.textMuted }}>Change Role</Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => {
                      setRoleFor(menuFor);
                      setMenuFor(null);
                    }}
                    style={({ pressed }) => ({
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Text style={{ fontWeight: '900', color: colors.text }}>Change Role</Text>
                  </Pressable>
                )}
              </View>
            ) : null}
          </View>
        </View>
      </Modal>

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
                <View style={{ marginTop: 10, alignSelf: 'flex-start' }}>
                  <RoleBadge role="member" />
                </View>
                {selected.assignedTrainerId ? (
                  <Text style={{ marginTop: 8, color: colors.textMuted }}>Assigned trainer: {selected.assignedTrainerId}</Text>
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
                  <Text style={{ color: colors.accentPurple, fontWeight: '900' }}>Edit Profile</Text>
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
                  <Text style={{ color: '#854d0e', fontWeight: '900' }}>Deactivate</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    deletePerson(selected.id);
                    setSelected(null);
                  }}
                  style={{ marginTop: 10, padding: 14, borderRadius: 14, backgroundColor: '#fee2e2', alignItems: 'center' }}
                >
                  <Text style={{ color: colors.danger, fontWeight: '900' }}>Delete Account</Text>
                </Pressable>

                {selected.id === user?.id ? null : (
                  <Pressable
                    onPress={() => setRoleFor(selected)}
                    style={({ pressed }) => ({
                      marginTop: 10,
                      padding: 14,
                      borderRadius: 14,
                      backgroundColor: '#f3e8ff',
                      alignItems: 'center',
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <Text style={{ color: colors.accentPurple, fontWeight: '900' }}>Change Role</Text>
                  </Pressable>
                )}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal visible={addOpen} transparent animationType="slide" onRequestClose={() => setAddOpen(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={() => setAddOpen(false)} />
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>Add new user</Text>
              <Pressable onPress={() => setAddOpen(false)} style={{ padding: 6 }}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>

            <View style={{ marginTop: 12, gap: 10 }}>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="Full name"
                placeholderTextColor={colors.textMuted}
                style={input}
              />
              <TextInput
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="email@example.com"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                style={input}
              />

              <Pressable
                onPress={() => {
                  const name = newName.trim();
                  const email = newEmail.trim();
                  if (!name || !email) return;
                  setNewName('');
                  setNewEmail('');
                  setAddOpen(false);
                  showToast('User created (demo)');
                }}
                style={({ pressed }) => ({
                  marginTop: 6,
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: colors.accentPurple,
                  alignItems: 'center',
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text style={{ color: '#fff', fontWeight: '900' }}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ChangeRoleModal
        visible={!!roleFor}
        onClose={() => setRoleFor(null)}
        name={roleFor?.name ?? 'User'}
        currentRole="member"
        disabledReason={roleFor?.id === user?.id ? 'You cannot change your own role.' : null}
        onConfirm={nextRole => {
          if (!roleFor) return;
          if (roleFor.id === user?.id) {
            showToast('You cannot change your own role.');
            return;
          }
          const res = changeRole({ personId: roleFor.id, nextRole });
          if (!res.ok) {
            showToast(res.reason);
            return;
          }
          showToast(`${roleFor.name}'s role has been updated to ${nextRole === 'member' ? 'Member' : nextRole === 'trainer' ? 'Trainer' : 'Admin'}`);
          setRoleFor(null);
          setSelected(null);
          setMenuFor(null);
        }}
      />
    </SafeAreaView>
  );
}

const input = {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 12,
  padding: 12,
  backgroundColor: colors.background,
  color: colors.text,
} as const;

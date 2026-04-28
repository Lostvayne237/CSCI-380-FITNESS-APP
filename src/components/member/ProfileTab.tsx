import { useMemo, useState } from 'react';
import { Image, Modal, Pressable, Switch, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useAuth } from '../../context/AuthContext';
import { useMemberData } from '../../context/MemberDataContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';

export function ProfileTab() {
  const { user, logout } = useAuth();
  const { userProfile, dailyHistory, updateUserProfile } = useMemberData();
  const { colors, mode } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  const daysActive = useMemo(() => Object.keys(dailyHistory).length, [dailyHistory]);

  const achievements = [
    { name: 'First Workout', earned: true, icon: 'flash' as const },
    { name: '7 Day Streak', earned: (userProfile.streakDays ?? 0) >= 7, icon: 'trophy' as const },
    { name: '100K Steps', earned: true, icon: 'medal' as const },
    { name: '50 Workouts', earned: false, icon: 'ribbon' as const },
    { name: '30 Day Streak', earned: false, icon: 'flag' as const },
    { name: 'Marathon', earned: false, icon: 'walk' as const },
  ];

  const stats = [
    { label: 'Total Workouts', value: String(userProfile.totalWorkouts) },
    { label: 'Streak', value: `${userProfile.streakDays} days` },
    { label: 'Total Steps', value: String(userProfile.totalSteps) },
    { label: 'Days Active', value: String(daysActive) },
  ];

  const initial = (userProfile.name || user?.name || '?').charAt(0).toUpperCase();

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (res.canceled) return;
    const uri = res.assets?.[0]?.uri;
    if (uri) updateUserProfile({ avatarUri: uri });
  };

  const savePassword = async () => {
    setPwError(null);
    if (!password1 || password1.length < 6) {
      setPwError('Password must be at least 6 characters.');
      return;
    }
    if (password1 !== password2) {
      setPwError('Passwords do not match.');
      return;
    }
    try {
      setPwSaving(true);
      const { error } = await supabase.auth.updateUser({ password: password1 });
      if (error) throw error;
      setPassword1('');
      setPassword2('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not update password';
      setPwError(msg);
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <View style={{ gap: 20 }}>
      <View
        style={{
          borderRadius: 16,
          padding: 20,
          alignItems: 'center',
          backgroundColor: mode === 'dark' ? colors.card : '#eff6ff',
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Pressable onPress={pickAvatar} style={{ borderRadius: 44, overflow: 'hidden' }}>
          {userProfile.avatarUri ? (
            <Image
              source={{ uri: userProfile.avatarUri }}
              style={{ width: 88, height: 88, borderRadius: 44 }}
            />
          ) : (
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 32, color: '#fff', fontWeight: '700' }}>{initial}</Text>
            </View>
          )}
        </Pressable>
        <Text style={{ marginTop: 12, fontSize: 20, fontWeight: '700', color: colors.text }}>
          {userProfile.name ?? 'Member'}
        </Text>
        <Text style={{ color: colors.textMuted, marginTop: 6 }}>{userProfile.email || user?.email || ''}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <Ionicons name="ribbon" size={18} color="#ca8a04" />
          <Text style={{ color: '#a16207', fontWeight: '600' }}>Level 12</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {stats.map(s => (
          <View
            key={s.label}
            style={{
              width: '48%',
              borderRadius: 12,
              padding: 14,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{s.value}</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 4 }}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      <View>
        <Text style={{ fontWeight: '600', marginBottom: 10, color: colors.text }}>Achievements</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {achievements.map(a => (
            <View
              key={a.name}
              style={{
                width: '31%',
                borderRadius: 12,
                padding: 10,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: a.earned ? 1 : 0.45,
                alignItems: 'center',
                backgroundColor: colors.card,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: a.earned ? '#facc15' : '#e2e8f0',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 6,
                }}
              >
                <Ionicons name={a.icon} size={20} color={a.earned ? '#fff' : colors.textMuted} />
              </View>
              <Text style={{ fontSize: 11, textAlign: 'center', color: colors.text }}>{a.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: '600', marginBottom: 4, color: colors.text }}>Settings</Text>
        <Pressable
          onPress={() => setSettingsOpen(true)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="settings" size={20} color={colors.textMuted} />
            <Text style={{ color: colors.text, fontWeight: '600' }}>Profile Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <Modal visible={settingsOpen} animationType="slide" onRequestClose={() => setSettingsOpen(false)}>
        <View style={{ flex: 1, backgroundColor: colors.background, padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text }}>Profile Settings</Text>
            <Pressable onPress={() => setSettingsOpen(false)} style={{ padding: 8 }}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </Pressable>
          </View>

          <View style={{ gap: 14, marginTop: 18 }}>
            <View
              style={{
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Ionicons name="person" size={20} color={colors.textMuted} />
                <Text style={{ fontWeight: '900', color: colors.text }}>Personal info</Text>
              </View>

              <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text }}>Name</Text>
              <TextInput
                value={userProfile.name}
                onChangeText={t => updateUserProfile({ name: t })}
                placeholder="Your name"
                placeholderTextColor={colors.textMuted}
                style={{
                  marginTop: 6,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 12,
                  backgroundColor: colors.card,
                  color: colors.text,
                }}
              />

              <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text, marginTop: 12 }}>Email</Text>
              <TextInput
                value={userProfile.email}
                onChangeText={t => updateUserProfile({ email: t })}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor={colors.textMuted}
                style={{
                  marginTop: 6,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 12,
                  backgroundColor: colors.card,
                  color: colors.text,
                }}
              />

              <Pressable
                onPress={pickAvatar}
                style={({ pressed }) => ({
                  marginTop: 12,
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: 'center',
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text style={{ color: '#fff', fontWeight: '900' }}>Change profile picture</Text>
              </Pressable>
            </View>

            <View
              style={{
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Ionicons name="lock-closed" size={20} color={colors.textMuted} />
                <Text style={{ fontWeight: '900', color: colors.text }}>Update password</Text>
              </View>

              {pwError ? (
                <View style={{ padding: 10, borderRadius: 12, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' }}>
                  <Text style={{ color: colors.danger }}>{pwError}</Text>
                </View>
              ) : null}

              <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text, marginTop: 10 }}>New password</Text>
              <TextInput
                value={password1}
                onChangeText={setPassword1}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                style={{
                  marginTop: 6,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 12,
                  backgroundColor: colors.card,
                  color: colors.text,
                }}
              />
              <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text, marginTop: 10 }}>Confirm password</Text>
              <TextInput
                value={password2}
                onChangeText={setPassword2}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                style={{
                  marginTop: 6,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 12,
                  backgroundColor: colors.card,
                  color: colors.text,
                }}
              />

              <Pressable
                onPress={savePassword}
                disabled={pwSaving}
                style={({ pressed }) => ({
                  marginTop: 12,
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: 'center',
                  backgroundColor: colors.accent,
                  opacity: pwSaving ? 0.6 : pressed ? 0.85 : 1,
                })}
              >
                <Text style={{ color: '#fff', fontWeight: '900' }}>Save password</Text>
              </Pressable>
            </View>

            <View
              style={{
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Ionicons name="options" size={20} color={colors.textMuted} />
                <Text style={{ fontWeight: '900', color: colors.text }}>Preferences</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Ionicons name="notifications" size={18} color={colors.textMuted} />
                  <Text style={{ color: colors.text, fontWeight: '700' }}>Notifications</Text>
                </View>
                <Switch
                  value={userProfile.notificationsEnabled}
                  onValueChange={v => updateUserProfile({ notificationsEnabled: v })}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Pressable
        onPress={logout}
        style={{
          borderRadius: 14,
          paddingVertical: 14,
          alignItems: 'center',
          backgroundColor: '#fef2f2',
          borderWidth: 1,
          borderColor: '#fecaca',
        }}
      >
        <Text style={{ color: colors.danger, fontWeight: '700' }}>Log out</Text>
      </Pressable>
    </View>
  );
}

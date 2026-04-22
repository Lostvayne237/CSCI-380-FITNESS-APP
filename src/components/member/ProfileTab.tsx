import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { SUPABASE_URL } from '../../lib/supabase';
import { colors } from '../../theme/colors';

export function ProfileTab() {
  const { user, profile, logout } = useAuth();
  const [dark, setDark] = useState(false);

  const achievements = [
    { name: 'First Workout', earned: true, icon: 'flash' as const },
    { name: '7 Day Streak', earned: true, icon: 'trophy' as const },
    { name: '100K Steps', earned: true, icon: 'medal' as const },
    { name: '50 Workouts', earned: false, icon: 'ribbon' as const },
    { name: '30 Day Streak', earned: false, icon: 'flag' as const },
    { name: 'Marathon', earned: false, icon: 'walk' as const },
  ];

  const stats = [
    { label: 'Total Workouts', value: '43' },
    { label: 'Current Streak', value: '7 days' },
    { label: 'Total Steps', value: '87,432' },
    { label: 'Calories Burned', value: '15,234' },
  ];

  const initial = user?.name?.charAt(0) ?? '?';

  return (
    <View style={{ gap: 20 }}>
      <View
        style={{
          borderRadius: 16,
          padding: 20,
          alignItems: 'center',
          backgroundColor: '#eff6ff',
          borderWidth: 1,
          borderColor: '#bfdbfe',
        }}
      >
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
        <Text style={{ marginTop: 12, fontSize: 20, fontWeight: '700', color: colors.text }}>
          {user?.name ?? 'Member'}
        </Text>
        <Text style={{ color: colors.textMuted }}>Fitness enthusiast</Text>
        <Text style={{ color: colors.textMuted, marginTop: 6, fontSize: 12 }}>
          Role (profile): <Text style={{ fontWeight: '800', color: colors.text }}>{profile?.role ?? '—'}</Text>
          {'  '}Role (fallback): <Text style={{ fontWeight: '800', color: colors.text }}>{user?.role ?? '—'}</Text>
        </Text>
        <Text style={{ color: colors.textMuted, marginTop: 4, fontSize: 10 }} numberOfLines={1}>
          Supabase: {SUPABASE_URL}
        </Text>
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
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="person" size={20} color={colors.textMuted} />
            <Text style={{ color: colors.text }}>Edit Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
        <Pressable
          onPress={() => setDark(d => !d)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name={dark ? 'moon' : 'sunny'} size={20} color={colors.textMuted} />
            <Text style={{ color: colors.text }}>{dark ? 'Dark Mode' : 'Light Mode'}</Text>
          </View>
          <View
            style={{
              width: 44,
              height: 26,
              borderRadius: 13,
              backgroundColor: dark ? colors.primary : '#e2e8f0',
              padding: 3,
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: '#fff',
                alignSelf: dark ? 'flex-end' : 'flex-start',
              }}
            />
          </View>
        </Pressable>
      </View>

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

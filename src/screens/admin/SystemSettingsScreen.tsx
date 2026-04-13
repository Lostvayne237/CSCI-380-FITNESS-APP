import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ScreenHeader } from '../../components/ScreenHeader';
import { colors } from '../../theme/colors';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    features: ['Workout library', 'Progress tracking', 'Mobile app access'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 49,
    features: ['Everything in Basic', 'Trainer assignment', 'Custom plans', 'Nutrition guidance'],
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 99,
    features: ['Everything in Premium', 'Weekly 1:1', 'Priority support', 'Advanced analytics'],
  },
];

export function SystemSettingsScreen() {
  const [maintenance, setMaintenance] = useState(false);
  const [flags, setFlags] = useState({
    socialSharing: true,
    advancedAnalytics: false,
    videoWorkouts: true,
    aiCoaching: false,
  });

  const toggle = (key: keyof typeof flags) => setFlags(f => ({ ...f, [key]: !f[key] }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <ScreenHeader title="System Settings" subtitle="Feature Flags And Plans (Demo Toggles)" />

        <View style={section}>
          <View style={sectionTitleRow}>
            <View style={iconBubble('#ffedd5', '#c2410c')}>
              <Ionicons name="warning" size={18} color="#c2410c" />
            </View>
            <Text style={sectionTitle}>Maintenance Mode</Text>
          </View>
          <View style={rowBetween}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ fontWeight: '800', color: colors.text }}>Enable Maintenance Mode</Text>
              <Text style={{ color: colors.textMuted, marginTop: 4, fontSize: 12 }}>
                Users will see a maintenance screen and cannot access the app.
              </Text>
            </View>
            <Pressable
              onPress={() => setMaintenance(m => !m)}
              style={{
                width: 52,
                height: 32,
                borderRadius: 16,
                backgroundColor: maintenance ? '#ea580c' : '#e2e8f0',
                padding: 3,
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: '#fff',
                  alignSelf: maintenance ? 'flex-end' : 'flex-start',
                }}
              />
            </Pressable>
          </View>
          {maintenance ? (
            <View style={{ marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: '#ffedd5' }}>
              <Text style={{ color: '#9a3412', fontWeight: '700' }}>
                Maintenance is ACTIVE (demo toggle only).
              </Text>
            </View>
          ) : null}
        </View>

        <View style={[section, { marginTop: 12 }]}>
          <View style={sectionTitleRow}>
            <View style={iconBubble('#f3e8ff', colors.accentPurple)}>
              <Ionicons name="shield-checkmark" size={18} color={colors.accentPurple} />
            </View>
            <Text style={sectionTitle}>Feature Flags</Text>
          </View>
          {(Object.keys(flags) as Array<keyof typeof flags>).map(key => (
            <View key={key} style={[rowBetween, { marginTop: 10 }]}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ fontWeight: '800', color: colors.text }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Text>
                <Text style={{ color: colors.textMuted, marginTop: 4, fontSize: 12 }}>
                  Toggle demo feature availability.
                </Text>
              </View>
              <Pressable
                onPress={() => toggle(key)}
                style={{
                  width: 52,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: flags[key] ? colors.accentPurple : '#e2e8f0',
                  padding: 3,
                  justifyContent: 'center',
                }}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: '#fff',
                    alignSelf: flags[key] ? 'flex-end' : 'flex-start',
                  }}
                />
              </Pressable>
            </View>
          ))}
        </View>

        <Text style={{ fontWeight: '900', marginTop: 16, marginBottom: 10, color: colors.text }}>
          Subscription plans
        </Text>
        {plans.map(p => (
          <View key={p.id} style={[section, { marginBottom: 10 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>{p.name}</Text>
              <Text style={{ fontWeight: '900', color: colors.accentPurple }}>${p.price}/mo</Text>
            </View>
            {p.features.map(f => (
              <Text key={f} style={{ color: colors.textMuted, marginTop: 8 }}>
                • {f}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const section = {
  borderRadius: 14,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.card,
  padding: 14,
} as const;

const sectionTitleRow = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10, marginBottom: 10 };

const sectionTitle = { fontSize: 16, fontWeight: '900' as const, color: colors.text };

const rowBetween = { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const };

function iconBubble(bg: string, fg: string) {
  return {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: bg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };
}

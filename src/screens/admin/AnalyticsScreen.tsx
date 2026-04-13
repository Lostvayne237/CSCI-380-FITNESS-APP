import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../components/ScreenHeader';
import { colors } from '../../theme/colors';

const dauMau = [
  { date: 'Mar 12', DAU: 890, MAU: 2450 },
  { date: 'Mar 19', DAU: 920, MAU: 2520 },
  { date: 'Mar 26', DAU: 1050, MAU: 2680 },
  { date: 'Apr 2', DAU: 1120, MAU: 2750 },
  { date: 'Apr 9', DAU: 1234, MAU: 2847 },
];

const signups = [
  { month: 'Jan', signups: 145 },
  { month: 'Feb', signups: 178 },
  { month: 'Mar', signups: 234 },
  { month: 'Apr', signups: 156 },
];

const tiers = [
  { name: 'Basic', value: 1342, color: '#2563eb' },
  { name: 'Premium', value: 978, color: '#7c3aed' },
  { name: 'Elite', value: 527, color: '#059669' },
];

const revenue = [
  { month: 'Nov', recurring: 38200, oneTime: 4500 },
  { month: 'Dec', recurring: 41500, oneTime: 5200 },
  { month: 'Jan', recurring: 43800, oneTime: 3800 },
  { month: 'Feb', recurring: 45200, oneTime: 4100 },
  { month: 'Mar', recurring: 46800, oneTime: 6200 },
  { month: 'Apr', recurring: 47892, oneTime: 5400 },
];

const cardStyle = {
  borderRadius: 14,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: colors.card,
  padding: 14,
} as const;

const cardTitleStyle = {
  fontWeight: '900' as const,
  color: colors.text,
  marginBottom: 10,
};

function MiniBars({
  data,
  aKey,
  bKey,
  colorA,
  colorB,
}: {
  data: Array<Record<string, string | number>>;
  aKey: string;
  bKey: string;
  colorA: string;
  colorB: string;
}) {
  const max = Math.max(
    ...data.flatMap(d => [Number(d[aKey]), Number(d[bKey])]),
    1,
  );
  const labelKey = Object.keys(data[0] ?? {}).find(k => k !== aKey && k !== bKey) ?? 'date';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 160 }}>
      {data.map((row, idx) => (
        <View key={idx} style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'flex-end', height: 140 }}>
            <View
              style={{
                width: 8,
                height: (Number(row[aKey]) / max) * 130,
                borderRadius: 4,
                backgroundColor: colorA,
              }}
            />
            <View
              style={{
                width: 8,
                height: (Number(row[bKey]) / max) * 130,
                borderRadius: 4,
                backgroundColor: colorB,
              }}
            />
          </View>
          <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 6 }} numberOfLines={1}>
            {String(row[labelKey])}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function AnalyticsScreen() {
  const tierTotal = useMemo(() => tiers.reduce((s, t) => s + t.value, 0), []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <ScreenHeader title="Analytics" subtitle="Growth, Engagement, And Revenue (Demo Data)" />

        <View style={cardStyle}>
          <Text style={cardTitleStyle}>DAU Vs MAU</Text>
          <MiniBars data={dauMau} aKey="DAU" bKey="MAU" colorA="#2563eb" colorB="#7c3aed" />
          <Text style={{ marginTop: 8, fontSize: 12, color: colors.textMuted }}>Blue: DAU • Purple: MAU</Text>
        </View>

        <View style={[cardStyle, { marginTop: 12 }]}>
          <Text style={cardTitleStyle}>New Signups</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 150 }}>
            {signups.map((row, idx) => {
              const max = Math.max(...signups.map(s => s.signups), 1);
              return (
                <View key={idx} style={{ flex: 1, alignItems: 'center' }}>
                  <View
                    style={{
                      width: '100%',
                      height: (row.signups / max) * 120,
                      borderRadius: 8,
                      backgroundColor: '#10b981',
                    }}
                  />
                  <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 6 }}>{row.month}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[cardStyle, { marginTop: 12 }]}>
          <Text style={cardTitleStyle}>Membership Tiers</Text>
          {tiers.map(t => {
            const pct = tierTotal ? Math.round((t.value / tierTotal) * 100) : 0;
            return (
              <View key={t.name} style={{ marginTop: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontWeight: '800', color: colors.text }}>{t.name}</Text>
                  <Text style={{ color: colors.textMuted }}>
                    {t.value.toLocaleString()} ({pct}%)
                  </Text>
                </View>
                <View style={{ height: 10, borderRadius: 999, backgroundColor: '#f1f5f9', marginTop: 6 }}>
                  <View
                    style={{
                      height: 10,
                      borderRadius: 999,
                      width: `${pct}%`,
                      backgroundColor: t.color,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>

        <View style={[cardStyle, { marginTop: 12 }]}>
          <Text style={cardTitleStyle}>Recurring Vs One-Time</Text>
          <MiniBars
            data={revenue}
            aKey="recurring"
            bKey="oneTime"
            colorA="#8b5cf6"
            colorB="#10b981"
          />
          <Text style={{ marginTop: 8, fontSize: 12, color: colors.textMuted }}>
            Purple: recurring • Green: one-time
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ClientsStackParamList } from '../../navigation/ClientsStack';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<ClientsStackParamList, 'ClientDetail'>;
const progressData = [
  { week: 'W1', weight: 185, strength: 65 },
  { week: 'W2', weight: 183, strength: 68 },
  { week: 'W3', weight: 181, strength: 72 },
  { week: 'W4', weight: 179, strength: 75 },
  { week: 'W5', weight: 177, strength: 78 },
  { week: 'W6', weight: 175, strength: 82 },
];

const workouts = [
  { date: '2026-04-11', name: 'Upper Body Strength', duration: '45 min' },
  { date: '2026-04-09', name: 'Cardio & Core', duration: '30 min' },
  { date: '2026-04-07', name: 'Lower Body Power', duration: '50 min' },
];

const tabs = ['overview', 'workouts', 'nutrition', 'messages', 'notes'] as const;

export function ClientDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const [tab, setTab] = useState<(typeof tabs)[number]>('overview');

  const maxW = useMemo(() => Math.max(...progressData.map(d => d.weight), 1), []);
  const maxS = useMemo(() => Math.max(...progressData.map(d => d.strength), 1), []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted, fontWeight: '700' }}>Clients</Text>
        </Pressable>

        <View
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
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>E</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text }}>Emma Wilson</Text>
              <Text style={{ color: colors.textMuted }}>emma@email.com</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>Client #{id}</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#dcfce7' }}>
                  <Text style={{ color: '#166534', fontWeight: '800' }}>On Track</Text>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#eff6ff' }}>
                  <Text style={{ color: '#1d4ed8', fontWeight: '800' }}>Goal: Weight Loss</Text>
                </View>
              </View>
            </View>
            <Pressable style={{ alignSelf: 'flex-start', padding: 10, borderRadius: 12, backgroundColor: '#eff6ff' }}>
              <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {tabs.map(t => (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 999,
                  backgroundColor: tab === t ? colors.primary : '#f1f5f9',
                }}
              >
                <Text style={{ fontWeight: '800', color: tab === t ? '#fff' : colors.text, textTransform: 'capitalize' }}>
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {tab === 'overview' && (
          <View style={{ marginTop: 14, gap: 14 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {[
                { label: 'Current Weight', value: '175 lbs', sub: '-10 lbs' },
                { label: 'Workouts/Week', value: '4.2', sub: '+0.8' },
                { label: 'Days Active', value: '42' },
                { label: 'Progress', value: '85%' },
              ].map(s => (
                <View
                  key={s.label}
                  style={{
                    flexGrow: 1,
                    flexBasis: '45%',
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    padding: 12,
                  }}
                >
                  <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text }}>{s.value}</Text>
                  <Text style={{ color: colors.textMuted, marginTop: 4 }}>{s.label}</Text>
                  {'sub' in s && s.sub ? <Text style={{ color: '#16a34a', marginTop: 4, fontWeight: '800' }}>{s.sub}</Text> : null}
                </View>
              ))}
            </View>

            <View
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                padding: 14,
              }}
            >
              <Text style={{ fontWeight: '900', marginBottom: 10, color: colors.text }}>Progress Over Time</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>Weight (Blue) Vs Strength Score (Green)</Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 140 }}>
                {progressData.map(d => (
                  <View key={d.week} style={{ flex: 1, alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', gap: 4, alignItems: 'flex-end', height: 120 }}>
                      <View
                        style={{
                          width: 8,
                          height: ((maxW - d.weight + 10) / maxW) * 110,
                          borderRadius: 4,
                          backgroundColor: '#93c5fd',
                        }}
                      />
                      <View
                        style={{
                          width: 8,
                          height: (d.strength / maxS) * 110,
                          borderRadius: 4,
                          backgroundColor: '#86efac',
                        }}
                      />
                    </View>
                    <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 6 }}>{d.week}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#bfdbfe',
                backgroundColor: '#eff6ff',
                padding: 14,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '900', color: colors.text }}>12-Week Weight Loss Program</Text>
                <Text style={{ color: colors.primary, fontWeight: '800' }}>Week 6 of 12</Text>
              </View>
              <Text style={{ color: colors.textMuted, marginTop: 8 }}>
                Strength training 3x/week, cardio 2x/week, active rest 2x/week
              </Text>
            </View>

            <Text style={{ fontWeight: '900', color: colors.text }}>Recent Workouts</Text>
            {workouts.map((w, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  gap: 12,
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: '#f8fafc',
                }}
              >
                <View style={{ padding: 10, borderRadius: 10, backgroundColor: '#dcfce7' }}>
                  <Ionicons name="barbell" size={18} color="#166534" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '800', color: colors.text }}>{w.name}</Text>
                  <Text style={{ color: colors.textMuted }}>{w.duration}</Text>
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{w.date}</Text>
              </View>
            ))}
          </View>
        )}

        {tab === 'workouts' && (
          <Text style={{ marginTop: 16, color: colors.textMuted }}>
            Workout history and plans will appear here.
          </Text>
        )}
        {tab === 'nutrition' && (
          <Text style={{ marginTop: 16, color: colors.textMuted }}>Nutrition Tracking Will Appear Here.</Text>
        )}
        {tab === 'messages' && (
          <Text style={{ marginTop: 16, color: colors.textMuted }}>Message History Will Appear Here.</Text>
        )}
        {tab === 'notes' && (
          <View style={{ marginTop: 14, gap: 10 }}>
            <TextInput
              multiline
              placeholder="Add private notes about this client..."
              placeholderTextColor={colors.textMuted}
              style={{
                minHeight: 120,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 12,
                textAlignVertical: 'top',
                color: colors.text,
                backgroundColor: colors.card,
              }}
            />
            <Pressable
              style={{
                alignSelf: 'flex-start',
                backgroundColor: colors.primary,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '900' }}>Save Note</Text>
            </Pressable>
            {[
              { t: 'Great progress on form today. Increased squat weight by 5lbs.', d: 'April 11, 2026' },
              { t: 'Client mentioned shoulder discomfort. Adjusted exercise selection.', d: 'April 7, 2026' },
            ].map((n, i) => (
              <View key={i} style={{ padding: 12, borderRadius: 12, backgroundColor: '#f8fafc' }}>
                <Text style={{ color: colors.text }}>{n.t}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 6 }}>{n.d}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

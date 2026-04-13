import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';

export function ProgressTab() {
  const [range, setRange] = useState<'week' | 'month'>('week');

  const weeklyData = useMemo(
    () => [
      { day: 'Mon', steps: 8234, calories: 547 },
      { day: 'Tue', steps: 12043, calories: 823 },
      { day: 'Wed', steps: 6521, calories: 432 },
      { day: 'Thu', steps: 9876, calories: 654 },
      { day: 'Fri', steps: 11234, calories: 743 },
      { day: 'Sat', steps: 15432, calories: 987 },
      { day: 'Sun', steps: 7654, calories: 509 },
    ],
    [],
  );

  const maxSteps = Math.max(...weeklyData.map(d => d.steps), 1);

  const stats = [
    { label: 'Avg Steps/Day', value: '9,856', change: '+12%', icon: 'walk' as const, tint: '#2563eb' },
    { label: 'Total Calories', value: '4,695', change: '+8%', icon: 'flame' as const, tint: '#ea580c' },
    { label: 'Workouts', value: '11', change: '+3', icon: 'trending-up' as const, tint: '#059669' },
  ];

  return (
    <View style={{ gap: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>Progress</Text>
        <View style={{ flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 10, padding: 4 }}>
          <Pressable
            onPress={() => setRange('week')}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: range === 'week' ? colors.card : 'transparent',
            }}
          >
            <Text style={{ fontWeight: '600', color: colors.text }}>Week</Text>
          </Pressable>
          <Pressable
            onPress={() => setRange('month')}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: range === 'month' ? colors.card : 'transparent',
            }}
          >
            <Text style={{ fontWeight: '600', color: colors.text }}>Month</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        {stats.map(s => (
          <View
            key={s.label}
            style={{
              flex: 1,
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: s.tint + '22',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
              }}
            >
              <Ionicons name={s.icon} size={18} color={s.tint} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>{s.value}</Text>
            <Text style={{ fontSize: 11, color: colors.textMuted }}>{s.label}</Text>
            <Text style={{ fontSize: 11, color: '#059669', marginTop: 4 }}>{s.change}</Text>
          </View>
        ))}
      </View>

      {range === 'week' && (
        <View
          style={{
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontWeight: '600', color: colors.text }}>Steps (week)</Text>
            <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 140 }}>
            {weeklyData.map(d => {
              const h = (d.steps / maxSteps) * 120;
              return (
                <View key={d.day} style={{ flex: 1, alignItems: 'center' }}>
                  <View
                    style={{
                      width: '100%',
                      height: h,
                      borderRadius: 6,
                      backgroundColor: '#93c5fd',
                      marginBottom: 6,
                    }}
                  />
                  <Text style={{ fontSize: 10, color: colors.textMuted }}>{d.day}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {range === 'month' && (
        <View
          style={{
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
          }}
        >
          <Text style={{ fontWeight: '600', marginBottom: 8, color: colors.text }}>Month summary</Text>
          <Text style={{ color: colors.textMuted }}>
            Monthly aggregates mirror the web prototype — connect a backend to load real history.
          </Text>
        </View>
      )}
    </View>
  );
}

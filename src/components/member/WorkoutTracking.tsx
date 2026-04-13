import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';

type Props = {
  onClose: () => void;
  embedded?: boolean;
};

const types = [
  { name: 'Strength Training', icon: 'barbell' as const, tone: '#7c3aed' },
  { name: 'Cardio', icon: 'timer' as const, tone: '#2563eb' },
  { name: 'Yoga', icon: 'leaf' as const, tone: '#059669' },
  { name: 'Custom', icon: 'flash' as const, tone: '#ea580c' },
];

export function WorkoutTracking({ onClose, embedded }: Props) {
  const [selectedType, setSelectedType] = useState<string | null>(embedded ? types[0].name : null);
  const [isTracking, setIsTracking] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!isTracking) return;
    const id = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(id);
  }, [isTracking]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={{ gap: 20 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Log Workout</Text>
        {!embedded && (
          <Pressable onPress={onClose} style={{ padding: 8 }}>
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {!selectedType ? (
        <View>
          <Text style={{ marginBottom: 12, fontWeight: '600', color: colors.text }}>
            Select Workout Type
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {types.map(t => (
              <Pressable
                key={t.name}
                onPress={() => setSelectedType(t.name)}
                style={{
                  width: '47%',
                  borderRadius: 14,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: colors.card,
                }}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: t.tone + '22',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={t.icon} size={26} color={t.tone} />
                </View>
                <Text style={{ textAlign: 'center', color: colors.text, fontWeight: '500' }}>{t.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <View style={{ gap: 16 }}>
          <View
            style={{
              borderRadius: 16,
              padding: 24,
              alignItems: 'center',
              backgroundColor: '#eff6ff',
              borderWidth: 1,
              borderColor: '#bfdbfe',
            }}
          >
            <Text style={{ color: colors.textMuted, marginBottom: 8 }}>{selectedType}</Text>
            <Text style={{ fontSize: 44, fontWeight: '800', color: colors.text }}>
              {formatTime(duration)}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <Ionicons name="flame" size={18} color="#ea580c" />
              <Text style={{ color: colors.textMuted }}>{Math.floor(duration * 5)} cal</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              onPress={() => setIsTracking(v => !v)}
              style={{
                flex: 1,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: colors.primary,
              }}
            >
              <Ionicons name={isTracking ? 'pause' : 'play'} size={20} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '700' }}>{isTracking ? 'Pause' : 'Start'}</Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              style={{
                flex: 1,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: colors.accent,
              }}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '700' }}>Complete</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => {
              setSelectedType(null);
              setIsTracking(false);
              setDuration(0);
            }}
          >
            <Text style={{ textAlign: 'center', color: colors.textMuted }}>Change Workout Type</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';
import { CircularProgressRing } from './CircularProgressRing';

export type FoodLogListItem = {
  id: number;
  foodName: string;
  calories: number;
  loggedAt: string;
};

type Props = {
  onQuickLog: () => void;
  userName?: string;
  caloriesToday?: number;
  caloriesGoal?: number;
  recentFood?: FoodLogListItem[];
  loading?: boolean;
  error?: string | null;
};

export function Dashboard({
  onQuickLog,
  userName,
  caloriesToday = 0,
  caloriesGoal = 2000,
  recentFood = [],
  loading = false,
  error = null,
}: Props) {
  const stats = {
    steps: 8234,
    stepsGoal: 10000,
    calories: caloriesToday,
    caloriesGoal,
    activeMinutes: 42,
    activeGoal: 60,
  };

  const recentWorkouts = [
    { name: 'Morning Run', duration: '25 min', calories: 245, time: '7:30 AM' },
    { name: 'Upper Body', duration: '40 min', calories: 320, time: 'Yesterday' },
    { name: 'Yoga', duration: '30 min', calories: 150, time: '2 days ago' },
  ];

  return (
    <View style={{ gap: 24 }}>
      <View>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>
          {userName ? `Welcome back, ${userName}!` : 'Welcome back!'}
        </Text>
        <Text style={{ color: colors.textMuted, marginTop: 4 }}>
          Calories today: <Text style={{ fontWeight: '800', color: colors.text }}>{caloriesToday}</Text> /{' '}
          <Text style={{ fontWeight: '800', color: colors.text }}>{caloriesGoal}</Text>
        </Text>
      </View>

      <View
        style={{
          borderRadius: 16,
          padding: 20,
          backgroundColor: '#ecfdf5',
          borderWidth: 1,
          borderColor: '#d1fae5',
        }}
      >
        <Text style={{ marginBottom: 16, fontWeight: '600', color: colors.text }}>
          Today&apos;s Activity
        </Text>
        {error ? (
          <View
            style={{
              marginBottom: 12,
              padding: 12,
              borderRadius: 12,
              backgroundColor: '#fef2f2',
              borderWidth: 1,
              borderColor: '#fecaca',
            }}
          >
            <Text style={{ color: colors.danger }}>{error}</Text>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <CircularProgressRing
            value={stats.steps}
            max={stats.stepsGoal}
            label="Steps"
            accent="#0ea5e9"
            icon={<Ionicons name="walk" size={18} color={colors.primary} />}
          />
          <CircularProgressRing
            value={stats.calories}
            max={stats.caloriesGoal}
            label="Calories"
            accent="#f97316"
            icon={<Ionicons name="flame" size={18} color="#ea580c" />}
          />
          <CircularProgressRing
            value={stats.activeMinutes}
            max={stats.activeGoal}
            label="Active Min"
            accent="#10b981"
            icon={<Ionicons name="trending-up" size={18} color="#059669" />}
          />
        </View>
        {loading ? (
          <View style={{ marginTop: 12, alignItems: 'center' }}>
            <ActivityIndicator />
          </View>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable
          onPress={onQuickLog}
          style={{
            flex: 1,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: colors.primary,
          }}
        >
          <Ionicons name="barbell" size={20} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '600' }}>Log Workout</Text>
        </Pressable>
        <Pressable
          style={{
            flex: 1,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
          }}
        >
          <Ionicons name="flag" size={20} color={colors.text} />
          <Text style={{ fontWeight: '600', color: colors.text }}>Set Goal</Text>
        </Pressable>
      </View>

      <View>
        <Text style={{ fontWeight: '600', marginBottom: 12, color: colors.text }}>
          Recent Food Logs
        </Text>
        {recentFood.length === 0 ? (
          <View
            style={{
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.card,
            }}
          >
            <Text style={{ color: colors.textMuted }}>
              No food logs yet. Add a row in Supabase `food_logs` to see it here.
            </Text>
          </View>
        ) : (
          recentFood.map(item => (
            <View
              key={item.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 8,
                backgroundColor: colors.card,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: '#ffedd5',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="restaurant" size={20} color="#ea580c" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: colors.text }} numberOfLines={1}>
                    {item.foodName}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted }} numberOfLines={1}>
                    {new Date(item.loggedAt).toLocaleString()}
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontWeight: '700', color: colors.text }}>{item.calories} cal</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View>
        <Text style={{ fontWeight: '600', marginBottom: 12, color: colors.text }}>
          Recent Workouts
        </Text>
        {recentWorkouts.map((w, idx) => (
          <View
            key={idx}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 8,
              backgroundColor: colors.card,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: '#dbeafe',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="barbell" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={{ fontWeight: '600', color: colors.text }}>{w.name}</Text>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>{w.time}</Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontWeight: '600', color: colors.text }}>{w.duration}</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>{w.calories} cal</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';

import { useMemberData } from '../../context/MemberDataContext';
import { useMessaging } from '../../context/MessagingContext';
import { useTheme } from '../../context/ThemeContext';
import { motionDuration, usePrefersReducedMotion } from '../../lib/motion';

type Range = 'week' | 'month' | 'all';

type PublicMember = {
  id: string;
  name: string;
  fitnessGoal: string | null;
  activityLevel: string | null;
  points: number;
  challengesCompleted: number;
  streakDays: number;
  longestStreakDays?: number;
};

function goalMini(goal: string | null) {
  if (!goal) return { t: 'Goal: —', bg: '#f1f5f9', fg: '#334155' };
  const g = goal;
  if (g === 'lose_weight') return { t: '🔥 Lose', bg: '#ffedd5', fg: '#9a3412' };
  if (g === 'build_muscle') return { t: '🏋️ Muscle', bg: '#eff6ff', fg: '#1d4ed8' };
  if (g === 'improve_flexibility') return { t: '🧘 Flex', bg: '#dcfce7', fg: '#166534' };
  if (g === 'boost_endurance') return { t: '🏃 Endurance', bg: '#fef9c3', fg: '#854d0e' };
  if (g === 'maintain_fitness') return { t: '⚖️ Maintain', bg: '#f1f5f9', fg: '#334155' };
  return { t: '💪 General', bg: '#f3e8ff', fg: '#7c3aed' };
}

export function LeaderboardTab({ meId }: { meId: string }) {
  const { colors } = useTheme();
  const { userProfile } = useMemberData();
  const { threads, ensureCommunityThread, getThreadMessages, sendCommunityMessage } = useMessaging();
  const reducedMotion = usePrefersReducedMotion();
  const [range, setRange] = useState<Range>('all');
  const [selected, setSelected] = useState<PublicMember | null>(null);
  const [chatFor, setChatFor] = useState<PublicMember | null>(null);
  const [text, setText] = useState('');

  const community = useMemo<PublicMember[]>(() => {
    const seed: PublicMember[] = [
      { id: 'member-1', name: 'Emma Wilson', fitnessGoal: 'lose_weight', activityLevel: 'moderate', points: 320, challengesCompleted: 6, streakDays: 7, longestStreakDays: 14 },
      { id: 'member-2', name: 'Sarah Miller', fitnessGoal: 'build_muscle', activityLevel: 'very_active', points: 410, challengesCompleted: 7, streakDays: 4, longestStreakDays: 9 },
      { id: 'member-3', name: 'Michael Brown', fitnessGoal: 'maintain_fitness', activityLevel: 'light', points: 120, challengesCompleted: 2, streakDays: 0, longestStreakDays: 5 },
      { id: 'member-4', name: 'Ava Thompson', fitnessGoal: 'general_fitness', activityLevel: 'moderate', points: 260, challengesCompleted: 5, streakDays: 10, longestStreakDays: 18 },
      { id: 'member-5', name: 'Noah Garcia', fitnessGoal: 'boost_endurance', activityLevel: 'athlete', points: 520, challengesCompleted: 9, streakDays: 21, longestStreakDays: 30 },
      { id: 'member-6', name: 'Mia Davis', fitnessGoal: 'improve_flexibility', activityLevel: 'light', points: 180, challengesCompleted: 3, streakDays: 5, longestStreakDays: 12 },
      { id: 'member-7', name: 'Liam Martinez', fitnessGoal: 'lose_weight', activityLevel: 'sedentary', points: 90, challengesCompleted: 1, streakDays: 1, longestStreakDays: 4 },
      { id: 'member-8', name: 'Olivia Lee', fitnessGoal: 'build_muscle', activityLevel: 'moderate', points: 360, challengesCompleted: 6, streakDays: 8, longestStreakDays: 15 },
      { id: 'member-9', name: 'Ethan Clark', fitnessGoal: 'general_fitness', activityLevel: 'very_active', points: 295, challengesCompleted: 5, streakDays: 12, longestStreakDays: 20 },
      { id: 'member-10', name: 'Sophia Nguyen', fitnessGoal: 'maintain_fitness', activityLevel: 'moderate', points: 210, challengesCompleted: 4, streakDays: 6, longestStreakDays: 11 },
    ];

    // Replace "me" with real local profile values, but keep it in the list for highlighting/rank.
    const mine: PublicMember = {
      id: meId,
      name: userProfile.name ?? 'You',
      fitnessGoal: userProfile.fitnessGoal,
      activityLevel: userProfile.activityLevel,
      points: userProfile.points ?? 0,
      challengesCompleted: userProfile.challengesCompleted ?? 0,
      streakDays: userProfile.streakDays ?? 0,
      longestStreakDays: userProfile.streakDays ?? 0,
    };

    const list = seed.filter(x => x.id !== meId);
    return [mine, ...list];
  }, [meId, userProfile.activityLevel, userProfile.challengesCompleted, userProfile.fitnessGoal, userProfile.name, userProfile.points, userProfile.streakDays]);

  const ranked = useMemo(() => {
    // range is UI-only right now (mock); keep sorting consistent.
    const sorted = [...community].sort((a, b) => b.points - a.points);
    return sorted.map((m, idx) => ({ ...m, rank: idx + 1 }));
  }, [community, range]);

  const myRow = useMemo(() => ranked.find(r => r.id === meId) ?? null, [meId, ranked]);

  const openChat = (other: PublicMember) => {
    setChatFor(other);
    setText('');
  };

  const threadKey = useMemo(() => {
    if (!chatFor) return null;
    return ensureCommunityThread({ memberAId: meId, memberBId: chatFor.id });
  }, [chatFor, ensureCommunityThread, meId]);

  const messages = threadKey ? getThreadMessages(threadKey) : [];

  return (
    <View style={{ flex: 1 }}>
      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: '900', color: colors.text }}>🏆 Leaderboard</Text>
        <Text style={{ color: colors.textMuted, marginTop: 4 }}>Rankings based on challenge points</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
        {([
          { id: 'week', label: 'This Week' },
          { id: 'month', label: 'This Month' },
          { id: 'all', label: 'All Time' },
        ] as const).map(t => (
          <Pressable
            key={t.id}
            onPress={() => setRange(t.id)}
            style={({ pressed }) => ({
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: range === t.id ? colors.primary : '#f1f5f9',
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text style={{ fontWeight: '900', color: range === t.id ? '#fff' : colors.text }}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={ranked}
        keyExtractor={r => r.id}
        contentContainerStyle={{ paddingBottom: 110 }}
        renderItem={({ item, index }) => {
          const topBg = item.rank === 1 ? '#fef9c3' : item.rank === 2 ? '#f1f5f9' : item.rank === 3 ? '#ffedd5' : colors.card;
          const topBorder = item.rank === 1 ? '#fde68a' : item.rank === 2 ? colors.border : item.rank === 3 ? '#fdba74' : colors.border;
          const highlight = item.id === meId;
          const pill = goalMini(item.fitnessGoal);
          return (
            <MotiView
              from={{ opacity: 0, translateY: 15 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: 'timing',
                duration: motionDuration(280, reducedMotion),
                delay: reducedMotion ? 0 : Math.min(index, 12) * 70,
              }}
            >
              <Pressable
                onPress={() => setSelected(item)}
                style={({ pressed }) => ({
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: highlight ? colors.primary : topBorder,
                  backgroundColor: topBg,
                  padding: 14,
                  marginBottom: 10,
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 36, alignItems: 'center' }}>
                    <Text style={{ fontWeight: '900', color: colors.text }}>
                      {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : `#${item.rank}`}
                    </Text>
                  </View>
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
                    <Text style={{ color: '#fff', fontWeight: '900' }}>{item.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '900', color: colors.text }}>{item.name}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                      <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: pill.bg }}>
                        <Text style={{ fontWeight: '900', color: pill.fg, fontSize: 11 }}>{pill.t}</Text>
                      </View>
                      <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#fee2e2' }}>
                        <Text style={{ fontWeight: '900', color: '#b91c1c', fontSize: 11 }}>🔥 {item.streakDays}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontWeight: '900', color: colors.text }}>{item.points} pts</Text>
                    <Text style={{ color: colors.textMuted, marginTop: 4, fontSize: 12 }}>{item.challengesCompleted} challenges</Text>
                  </View>
                </View>
              </Pressable>
            </MotiView>
          );
        }}
      />

      {myRow ? (
        <View
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            padding: 14,
          }}
        >
          <Text style={{ fontWeight: '900', color: colors.text }}>
            Your Rank: #{myRow.rank} · {myRow.points} pts
          </Text>
        </View>
      ) : null}

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={() => setSelected(null)} />
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, maxHeight: '85%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>Profile</Text>
              <Pressable onPress={() => setSelected(null)} style={{ padding: 6 }}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>
            {selected ? (
              <View style={{ marginTop: 12, gap: 10 }}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>{selected.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>{selected.name}</Text>
                    <Text style={{ color: colors.textMuted, marginTop: 2 }}>{goalMini(selected.fitnessGoal).t}</Text>
                  </View>
                </View>
                <Text style={{ color: colors.textMuted }}>Current streak 🔥: {selected.streakDays}</Text>
                <Text style={{ color: colors.textMuted }}>Longest streak 🔥: {selected.longestStreakDays ?? selected.streakDays}</Text>
                <Text style={{ color: colors.textMuted }}>Total points: {selected.points}</Text>
                <Text style={{ color: colors.textMuted }}>Challenges completed: {selected.challengesCompleted}</Text>
                <Text style={{ color: colors.textMuted }}>Activity level: {selected.activityLevel ?? '—'}</Text>

                <Pressable
                  onPress={() => {
                    setSelected(null);
                    openChat(selected);
                  }}
                  disabled={selected.id === meId}
                  style={({ pressed }) => ({
                    marginTop: 8,
                    paddingVertical: 12,
                    borderRadius: 14,
                    backgroundColor: selected.id === meId ? '#e2e8f0' : colors.primary,
                    alignItems: 'center',
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ color: selected.id === meId ? colors.textMuted : '#fff', fontWeight: '900' }}>
                    {selected.id === meId ? 'This is you' : 'Send Message'}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal visible={!!chatFor} transparent animationType="slide" onRequestClose={() => setChatFor(null)}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={() => setChatFor(null)} />
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, maxHeight: '85%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: colors.text }}>{chatFor?.name ?? 'Chat'}</Text>
              <Pressable onPress={() => setChatFor(null)} style={{ padding: 6 }}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>

            <View style={{ marginTop: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, padding: 12, minHeight: 240 }}>
              {messages.length === 0 ? <Text style={{ color: colors.textMuted }}>No messages yet. Say hi.</Text> : null}
              {messages.slice(-12).map(m => {
                const mine = m.fromId === meId;
                return (
                  <View key={m.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '86%', marginBottom: 10 }}>
                    <View style={{ padding: 12, borderRadius: 14, backgroundColor: mine ? colors.primary : '#f1f5f9' }}>
                      <Text style={{ color: mine ? '#fff' : colors.text }}>{m.text}</Text>
                    </View>
                    <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4, paddingHorizontal: 6 }}>
                      {new Date(m.createdAt).toLocaleString()}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end', marginTop: 10 }}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Type a message..."
                placeholderTextColor={colors.textMuted}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  maxHeight: 120,
                  color: colors.text,
                }}
                multiline
              />
              <Pressable
                onPress={() => {
                  if (!chatFor) return;
                  sendCommunityMessage({ memberAId: meId, memberBId: chatFor.id, fromId: meId, text });
                  setText('');
                }}
                style={({ pressed }) => ({
                  backgroundColor: colors.primary,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderRadius: 12,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


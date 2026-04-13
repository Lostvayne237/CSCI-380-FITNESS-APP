import { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';

type Chat = {
  id: string;
  name: string;
  letter: string;
  last: string;
  time: string;
  unread: number;
};

type Msg = { id: string; side: 'trainer' | 'client'; text: string; time: string };

const chats: Chat[] = [
  { id: '1', name: 'Emma Wilson', letter: 'E', last: 'Thanks for the new workout plan!', time: '10m', unread: 2 },
  { id: '2', name: 'Sarah Miller', letter: 'S', last: 'Can we reschedule tomorrow?', time: '1h', unread: 1 },
  { id: '3', name: 'Lisa Anderson', letter: 'L', last: 'Perfect, see you then!', time: '3h', unread: 0 },
];

const thread: Record<string, Msg[]> = {
  '1': [
    { id: '1', side: 'client', text: "Hi Mike! Just finished today's workout", time: '2:30 PM' },
    { id: '2', side: 'trainer', text: 'Awesome! How did it feel?', time: '2:32 PM' },
    { id: '3', side: 'client', text: 'Really good! The squats were challenging but manageable', time: '2:33 PM' },
    { id: '4', side: 'trainer', text: "That's great to hear!", time: '2:35 PM' },
    { id: '5', side: 'client', text: 'Thanks for the new workout plan!', time: '2:36 PM' },
  ],
};

export function TrainerMessagingScreen() {
  const [active, setActive] = useState<string | null>(null);
  const [text, setText] = useState('');
  const messages = active ? thread[active] ?? [] : [];

  if (!active) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>Messages</Text>
          <Text style={{ color: colors.textMuted, marginTop: 4 }}>Chat With Your Clients</Text>
        </View>
        <FlatList
          data={chats}
          keyExtractor={c => c.id}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setActive(item.id)}
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                padding: 14,
                marginBottom: 10,
                flexDirection: 'row',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>{item.letter}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontWeight: '900', color: colors.text }}>{item.name}</Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>{item.time}</Text>
                </View>
                <Text style={{ color: colors.textMuted, marginTop: 4 }} numberOfLines={1}>
                  {item.last}
                </Text>
              </View>
              {item.unread ? (
                <View
                  style={{
                    minWidth: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: colors.danger,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 6,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>{item.unread}</Text>
                </View>
              ) : null}
            </Pressable>
          )}
        />
      </SafeAreaView>
    );
  }

  const chat = chats.find(c => c.id === active);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.card,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Pressable onPress={() => setActive(null)} style={{ padding: 6 }}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '900' }}>{chat?.letter}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '900', color: colors.text }}>{chat?.name}</Text>
          <Text style={{ fontSize: 12, color: '#16a34a', fontWeight: '700' }}>● Online</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View
            style={{
              alignSelf: item.side === 'trainer' ? 'flex-end' : 'flex-start',
              maxWidth: '88%',
              marginBottom: 10,
            }}
          >
            <View
              style={{
                padding: 12,
                borderRadius: 14,
                backgroundColor: item.side === 'trainer' ? colors.primary : '#f1f5f9',
              }}
            >
              <Text style={{ color: item.side === 'trainer' ? '#fff' : colors.text }}>{item.text}</Text>
            </View>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4, paddingHorizontal: 6 }}>
              {item.time}
            </Text>
          </View>
        )}
      />

      <View
        style={{
          padding: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.card,
          flexDirection: 'row',
          gap: 8,
          alignItems: 'flex-end',
        }}
      >
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
          onPress={() => setText('')}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

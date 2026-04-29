import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ChatParticipantRole = 'member' | 'trainer';

export type Message = {
  id: string;
  threadKey: string; // stable key: `${trainerId}::${memberId}`
  fromRole: ChatParticipantRole;
  fromId: string;
  text: string;
  createdAt: string; // ISO
};

export type ThreadMeta = {
  threadKey: string;
  trainerId: string;
  memberId: string;
  lastMessageAt: string | null;
};

export type MessagingContextValue = {
  threads: ThreadMeta[];
  messagesByThread: Record<string, Message[]>;
  ensureThread: (args: { trainerId: string; memberId: string }) => string;
  sendMessage: (args: {
    trainerId: string;
    memberId: string;
    fromRole: ChatParticipantRole;
    fromId: string;
    text: string;
  }) => void;
  getThreadMessages: (threadKey: string) => Message[];
};

const STORAGE_KEY = 'chat:v1';

type Stored = {
  threads: ThreadMeta[];
  messagesByThread: Record<string, Message[]>;
};

const MessagingContext = createContext<MessagingContextValue | undefined>(undefined);

function threadKeyOf(trainerId: string, memberId: string) {
  return `${trainerId}::${memberId}`;
}

function sortThreads(a: ThreadMeta, b: ThreadMeta) {
  return (b.lastMessageAt ?? '').localeCompare(a.lastMessageAt ?? '');
}

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const [threads, setThreads] = useState<ThreadMeta[]>([]);
  const [messagesByThread, setMessagesByThread] = useState<Record<string, Message[]>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as Stored) : null;
        if (!mounted || !parsed) return;
        setThreads(Array.isArray(parsed.threads) ? parsed.threads.filter(Boolean).sort(sortThreads) : []);
        setMessagesByThread(parsed.messagesByThread ?? {});
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const payload: Stored = { threads, messagesByThread };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
  }, [threads, messagesByThread]);

  const ensureThread = ({ trainerId, memberId }: { trainerId: string; memberId: string }) => {
    const key = threadKeyOf(trainerId, memberId);
    setThreads(prev => {
      if (prev.some(t => t.threadKey === key)) return prev;
      return [{ threadKey: key, trainerId, memberId, lastMessageAt: null }, ...prev].sort(sortThreads);
    });
    setMessagesByThread(prev => (prev[key] ? prev : { ...prev, [key]: [] }));
    return key;
  };

  const sendMessage = ({
    trainerId,
    memberId,
    fromRole,
    fromId,
    text,
  }: {
    trainerId: string;
    memberId: string;
    fromRole: ChatParticipantRole;
    fromId: string;
    text: string;
  }) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const key = ensureThread({ trainerId, memberId });
    const now = new Date().toISOString();
    const msg: Message = {
      id: `msg-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
      threadKey: key,
      fromRole,
      fromId,
      text: trimmed,
      createdAt: now,
    };

    setMessagesByThread(prev => {
      const next = { ...(prev ?? {}) };
      next[key] = [...(next[key] ?? []), msg];
      return next;
    });
    setThreads(prev =>
      prev
        .map(t => (t.threadKey === key ? { ...t, lastMessageAt: now } : t))
        .sort(sortThreads),
    );
  };

  const api = useMemo<MessagingContextValue>(
    () => ({
      threads,
      messagesByThread,
      ensureThread,
      sendMessage,
      getThreadMessages: (key: string) => messagesByThread[key] ?? [],
    }),
    [threads, messagesByThread],
  );

  return <MessagingContext.Provider value={api}>{children}</MessagingContext.Provider>;
}

export function useMessaging() {
  const ctx = useContext(MessagingContext);
  if (!ctx) throw new Error('useMessaging must be used within MessagingProvider');
  return ctx;
}


import { useEffect, useRef, useState, useCallback } from 'react';
import type { Message } from '../types/message';
import { subscribeToConversation, sendMessage as svcSendMessage, getConversationMessages, markConversationRead, setTyping as svcSetTyping } from '../services/messages';
import { db, doc, onSnapshot } from '../utils/firebaseConfig';

type UseConversationResult = {
  messages: Message[];
  loading: boolean;
  sendText: (payload: string | { text?: string; attachments?: any[] }) => Promise<void>;
  isTyping: Record<string, any>;
  setTyping: (isTyping: boolean) => void;
  retrySend: (message: Message) => Promise<void>;
};

export default function useConversation(conversationId: string, currentUserId: string): UseConversationResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTypingMap, setIsTypingMap] = useState<Record<string, any>>({});
  const typingTimer = useRef<any>(null);

  useEffect(() => {
    let unsub = () => {};
    setLoading(true);
    // initial load
    getConversationMessages(conversationId)
      .then((msgs) => {
        setMessages(msgs);
        setLoading(false);
        // mark read on initial load
        if (msgs.length) markConversationRead(conversationId, currentUserId).catch(() => null);
      })
      .catch(() => setLoading(false));

    // realtime subscription
    unsub = subscribeToConversation(conversationId, (msgs) => {
      // reconcile optimistic local messages with server messages
      const serverClientIds = new Set(msgs.map((m) => m.clientId).filter(Boolean));
      const prev = messagesRef.current || [];
      const pending = prev.filter((m) => m.clientId && !serverClientIds.has(m.clientId));
      const merged = [...msgs, ...pending];
      setMessages(merged);
      // mark read when new messages arrive
      if (msgs.length) markConversationRead(conversationId, currentUserId).catch(() => null);
    });

    // subscribe to conversation metadata (typing map, participants)
    const convRef = doc(db, 'conversations', conversationId);
    const unsubMeta = onSnapshot(convRef, (snap: any) => {
      const data = snap.data() as any;
      if (data?.typing) setIsTypingMap(data.typing);
    });

    return () => {
      if (typeof unsub === 'function') unsub();
      if (typeof unsubMeta === 'function') unsubMeta();
    };
  }, [conversationId, currentUserId]);

  const sendText = useCallback(async (textOrPayload: string | { text?: string; attachments?: any[] }) => {
    const text = typeof textOrPayload === 'string' ? textOrPayload : textOrPayload.text ?? '';
    const attachments = typeof textOrPayload === 'string' ? undefined : textOrPayload.attachments;
    if (!text.trim() && (!attachments || attachments.length === 0)) return;

    // optimistic local message
    const clientId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const tempMsg: Message = {
      id: clientId,
      clientId,
      conversationId,
      senderId: currentUserId,
      text,
      attachments: attachments || undefined,
      createdAt: new Date().toISOString(),
      read: false,
      readBy: [currentUserId],
      status: 'sending',
    };
    setMessages((prev) => {
      const next = [...prev, tempMsg];
      messagesRef.current = next;
      return next;
    });

    try {
      await svcSendMessage(conversationId, { conversationId, senderId: currentUserId, text, attachments, clientId, read: false } as any);
      // mark as sent (server snapshot may replace this soon)
      setMessages((prev) => prev.map((m) => (m.clientId === clientId ? { ...m, status: 'sent' } : m)));
    } catch (err) {
      console.error('sendText error', err);
      // mark optimistic message as failed
      setMessages((prev) => prev.map((m) => (m.clientId === clientId ? { ...m, status: 'failed' } : m)));
      throw err;
    }
  }, [conversationId, currentUserId]);

  const retrySend = useCallback(async (message: Message) => {
    if (!message.clientId) return;
    const clientId = message.clientId;
    // set status to sending locally
    setMessages((prev) => prev.map((m) => (m.clientId === clientId ? { ...m, status: 'sending' } : m)));
    try {
      await svcSendMessage(conversationId, { conversationId, senderId: currentUserId, text: message.text ?? '', attachments: message.attachments, clientId, read: false } as any);
      setMessages((prev) => prev.map((m) => (m.clientId === clientId ? { ...m, status: 'sent' } : m)));
    } catch (err) {
      console.error('retrySend error', err);
      setMessages((prev) => prev.map((m) => (m.clientId === clientId ? { ...m, status: 'failed' } : m)));
      throw err;
    }
  }, [conversationId, currentUserId]);

  // set typing status with debounce
  const setTyping = useCallback((isTyping: boolean) => {
    // update remote
    svcSetTyping(conversationId, currentUserId, isTyping).catch(() => null);
    // local map: we don't track others here
    if (isTyping) {
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => {
        svcSetTyping(conversationId, currentUserId, false).catch(() => null);
      }, 1500);
    } else {
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
        typingTimer.current = null;
      }
    }
  }, [conversationId, currentUserId]);

  return { messages, loading, sendText, isTyping: isTypingMap, setTyping, retrySend };
}

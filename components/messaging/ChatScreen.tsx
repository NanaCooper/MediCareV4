import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
// Assuming you have a standard icon library for a real app, e.g., 'react-native-vector-icons/Ionicons'
// For this example, I'll use text emojis/symbols for the icons.

import { sendMessage, subscribeToConversation, setTyping } from "../../services/messages";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MessageBubble from './messageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

// 🩺 Modern Healthcare Chat Colors & Constants
const HEALTHCARE_PRIMARY = '#007aff'; // Clean iOS Blue for trust/professionalism
const USER_BUBBLE_COLOR = HEALTHCARE_PRIMARY; // User's messages
const PROFESSIONAL_BUBBLE_COLOR = '#ffffff'; // Doctor/Nurse/AI messages
const CHAT_BACKGROUND = '#f8f8f8'; // Very light gray/off-white background
const TEXT_COLOR_DARK = '#1c1c1e';
const TEXT_COLOR_SUBTLE = '#8e8e93';
const BUBBLE_RADIUS_CLEAN = 18;

export interface ChatMessage {
  id: string;
  text?: string;
  isOwn?: boolean;
  timestamp?: string;
}

interface ChatScreenProps {
  conversationId: string;
  conversationName: string;
  currentUserId?: string;
  currentUserName?: string;
  isOnline?: boolean;
  isTyping?: boolean;
  typingUserName?: string;
  onSendMessage?: (text: string) => Promise<void> | void;
  initialMessages?: ChatMessage[];
}

export default function ChatScreen({
  conversationId,
  conversationName,
  currentUserId,
  currentUserName,
  // We'll rename isOnline to isProviderAvailable for context
  isOnline: isProviderAvailable = true,
  isTyping = false,
  typingUserName,
  onSendMessage,
  initialMessages = [],
}: ChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    initialMessages.length
      ? initialMessages
      : [
          {
            id: "m0",
            text: `You are connected with Dr. Elara Vance, General Practitioner. How can I help you today?`,
            isOwn: false,
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          },
          {
            id: "m1",
            text: "Hi Doctor — I woke up with a sharp pain in my lower back this morning.",
            isOwn: true,
            timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
          },
          {
            id: "m2",
            text: "Does it radiate down your leg or stay localized?",
            isOwn: false,
            timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
          },
          {
            id: "m3",
            text: "It mostly stays in the lower back, but I felt a twinge down the left leg once.",
            isOwn: true,
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          },
          {
            id: "m4",
            text: "Can you send a photo of the swelling area if any?",
            isOwn: false,
            timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          },
          {
            id: "m5",
            text: "(photo attached)",
            isOwn: true,
            timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
            // @ts-ignore - mock attachments for MessageBubble
            attachments: [
              { url: 'https://via.placeholder.com/320x240.png?text=back+photo', type: 'image/png' },
            ],
            // mock a sending status to show spinner
            // @ts-ignore
            status: 'sending',
          },
          {
            id: "m6",
            text: "I recommend an X-ray if swelling persists. Also try to rest and avoid heavy lifting.",
            isOwn: false,
            timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
          },
          {
            id: "m7",
            text: "This message previously failed — retry works.",
            isOwn: true,
            timestamp: new Date().toISOString(),
            // @ts-ignore
            status: 'failed',
          },
        ]
  );

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // scroll to bottom when messages change
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages]);

  // Subscribe to real-time messages if a conversationId exists
  useEffect(() => {
    let unsub: any;
    if (conversationId) {
      unsub = subscribeToConversation(conversationId, (msgs: any[]) => {
        const mapped = msgs.map((m: any) => ({
          id: m.id,
          text: m.text,
          isOwn: m.senderId === currentUserId,
          timestamp: m.createdAt && m.createdAt.toDate ? m.createdAt.toDate().toISOString() : (m.createdAt || new Date().toISOString()),
        } as ChatMessage));
        setMessages(mapped);
      });
    }
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [conversationId, currentUserId]);

  const sendPayload = async (payload: { text?: string; attachments?: any[] }) => {
    const text = (payload.text || '').trim();
    const tempId = `c-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: tempId,
      text,
      isOwn: true,
      timestamp: new Date().toISOString(),
    };
  // show optimistic message
  setMessages((prev) => [...prev, optimistic]);

    try {
      await sendMessage(conversationId, {
        conversationId,
        senderId: currentUserId || "",
        text,
        clientId: tempId,
        type: 'text',
        attachments: payload.attachments,
      } as any);
    } catch {
      // fallback to prop
      try { await onSendMessage?.(text); } catch {}
    }
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    // adapt local ChatMessage to Message type expected by MessageBubble
    const messageForBubble: any = {
      id: item.id,
      text: item.text,
      senderId: item.isOwn ? (currentUserId || 'me') : 'other',
      // messageBubble expects either a string or a firestore-like timestamp; pass ISO string
      createdAt: item.timestamp ? item.timestamp : new Date().toISOString(),
      attachments: (item as any).attachments,
      status: (item as any).status || 'sent',
    };
    return (
      <View style={[styles.messageRow, item.isOwn ? styles.rowOwn : styles.rowOther]}>
        {/* Pass the custom styles to MessageBubble (assumes MessageBubble applies them) */}
        <MessageBubble message={messageForBubble} currentUserId={currentUserId || ''} onRetry={handleRetry} />
      </View>
    );
  };

  function handleRetry(message: any) {
    // Re-send a failed message: build a payload and send via sendPayload
    if (!message) return;
    const payload = { text: message.text, attachments: message.attachments };
    sendPayload(payload as any);
  }


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Back Button */}
          <TouchableOpacity style={styles.iconBtn} accessibilityLabel="Back">
            <Text style={styles.backIcon}>{"<"}</Text>
          </TouchableOpacity>
          {/* Avatar and Info */}
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarInitial}>{String(conversationName || 'D').charAt(0)}</Text>
            {/* Status dot */}
            <View style={[styles.statusDot, isProviderAvailable ? styles.statusDotOnline : styles.statusDotOffline]} />
          </View>
          <View style={styles.headerMeta}>
            <Text style={styles.headerTitle}>{conversationName || "Doctor's Name"}</Text>
            <Text style={styles.headerSub}>{isTyping ? `Dr. is typing...` : isProviderAvailable ? "Available" : "Offline"}</Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} accessibilityLabel="Start video call" onPress={() => console.log('start video', conversationId)}>
            <MaterialCommunityIcons name="video" size={20} color={HEALTHCARE_PRIMARY} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} accessibilityLabel="End consultation" onPress={() => console.log('end consult', conversationId)}>
            <MaterialCommunityIcons name="close" size={20} color="#e23b3b" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
        <FlatList
          ref={flatListRef}
          data={[...messages].slice().reverse()}
          inverted
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          keyboardDismissMode="interactive"
        />

  {/* Typing indicator */}
  {isTyping ? <TypingIndicator /> : null}

        <MessageInput
          onSend={async (payload) => {
            await sendPayload(payload as any);
          }}
          onTyping={async (v) => {
            try {
              if (conversationId && currentUserId) await setTyping(conversationId, currentUserId, v);
            } catch {
              // ignore
            }
          }}
          onAttach={async (file) => {
            // handle file attachment (no-op upload here)
            return Promise.resolve(file);
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  // 1. Clean Background
  container: { flex: 1, backgroundColor: CHAT_BACKGROUND }, 

  // 2. Professional Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff', // Pure white
    borderBottomWidth: 1, // Subtle border
    borderBottomColor: '#ebebeb', 
    ...Platform.select({ 
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
    }),
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backIcon: { fontSize: 26, color: HEALTHCARE_PRIMARY, marginRight: 10 },
  headerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e0f0ff', justifyContent: 'center', alignItems: 'center', marginRight: 10, position: 'relative' },
  headerAvatarInitial: { color: HEALTHCARE_PRIMARY, fontWeight: '600', fontSize: 20 },
  statusDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#fff' },
  statusDotOnline: { backgroundColor: '#4cd964' }, // Green for available
  statusDotOffline: { backgroundColor: '#ffcc00' }, // Yellow/Gray for busy/offline
  headerMeta: { justifyContent: 'center', flexShrink: 1 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: TEXT_COLOR_DARK },
  headerSub: { fontSize: 13, color: TEXT_COLOR_SUBTLE, marginTop: 2 }, 
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { marginLeft: 10, padding: 6 },
  iconText: { fontSize: 24, color: HEALTHCARE_PRIMARY },

  // 3. Chat List Content
  listContent: { paddingHorizontal: 12, paddingVertical: 15 },
  
  // Message Row 
  messageRow: { marginVertical: 4, flexDirection: 'row', alignItems: 'flex-end', maxWidth: '100%' },
  rowOwn: { justifyContent: 'flex-end' },
  rowOther: { justifyContent: 'flex-start' },

  // 4. Polished Message Bubble Styles 
  bubbleWrap: { marginVertical: 4, flexDirection: 'row', alignItems: 'flex-end' },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BUBBLE_RADIUS_CLEAN,
    shadowOpacity: 0.05, 
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  // User (Patient) Bubble
  bubbleOwn: { 
    backgroundColor: USER_BUBBLE_COLOR,
    shadowColor: USER_BUBBLE_COLOR,
  },
  // Professional (Doctor/Nurse) Bubble - White/Clean
  bubbleOther: { 
    backgroundColor: PROFESSIONAL_BUBBLE_COLOR,
    shadowColor: '#000',
  },
  
  // Text style changes
  messageText: { fontSize: 16, color: TEXT_COLOR_DARK, flexShrink: 1, flexWrap: 'wrap', lineHeight: 22 },
  messageTextOwn: { color: '#fff' }, // White text on primary color bubble
  
  // Time/Meta data
  timeText: { fontSize: 11, color: TEXT_COLOR_SUBTLE, marginTop: 4, textAlign: 'right', marginRight: 4, marginLeft: 4 }, 
  
  // Typing Indicator (Modernized colors)
  typingRow: { paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'transparent' },
  typingText: { fontSize: 14, color: TEXT_COLOR_SUBTLE, fontStyle: 'italic' },
  typingDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: HEALTHCARE_PRIMARY },
  typingDot1: { opacity: 0.5 },
  typingDot2: { opacity: 0.7 },
  typingDot3: { opacity: 1 },

  // 5. Input Area (MessageInput component styles)
  inputRow: { 
    flexDirection: 'row', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    backgroundColor: '#fff', 
    alignItems: 'flex-end', 
    borderTopWidth: 1, 
    borderTopColor: '#ebebeb',
  },
  // Attachment Button (More subtle)
  attachBtn: { 
    padding: 8, 
    marginLeft: 0, 
    marginRight: 4 
  },
  // Text Input field (Rounded, light background)
  input: { 
    flex: 1, 
    minHeight: 40, 
    maxHeight: 140, 
    paddingHorizontal: 16, 
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    borderRadius: 20, 
    backgroundColor: '#f2f4f7', // Light gray input background
    fontSize: 16,
    color: TEXT_COLOR_DARK,
  },
  // Send Button (Primary color, slightly larger touch target)
  sendBtn: { 
    marginLeft: 8, 
    width: 40,
    height: 40,
    borderRadius: 20, 
    backgroundColor: HEALTHCARE_PRIMARY, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 0, 
  },
  sendBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },

  // Clean-up/Reset styles for the professional look
  bubbleContainerOwn: { justifyContent: 'flex-end' },
  bubbleContainerOther: { justifyContent: 'flex-start' },
  avatarWrap: { marginRight: 8 },
  avatarCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: HEALTHCARE_PRIMARY, fontWeight: '700' },
  metaRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 6 },
  readTick: { fontSize: 12, color: '#dbeafe', marginLeft: 6 },
  avatarGap: { width: 36 },
  bubbleContainer: { flexDirection: 'row', alignItems: 'flex-end', position: 'relative' },
  bubbleTail: { width: 0, height: 0 }, // Removed tails for clean look
  bubbleTailOwn: { right: 0, backgroundColor: 'transparent' },
  bubbleTailOther: { left: 0, backgroundColor: 'transparent' },
});
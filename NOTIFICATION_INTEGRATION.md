# Notification System Integration Guide

This guide shows how to integrate the notification system into your MediCare app.

## 1. App Root Setup

In `app/_layout.tsx` or your main app component:

```typescript
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  initializeNotifications,
  setupNotificationResponseListener,
} from '../services/notifications';

export default function RootLayout() {
  const navigation = useNavigation();

  useEffect(() => {
    // Initialize notifications when app starts
    initializeNotifications().catch(error => {
      console.warn('Failed to initialize notifications:', error);
    });

    // Handle when user taps on a notification
    const subscription = setupNotificationResponseListener(
      (conversationId, messageId) => {
        // Navigate to the conversation and highlight the message
        navigation.navigate('Messages', {
          conversationId,
          messageId,
          highlightMessageId: messageId,
        });
      }
    );

    // Cleanup listener on unmount
    return () => {
      subscription.remove();
    };
  }, [navigation]);

  // ... rest of layout
}
```

## 2. Send Notifications on New Messages

Update `services/messages.ts`:

```typescript
import {
  sendMessageNotification,
  sendUrgentMessageNotification,
} from '../services/notifications';

export function subscribeToConversationWithNotifications(
  conversationId: string,
  currentUserId: string,
  cb: (messages: Message[]) => void
) {
  const messagesCol = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesCol, orderBy('createdAt', 'asc'));

  let lastNotifiedMessageId: string | null = null;

  return onSnapshot(q, (snap: any) => {
    const items = snap.docs.map((d: any) => ({
      id: d.id,
      ...(d.data() as any),
    } as Message));

    cb(items);

    // Send notification for latest unread message from other user
    if (items.length > 0) {
      const latestMessage = items[items.length - 1];

      // Only notify if:
      // 1. Not from current user
      // 2. Not already notified for this message
      // 3. Message is recent (created in last 30 seconds)
      if (
        latestMessage.senderId !== currentUserId &&
        latestMessage.id !== lastNotifiedMessageId &&
        Date.now() - new Date(latestMessage.createdAt).getTime() < 30000
      ) {
        lastNotifiedMessageId = latestMessage.id;

        // Send appropriate notification based on message type
        if (latestMessage.isUrgent) {
          sendUrgentMessageNotification(
            latestMessage.senderName,
            latestMessage.text || '(Urgent message)',
            conversationId,
            latestMessage.id,
            latestMessage.urgentReason,
            {
              conversationType: latestMessage.type || 'text',
            }
          ).catch(error => {
            console.error('Failed to send urgent notification:', error);
          });
        } else {
          sendMessageNotification(
            latestMessage.senderName,
            latestMessage.text || '(Message)',
            conversationId,
            latestMessage.id,
            false,
            {
              conversationType: latestMessage.type || 'text',
            }
          ).catch(error => {
            console.error('Failed to send notification:', error);
          });
        }
      }
    }
  });
}
```

## 3. Handle Conversation Opening

In your ChatScreen component:

```typescript
import {
  handleConversationOpened,
  markConversationAsRead,
} from '../services/notifications';

export function ChatScreen({ conversationId }: ChatScreenProps) {
  useEffect(() => {
    if (conversationId) {
      // Decrement badge count when conversation is opened
      handleConversationOpened(conversationId);

      // Mark all messages as read in Firestore
      markConversationAsRead(conversationId).catch(error => {
        console.error('Failed to mark conversation as read:', error);
      });
    }
  }, [conversationId]);

  // ... rest of component
}
```

## 4. Add Notification Settings to Profile

In your profile or settings screen:

```typescript
import { useState } from 'react';
import { Modal, TouchableOpacity, Text, View } from 'react-native';
import NotificationSettings from '../components/NotificationSettings';

export function ProfileScreen() {
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  return (
    <View>
      {/* Other profile settings... */}

      {/* Notification Settings Button */}
      <TouchableOpacity
        onPress={() => setShowNotificationSettings(true)}
        style={{
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#eee',
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#0f1724' }}>
          🔔 Notification Settings
        </Text>
      </TouchableOpacity>

      {/* Notification Settings Modal */}
      <Modal
        visible={showNotificationSettings}
        animationType="slide"
        onRequestClose={() => setShowNotificationSettings(false)}
      >
        <NotificationSettings
          onClose={() => setShowNotificationSettings(false)}
        />
      </Modal>
    </View>
  );
}
```

## 5. Add Mute/Unmute in Conversation Header

In your ChatScreen:

```typescript
import {
  isConversationMuted,
  muteConversation,
  unmuteConversation,
} from '../services/notifications';

export function ChatScreenHeader({ conversationId, conversationName }: any) {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Check if conversation is muted
    isConversationMuted(conversationId).then(muted => {
      setIsMuted(muted);
    });
  }, [conversationId]);

  const handleToggleMute = async () => {
    try {
      if (isMuted) {
        await unmuteConversation(conversationId);
        setIsMuted(false);
      } else {
        await muteConversation(conversationId);
        setIsMuted(true);
      }
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  };

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ fontSize: 16, fontWeight: '600' }}>{conversationName}</Text>
      <TouchableOpacity onPress={handleToggleMute}>
        <Text style={{ fontSize: 20 }}>
          {isMuted ? '🔇' : '🔔'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

## 6. Use Notification Preferences in Your App

```typescript
import { getNotificationPreferences } from '../services/notifications';

export async function checkNotificationsEnabled(): Promise<boolean> {
  const prefs = await getNotificationPreferences();
  return prefs.enabled;
}

export async function disableSoundNotifications() {
  const prefs = await getNotificationPreferences();
  await updateNotificationPreferences({
    ...prefs,
    soundEnabled: false,
  });
}
```

## Testing Checklist

### 1. Permissions
- [ ] App requests notification permission on first launch
- [ ] User can grant/deny permissions
- [ ] Respects user's choice

### 2. New Message Notifications
- [ ] Receive notification for new message from other user
- [ ] Notification contains sender name and message preview
- [ ] No notification for own messages
- [ ] Notification disappears when conversation is opened

### 3. Badge Counter
- [ ] Badge shows correct count on app icon
- [ ] Badge increments when notification received
- [ ] Badge decrements when conversation opened
- [ ] Badge clears when all notifications cleared

### 4. Urgent Messages
- [ ] Urgent messages show different notification (🚨 prefix)
- [ ] Urgent messages always show badge (even if sounds off)
- [ ] Urgent reason displayed in notification

### 5. Sound Alerts
- [ ] Sound plays when notification received (if enabled)
- [ ] Sound can be disabled in settings
- [ ] Muted conversations don't play sound
- [ ] System volume respected

### 6. Notification Settings
- [ ] Can enable/disable all notifications
- [ ] Can enable/disable sound separately
- [ ] Can enable/disable badge separately
- [ ] Can mute specific conversations
- [ ] Settings persist across app restarts

### 7. Conversation Muting
- [ ] Can mute notifications for specific conversation
- [ ] Muted conversation doesn't show badge or sound
- [ ] Can unmute conversation
- [ ] Mute status shows in conversation header

### 8. Notification Response
- [ ] Tapping notification navigates to conversation
- [ ] Notification is removed from notification center
- [ ] Badge decrements when notification tapped
- [ ] Correct message highlighted in conversation

### 9. Edge Cases
- [ ] No crash if permission denied
- [ ] No crash if notification fails
- [ ] Handles rapid new messages correctly
- [ ] Handles offline scenario gracefully
- [ ] Works with background app (if supported)

### 10. Performance
- [ ] No significant battery drain
- [ ] No memory leaks from listeners
- [ ] Notification delivery is fast (<1 second)
- [ ] UI responsive during notification handling

## Common Issues & Solutions

### Notifications not appearing
- Check: `await getNotificationPreferences()` → `enabled` should be true
- Check: `!await isConversationMuted(conversationId)`
- Check: Notification permission granted in device settings
- Check: Message is from different user (not own message)
- Test: Call `sendMessageNotification()` manually to debug

### Badge count stuck or incorrect
- Reset: `await clearBadgeCount()`
- Check: `await getBadgeCount()` should match actual count
- Verify: `badgeEnabled` is true in preferences

### Sound not playing
- Check: `prefs.soundEnabled === true`
- Check: System volume not muted
- Check: Device not in silent mode
- Check: Conversation not muted

### Tapping notification doesn't navigate
- Verify: `setupNotificationResponseListener()` called in app root
- Check: Navigation ref properly initialized
- Test: Make sure notification data includes conversationId

### Memory leak from notification listener
- Ensure: `subscription.remove()` called in useEffect cleanup
- Check: No multiple listeners on same conversation
- Verify: Components unmount properly

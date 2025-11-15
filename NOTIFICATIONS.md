# MediCare Notification System

## Overview

The MediCare notification system provides comprehensive push/local notification support for new messages with the following features:

- **Desktop/Push Notifications**: Users receive notifications for new messages
- **Sound Alerts**: Optional sound notifications for incoming messages
- **Badge Counters**: App icon badge showing unread message count
- **Urgent Message Handling**: Special handling for urgent medical messages
- **Conversation Muting**: Ability to mute specific conversations
- **Notification Preferences**: User-configurable notification settings

## Architecture

### Service: `services/notifications.ts`

The core notification service provides:

#### Initialization
```typescript
// Call once when app launches
await initializeNotifications();
```

Handles:
- Requesting notification permissions
- Setting up Android notification channels (default, urgent-messages, regular-messages)
- Loading saved preferences

#### Notification Sending

**Regular Messages**
```typescript
await sendMessageNotification(
  title,        // Sender name
  body,         // Message preview
  conversationId,
  messageId,
  isUrgent,     // boolean
  data          // additional metadata
);
```

**Urgent Messages**
```typescript
await sendUrgentMessageNotification(
  title,
  body,
  conversationId,
  messageId,
  urgencyReason,  // "Severe Symptoms", "Critical Result", etc.
  data
);
```

#### Badge Management

```typescript
// Get current badge count
const count = await getBadgeCount();

// Increment badge (called automatically on notification)
await incrementBadgeCount();

// Decrement badge (called when conversation opened)
await decrementBadgeCount();

// Clear all badges
await clearBadgeCount();

// Mark conversation as read
await markConversationAsRead(conversationId);
```

#### Conversation Muting

```typescript
// Mute notifications for a conversation
await muteConversation(conversationId);

// Unmute notifications
await unmuteConversation(conversationId);

// Check mute status
const isMuted = await isConversationMuted(conversationId);
```

#### Preferences Management

```typescript
// Get current preferences
const prefs = await getNotificationPreferences();
// Returns: {
//   enabled: boolean,
//   soundEnabled: boolean,
//   badgeEnabled: boolean,
//   mutedConversations: string[]
// }

// Update preferences
await updateNotificationPreferences({
  enabled: true,
  soundEnabled: false,
  badgeEnabled: true
});
```

#### Response Handling

```typescript
// Set up listener for notification taps
const subscription = setupNotificationResponseListener(
  (conversationId, messageId) => {
    // Navigate to conversation
    navigation.navigate('Messages', {
      conversationId,
      messageId
    });
  }
);

// Clean up when done
subscription.remove();
```

## UI Component: `components/NotificationSettings.tsx`

React Native component for notification preferences UI.

### Usage

```typescript
import NotificationSettings from '../components/NotificationSettings';

// Global settings only
<NotificationSettings onClose={() => setShowSettings(false)} />

// With conversation-specific mute option
<NotificationSettings
  currentConversationId="conv-123"
  conversationName="Dr. John Smith"
  onClose={() => setShowSettings(false)}
/>
```

### Features

- Global notification settings (enable/disable all)
- Sound toggle
- Badge counter toggle
- Conversation-specific mute option
- Helpful tips and information
- Clean, accessible UI

## Integration Guide

### 1. App Root Setup

In your main app component or `_layout.tsx`:

```typescript
import { initializeNotifications, setupNotificationResponseListener } from '../services/notifications';
import { useNavigation } from '@react-navigation/native';

export default function RootLayout() {
  const navigation = useNavigation();

  useEffect(() => {
    // Initialize notifications on app start
    initializeNotifications();

    // Set up notification tap handler
    const subscription = setupNotificationResponseListener(
      (conversationId, messageId) => {
        navigation.navigate('Messages', {
          conversationId,
          messageId,
          highlightMessageId: messageId
        });
      }
    );

    // Cleanup
    return () => subscription.remove();
  }, [navigation]);

  return <Stack />;
}
```

### 2. Send Notifications on New Messages

In your messages service or message listener:

```typescript
import { sendMessageNotification, sendUrgentMessageNotification } from '../services/notifications';

// Listen to new messages
subscribeToConversation(conversationId, (messages) => {
  const latestMessage = messages[messages.length - 1];

  // Send notification for new message from other user
  if (!latestMessage.isOwn && latestMessage.createdAt > lastMessageTime) {
    if (latestMessage.isUrgent) {
      await sendUrgentMessageNotification(
        latestMessage.senderName,
        latestMessage.text,
        conversationId,
        latestMessage.id,
        latestMessage.urgentReason
      );
    } else {
      await sendMessageNotification(
        latestMessage.senderName,
        latestMessage.text || 'Sent a message',
        conversationId,
        latestMessage.id,
        false
      );
    }
  }
});
```

### 3. Handle Conversation Opening

When user opens a conversation:

```typescript
import { handleConversationOpened, markConversationAsRead } from '../services/notifications';

useEffect(() => {
  if (conversationId) {
    // Decrement badge when conversation opened
    handleConversationOpened(conversationId);
    
    // Mark as read in Firestore
    markConversationAsRead(conversationId);
  }
}, [conversationId]);
```

### 4. Add Settings to UI

In user profile or settings screen:

```typescript
import { useState } from 'react';
import NotificationSettings from '../components/NotificationSettings';

export function SettingsScreen() {
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowNotificationSettings(true)}
        style={styles.settingButton}
      >
        <Text>Notification Settings</Text>
      </TouchableOpacity>

      <Modal visible={showNotificationSettings}>
        <NotificationSettings
          onClose={() => setShowNotificationSettings(false)}
        />
      </Modal>
    </>
  );
}
```

## Data Storage

Notification preferences are stored in AsyncStorage:

```
Key: 'notificationPreferences'
Value: {
  enabled: boolean,
  soundEnabled: boolean,
  badgeEnabled: boolean,
  mutedConversations: string[]
}
```

Badge count is stored separately:

```
Key: 'badgeCount'
Value: number
```

## Android Notification Channels

The system creates three Android notification channels:

1. **default** - General notifications (MAX importance)
2. **urgent-messages** - Critical medical messages (MAX importance, red light, double vibration)
3. **regular-messages** - Standard messages (DEFAULT importance)

Users can customize channel settings in Android Settings > Apps > MediCare > Notifications.

## iOS Considerations

- Uses native UNUserNotificationCenter
- Badge count automatically managed
- Sound alerts play from system sounds
- No special setup required beyond permissions request

## Accessibility

- All UI components include labels and descriptions
- Color not the only indicator (icons and text used)
- Touch targets are 44+ pts minimum
- High contrast colors for readability

## Security & Privacy

- Notifications contain only message preview (no full content for privacy)
- Conversation ID and message ID stored in notification data
- No sensitive medical data in notification body
- Urgent flag and reason stored separately
- User preferences stored locally in encrypted AsyncStorage

## Error Handling

All functions include try-catch blocks:

```typescript
try {
  await sendMessageNotification(...);
} catch (error) {
  console.error('Failed to send notification:', error);
  // Continues operation - notification failure doesn't block message sending
}
```

Failed notifications don't prevent normal app operation.

## Performance

- Notifications sent immediately (no delay)
- Badge updates use batching where possible
- Android vibration patterns optimized for battery
- No background processing required
- Memory-efficient preference storage

## Troubleshooting

### Notifications not appearing

1. Check permission status: `await getNotificationSettings()`
2. Verify preferences: `await getNotificationPreferences()`
3. Check mute status: `await isConversationMuted(conversationId)`
4. Enable notifications: `await updateNotificationPreferences({ enabled: true })`

### Badge count not updating

1. Verify badgeEnabled: `prefs.badgeEnabled === true`
2. Check AsyncStorage: `await getBadgeCount()`
3. Reset count: `await clearBadgeCount()`

### Sound not playing

1. Check soundEnabled: `prefs.soundEnabled === true`
2. Verify system volume not muted
3. Check conversation not muted: `!await isConversationMuted(conversationId)`

## Future Enhancements

- [ ] Remote push notifications via Firebase Cloud Messaging
- [ ] Do Not Disturb scheduling
- [ ] Notification sound selection
- [ ] Per-contact notification preferences
- [ ] Rich media notifications (images from messages)
- [ ] Notification grouping by conversation
- [ ] Background message sync

## Dependencies

- `expo-notifications` - ^0.32.12
- `@react-native-async-storage/async-storage` - 2.2.0
- React Native >= 0.81.5

## Files Modified

- Created: `services/notifications.ts` (300+ lines)
- Created: `components/NotificationSettings.tsx` (250+ lines)
- Documentation: `NOTIFICATIONS.md` (this file)

To integrate:
1. ✅ Add `services/notifications.ts`
2. ✅ Add `components/NotificationSettings.tsx`
3. Initialize notifications in app root
4. Send notifications on new messages
5. Add settings UI to profile/settings screen
6. Test on physical device (simulator may not support all features)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  muteConversation,
  unmuteConversation,
  isConversationMuted,
  NotificationPreferences,
} from '../services/notifications';

interface NotificationSettingsProps {
  onClose?: () => void;
  currentConversationId?: string;
  conversationName?: string;
}

/**
 * Notification Settings UI Component
 * Allows users to configure:
 * - Enable/disable notifications
 * - Enable/disable sound
 * - Enable/disable badge counter
 * - Mute specific conversations
 */
export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  onClose,
  currentConversationId,
  conversationName,
}) => {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const preferences = await getNotificationPreferences();
        setPrefs(preferences);

        if (currentConversationId) {
          const muted = await isConversationMuted(currentConversationId);
          setIsMuted(muted);
        }

        setLoading(false);
      } catch {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [currentConversationId]);

  const handleToggleNotifications = async (enabled: boolean) => {
    if (!prefs) return;

    try {
      const updated = await updateNotificationPreferences({
        ...prefs,
        enabled,
      });
      setPrefs(updated);
    } catch {
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const handleToggleSound = async (enabled: boolean) => {
    if (!prefs) return;

    try {
      const updated = await updateNotificationPreferences({
        ...prefs,
        soundEnabled: enabled,
      });
      setPrefs(updated);
    } catch {
      Alert.alert('Error', 'Failed to update sound settings');
    }
  };

  const handleToggleBadge = async (enabled: boolean) => {
    if (!prefs) return;

    try {
      const updated = await updateNotificationPreferences({
        ...prefs,
        badgeEnabled: enabled,
      });
      setPrefs(updated);
    } catch {
      Alert.alert('Error', 'Failed to update badge settings');
    }
  };

  const handleToggleMute = async (muted: boolean) => {
    if (!currentConversationId) return;

    try {
      if (muted) {
        await muteConversation(currentConversationId);
      } else {
        await unmuteConversation(currentConversationId);
      }
      setIsMuted(muted);
    } catch {
      Alert.alert('Error', 'Failed to update mute status');
    }
  };

  if (loading || !prefs) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Notification Settings</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Global Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Global Settings</Text>

          {/* Enable Notifications */}
          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications for new messages
              </Text>
            </View>
            <Switch
              value={prefs.enabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#ccc', true: '#81c784' }}
              thumbColor={prefs.enabled ? '#4caf50' : '#999'}
            />
          </View>

          {/* Enable Sound */}
          <View
            style={[
              styles.settingRow,
              !prefs.enabled && styles.disabledRow,
            ]}
          >
            <View style={styles.settingLabel}>
              <Text style={styles.settingTitle}>Sound</Text>
              <Text style={styles.settingDescription}>
                Play sound for notifications
              </Text>
            </View>
            <Switch
              value={prefs.soundEnabled}
              onValueChange={handleToggleSound}
              disabled={!prefs.enabled}
              trackColor={{ false: '#ccc', true: '#81c784' }}
              thumbColor={prefs.soundEnabled ? '#4caf50' : '#999'}
            />
          </View>

          {/* Badge Counter */}
          <View
            style={[
              styles.settingRow,
              !prefs.enabled && styles.disabledRow,
            ]}
          >
            <View style={styles.settingLabel}>
              <Text style={styles.settingTitle}>Badge Counter</Text>
              <Text style={styles.settingDescription}>
                Show unread message badge on app icon
              </Text>
            </View>
            <Switch
              value={prefs.badgeEnabled}
              onValueChange={handleToggleBadge}
              disabled={!prefs.enabled}
              trackColor={{ false: '#ccc', true: '#81c784' }}
              thumbColor={prefs.badgeEnabled ? '#4caf50' : '#999'}
            />
          </View>
        </View>

        {/* Conversation-Specific Settings */}
        {currentConversationId && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {conversationName || 'This Conversation'}
            </Text>

            <View style={styles.settingRow}>
              <View style={styles.settingLabel}>
                <Text style={styles.settingTitle}>Mute Notifications</Text>
                <Text style={styles.settingDescription}>
                  {isMuted
                    ? 'Notifications muted for this conversation'
                    : 'Click to mute notifications'}
                </Text>
              </View>
              <Switch
                value={isMuted}
                onValueChange={handleToggleMute}
                trackColor={{ false: '#ccc', true: '#81c784' }}
                thumbColor={isMuted ? '#4caf50' : '#999'}
              />
            </View>
          </View>
        )}

        {/* Info Section */}
        <View style={styles.section}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>💡 Tips</Text>
            <Text style={styles.infoText}>
              • Enable badge counter to see your unread message count{'\n'}
              • Mute conversations to silence notifications without turning off all notifications{'\n'}
              • Urgent messages will always play a sound notification (when enabled)
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f1724',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0b6efd',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingRow_last: {
    borderBottomWidth: 0,
  },
  disabledRow: {
    opacity: 0.5,
  },
  settingLabel: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f1724',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  infoBox: {
    backgroundColor: '#f0f6ff',
    borderLeftWidth: 4,
    borderLeftColor: '#0b6efd',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0b6efd',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default NotificationSettings;

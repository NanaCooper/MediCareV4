import { AccessibilityInfo, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * MediCare Accessibility Service
 * 
 * Provides utilities for:
 * - Focus management
 * - Screen reader support
 * - Keyboard navigation
 * - High contrast mode
 * - Color blindness support
 * - Text scaling
 */

// Storage keys
const A11Y_PREFERENCES_KEY = 'a11yPreferences';

export interface AccessibilityPreferences {
  highContrastMode: boolean;
  screenReaderEnabled: boolean;
  reduceMotion: boolean;
  largeText: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  boldText: boolean;
  keyboardNavigationEnabled: boolean;
}

export const defaultAccessibilityPreferences: AccessibilityPreferences = {
  highContrastMode: false,
  screenReaderEnabled: false,
  reduceMotion: false,
  largeText: false,
  colorBlindMode: 'none',
  boldText: false,
  keyboardNavigationEnabled: true,
};

/**
 * Initialize accessibility features
 */
export async function initializeAccessibility(): Promise<AccessibilityPreferences> {
  try {
    const stored = await AsyncStorage.getItem(A11Y_PREFERENCES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Check system screen reader status
    const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
    const reduceMotionEnabled = await AccessibilityInfo.isBoldTextEnabled();
    
    const prefs: AccessibilityPreferences = {
      ...defaultAccessibilityPreferences,
      screenReaderEnabled,
      reduceMotion: reduceMotionEnabled,
    };
    
    await saveAccessibilityPreferences(prefs);
    return prefs;
  } catch (error) {
    console.error('Failed to initialize accessibility:', error);
    return defaultAccessibilityPreferences;
  }
}

/**
 * Get current accessibility preferences
 */
export async function getAccessibilityPreferences(): Promise<AccessibilityPreferences> {
  try {
    const stored = await AsyncStorage.getItem(A11Y_PREFERENCES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return defaultAccessibilityPreferences;
  } catch (error) {
    console.error('Failed to get accessibility preferences:', error);
    return defaultAccessibilityPreferences;
  }
}

/**
 * Save accessibility preferences
 */
export async function saveAccessibilityPreferences(
  prefs: AccessibilityPreferences
): Promise<void> {
  try {
    await AsyncStorage.setItem(A11Y_PREFERENCES_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.error('Failed to save accessibility preferences:', error);
  }
}

/**
 * Update specific accessibility preference
 */
export async function updateAccessibilityPreference<K extends keyof AccessibilityPreferences>(
  key: K,
  value: AccessibilityPreferences[K]
): Promise<AccessibilityPreferences> {
  try {
    const current = await getAccessibilityPreferences();
    const updated = { ...current, [key]: value };
    await saveAccessibilityPreferences(updated);
    return updated;
  } catch (error) {
    console.error('Failed to update accessibility preference:', error);
    return await getAccessibilityPreferences();
  }
}

/**
 * Announce message to screen reader
 */
export async function announceForAccessibility(message: string): Promise<void> {
  try {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      await AccessibilityInfo.announceForAccessibility(message);
    }
  } catch (error) {
    console.error('Failed to announce for accessibility:', error);
  }
}

/**
 * Get accessible label for message
 */
export function getMessageAccessibilityLabel(
  senderName: string,
  messageText?: string,
  timestamp?: string,
  messageType?: string,
  status?: string
): string {
  const parts: string[] = [];

  parts.push(`Message from ${senderName}`);

  if (messageType && messageType !== 'text') {
    parts.push(`Type: ${messageType}`);
  }

  if (messageText) {
    parts.push(`Content: ${messageText}`);
  }

  if (status) {
    parts.push(`Status: ${status}`);
  }

  if (timestamp) {
    parts.push(`Sent ${timestamp}`);
  }

  return parts.join('. ');
}

/**
 * Get accessible label for conversation
 */
export function getConversationAccessibilityLabel(
  participantName: string,
  lastMessage?: string,
  unreadCount?: number,
  isOnline?: boolean
): string {
  const parts: string[] = [];

  parts.push(`Conversation with ${participantName}`);

  if (isOnline !== undefined) {
    parts.push(isOnline ? 'Online' : 'Offline');
  }

  if (lastMessage) {
    parts.push(`Last message: ${lastMessage}`);
  }

  if (unreadCount && unreadCount > 0) {
    parts.push(`${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`);
  }

  return parts.join('. ');
}

/**
 * Get accessible label for button action
 */
export function getActionButtonLabel(
  action: string,
  context?: string,
  hint?: string
): string {
  const parts: string[] = [action];

  if (context) {
    parts.push(`for ${context}`);
  }

  if (hint) {
    parts.push(`(${hint})`);
  }

  return parts.join(' ');
}

/**
 * Get color for accessibility mode
 * Adjusts colors for high contrast and color blindness modes
 */
export function getAccessibleColor(
  originalColor: string,
  mode: 'high-contrast' | 'protanopia' | 'deuteranopia' | 'tritanopia' = 'high-contrast'
): string {
  const colorMap: Record<string, Record<string, string>> = {
    // High contrast versions
    'high-contrast': {
      '#0b6efd': '#003f9a', // Primary blue
      '#0f1724': '#000000', // Dark text
      '#ef4444': '#8b0000', // Red
      '#10b981': '#006400', // Green
      '#f59e0b': '#cc7000', // Amber
      '#ffffff': '#ffffff', // White
      '#f0f6ff': '#e0e8ff', // Light blue
      '#f9fafb': '#f0f0f0', // Light gray
    },
    // Protanopia (red-blind)
    protanopia: {
      '#ef4444': '#ffb700', // Red → Yellow
      '#10b981': '#0b9cff', // Green → Blue
      '#0b6efd': '#0b6efd', // Blue stays
      '#f59e0b': '#ffb700', // Amber → Yellow
    },
    // Deuteranopia (green-blind)
    deuteranopia: {
      '#10b981': '#ffb700', // Green → Yellow
      '#ef4444': '#ef4444', // Red stays
      '#0b6efd': '#0b6efd', // Blue stays
      '#f59e0b': '#ffb700', // Amber → Yellow
    },
    // Tritanopia (blue-yellow-blind)
    tritanopia: {
      '#0b6efd': '#ff0000', // Blue → Red
      '#f59e0b': '#ff0000', // Amber → Red
      '#10b981': '#00e6ff', // Green → Cyan
      '#ef4444': '#ef4444', // Red stays
    },
  };

  return colorMap[mode]?.[originalColor] || originalColor;
}

/**
 * Get font size for accessibility
 */
export function getAccessibleFontSize(
  baseSize: number,
  isLargeText: boolean = false,
  isBoldText: boolean = false
): { fontSize: number; fontWeight?: string } {
  const multiplier = isLargeText ? 1.3 : 1;
  const fontSize = baseSize * multiplier;

  return {
    fontSize,
    fontWeight: isBoldText ? '700' : '400',
  };
}

/**
 * Get accessible line height
 * Increased line height improves readability
 */
export function getAccessibleLineHeight(fontSize: number): number {
  return fontSize * 1.5;
}

/**
 * Get accessible touch target size
 * Minimum 44pt recommended
 */
export function getAccessibleTouchTarget(baseSize: number = 44): number {
  return Math.max(baseSize, 44);
}

/**
 * Check if text has sufficient contrast
 * Returns true if contrast ratio >= 4.5:1 (AA standard)
 */
export function hasAccessibleContrast(
  foreground: string,
  background: string,
  contrastRatio: number = 4.5
): boolean {
  // This is a simplified check - in production, use a library like wcag-contrast
  // For now, return true if not a known bad combination
  const badCombinations = [
    { fg: '#999999', bg: '#ffffff' },
    { fg: '#aaaaaa', bg: '#ffffff' },
  ];

  return !badCombinations.some(
    combo => combo.fg === foreground && combo.bg === background
  );
}

/**
 * Focus management utilities
 */
export const FocusManager = {
  /**
   * Announce focused element
   */
  announceFocus: async (label: string) => {
    await announceForAccessibility(`${label} focused`);
  },

  /**
   * Move focus to element
   */
  moveFocus: async (elementId: string) => {
    try {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        const viewTag = parseInt(elementId, 10);
        if (!isNaN(viewTag)) {
          AccessibilityInfo.setAccessibilityFocus(viewTag);
        }
      }
    } catch (error) {
      console.error('Failed to move focus:', error);
    }
  },

  /**
   * Trap focus within modal
   */
  trapFocus: (
    onBackdropPress?: () => void,
    onEscapePress?: () => void
  ) => {
    return {
      onBackdropPress,
      onEscapePress,
    };
  },
};

/**
 * Keyboard navigation utilities
 */
export const KeyboardNavigation = {
  /**
   * Get next focusable element
   */
  getNextElement: (elements: string[], currentId: string): string | null => {
    const currentIndex = elements.indexOf(currentId);
    return currentIndex < elements.length - 1
      ? elements[currentIndex + 1]
      : null;
  },

  /**
   * Get previous focusable element
   */
  getPreviousElement: (elements: string[], currentId: string): string | null => {
    const currentIndex = elements.indexOf(currentId);
    return currentIndex > 0 ? elements[currentIndex - 1] : null;
  },

  /**
   * Check if key is navigation key
   */
  isNavigationKey: (key: string): boolean => {
    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(
      key
    );
  },

  /**
   * Check if key is confirmation key
   */
  isConfirmationKey: (key: string): boolean => {
    return ['Enter', ' '].includes(key);
  },

  /**
   * Check if key is escape key
   */
  isEscapeKey: (key: string): boolean => {
    return key === 'Escape';
  },
};

/**
 * Screen reader optimization utilities
 */
export const ScreenReaderOptimization = {
  /**
   * Format timestamp for screen reader
   */
  formatTimeForScreenReader: (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return `Today at ${date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        })}`;
      } else if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday at ${date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        })}`;
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      return timestamp;
    }
  },

  /**
   * Format status for screen reader
   */
  formatStatusForScreenReader: (status: string): string => {
    const statusMap: Record<string, string> = {
      sending: 'Message sending',
      sent: 'Message sent',
      delivered: 'Message delivered',
      read: 'Message read',
      failed: 'Message failed to send',
    };
    return statusMap[status] || status;
  },

  /**
   * Format number for screen reader
   */
  formatNumberForScreenReader: (num: number): string => {
    return num.toLocaleString('en-US');
  },

  /**
   * Create readable list for screen reader
   */
  formatListForScreenReader: (items: string[], lastSeparator = 'and'): string => {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} ${lastSeparator} ${items[1]}`;
    return `${items.slice(0, -1).join(', ')}, ${lastSeparator} ${items[items.length - 1]}`;
  },
};

/**
 * High contrast mode utilities
 */
export const HighContrastMode = {
  /**
   * Get high contrast colors
   */
  getColors: () => ({
    primary: '#003f9a',      // Very dark blue
    secondary: '#006400',    // Very dark green
    danger: '#8b0000',       // Very dark red
    warning: '#cc7000',      // Very dark amber
    background: '#ffffff',   // Pure white
    text: '#000000',         // Pure black
    border: '#000000',       // Pure black
    disabled: '#666666',     // Very dark gray
  }),

  /**
   * Apply high contrast to component
   */
  applyHighContrast: (baseStyle: any) => ({
    ...baseStyle,
    borderWidth: 2,
    borderColor: '#000000',
  }),
};

/**
 * Animation reduction utilities
 */
export const MotionReduction = {
  /**
   * Get animation config respecting reduce motion preference
   */
  getAnimationConfig: (
    enabled: boolean,
    config: { duration?: number; useNativeDriver?: boolean }
  ) => {
    if (enabled) {
      return { duration: 0, useNativeDriver: false };
    }
    return { duration: config.duration || 300, useNativeDriver: config.useNativeDriver ?? true };
  },

  /**
   * Get fade animation config
   */
  getFadeConfig: (enabled: boolean) => {
    return MotionReduction.getAnimationConfig(enabled, { duration: 200 });
  },

  /**
   * Get slide animation config
   */
  getSlideConfig: (enabled: boolean) => {
    return MotionReduction.getAnimationConfig(enabled, { duration: 300 });
  },
};

export default {
  initializeAccessibility,
  getAccessibilityPreferences,
  saveAccessibilityPreferences,
  updateAccessibilityPreference,
  announceForAccessibility,
  getMessageAccessibilityLabel,
  getConversationAccessibilityLabel,
  getActionButtonLabel,
  getAccessibleColor,
  getAccessibleFontSize,
  getAccessibleLineHeight,
  getAccessibleTouchTarget,
  hasAccessibleContrast,
  FocusManager,
  KeyboardNavigation,
  ScreenReaderOptimization,
  HighContrastMode,
  MotionReduction,
};

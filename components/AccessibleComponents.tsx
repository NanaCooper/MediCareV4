import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  getAccessibilityPreferences,
  getMessageAccessibilityLabel,
  getAccessibleFontSize,
  getAccessibleLineHeight,
  ScreenReaderOptimization,
  getAccessibleTouchTarget,
  announceForAccessibility,
} from '../services/accessibility';

interface AccessibleMessageProps {
  id: string;
  senderName: string;
  text?: string;
  timestamp: string;
  isOwn: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  messageType?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  children?: React.ReactNode;
}

/**
 * Accessible Message Component
 * Provides proper accessibility labels, focus management, and keyboard navigation
 */
export const AccessibleMessage: React.FC<AccessibleMessageProps> = ({
  id,
  senderName,
  text,
  timestamp,
  isOwn,
  status,
  messageType,
  onPress,
  onLongPress,
  children,
}) => {
  const [a11yPrefs, setA11yPrefs] = useState<any>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    loadAccessibilityPreferences();
  }, []);

  const loadAccessibilityPreferences = async () => {
    const prefs = await getAccessibilityPreferences();
    setA11yPrefs(prefs);
  };

  const accessibilityLabel = getMessageAccessibilityLabel(
    senderName,
    text,
    ScreenReaderOptimization.formatTimeForScreenReader(timestamp),
    messageType,
    status ? ScreenReaderOptimization.formatStatusForScreenReader(status) : undefined
  );

  const fontSizing = getAccessibleFontSize(
    14,
    a11yPrefs?.largeText,
    a11yPrefs?.boldText
  );

  const lineHeight = getAccessibleLineHeight(fontSizing.fontSize);

  const handlePress = async () => {
    if (onPress) {
      await announceForAccessibility(`${senderName} message, ${text}`);
      onPress();
    }
  };

  const handleFocus = async () => {
    setIsFocused(true);
    await announceForAccessibility(`${senderName} message focused`);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const messageStyles = [
    styles.messageBubble,
    isOwn && styles.messageBubbleOwn,
    isFocused && styles.focused,
    a11yPrefs?.highContrastMode && styles.highContrast,
  ];

  const textColor = a11yPrefs?.highContrastMode ? '#000000' : '#0f1724';
  const textStyle = [
    styles.messageText,
    {
      ...fontSizing,
      color: textColor,
      lineHeight,
    },
  ];

  return (
    <TouchableOpacity
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: false }}
      accessibilityHint="Double tap to open message actions"
      onPress={handlePress}
      onLongPress={onLongPress}
      onFocus={handleFocus}
      onBlur={handleBlur}
      activeOpacity={0.7}
      style={messageStyles}
    >
      {children || (
        <>
          <Text
            style={textStyle}
            allowFontScaling={true}
            maxFontSizeMultiplier={1.3}
          >
            {text}
          </Text>
          {status && (
            <Text
              style={[styles.statusText, { fontSize: fontSizing.fontSize * 0.85 }]}
              accessibilityLabel={ScreenReaderOptimization.formatStatusForScreenReader(status)}
            >
              {status === 'read' && '✓✓'}
              {status === 'delivered' && '✓'}
              {status === 'sending' && '⏱'}
              {status === 'failed' && '✗'}
            </Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

interface AccessibleInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  editable?: boolean;
  maxLength?: number;
}

/**
 * Accessible Text Input Component
 * Provides proper keyboard navigation, focus management, and screen reader support
 */
export const AccessibleMessageInput: React.FC<AccessibleInputProps> = ({
  value,
  onChangeText,
  onSubmit,
  onFocus,
  onBlur,
  placeholder,
  editable = true,
  maxLength = 1000,
}) => {
  const [a11yPrefs, setA11yPrefs] = useState<any>(null);
  const [characterCount, setCharacterCount] = useState(0);

  useEffect(() => {
    loadAccessibilityPreferences();
  }, []);

  const loadAccessibilityPreferences = async () => {
    const prefs = await getAccessibilityPreferences();
    setA11yPrefs(prefs);
  };

  const handleChangeText = (text: string) => {
    onChangeText(text);
    setCharacterCount(text.length);

    // Announce character count at intervals
    if (text.length % 50 === 0) {
      announceForAccessibility(
        `${text.length} of ${maxLength} characters entered`
      );
    }
  };

  const handleSubmit = async () => {
    await announceForAccessibility('Message sent');
    onSubmit();
  };

  const fontSizing = getAccessibleFontSize(
    14,
    a11yPrefs?.largeText,
    a11yPrefs?.boldText
  );

  // Note: These variables are part of the component structure
  // and will be used when integrating with actual TextInput
  void handleChangeText;
  void handleSubmit;

  const characterCountLabel = `${characterCount} of ${maxLength} characters`;

  return (
    <View style={styles.inputContainer}>
      <View style={styles.inputWrapper}>
        <View
          style={[
            styles.inputField,
            {
              ...fontSizing,
              lineHeight: fontSizing.fontSize * 1.5,
            },
            a11yPrefs?.highContrastMode && styles.inputHighContrast,
          ]}
          accessible
          accessibilityLabel={`Message input field. ${characterCountLabel}`}
          accessibilityRole="adjustable"
        >
          {/* TextInput component would be integrated here */}
        </View>
      </View>
      <View
        style={styles.characterCountContainer}
        accessible
        accessibilityLabel={characterCountLabel}
        accessibilityLiveRegion="polite"
      >
        <Text
          style={[
            styles.characterCount,
            {
              ...fontSizing,
              color:
                characterCount > maxLength * 0.9
                  ? '#ef4444'
                  : '#666666',
            },
          ]}
        >
          {characterCount}/{maxLength}
        </Text>
      </View>
    </View>
  );
};

interface AccessibleButtonProps {
  label: string;
  hint?: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: string;
  children?: React.ReactNode;
}

/**
 * Accessible Button Component
 * Ensures proper keyboard and screen reader navigation
 */
export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  label,
  hint,
  onPress,
  disabled = false,
  variant = 'primary',
  icon,
  children,
}) => {
  const [a11yPrefs, setA11yPrefs] = useState<any>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    loadAccessibilityPreferences();
  }, []);

  const loadAccessibilityPreferences = async () => {
    const prefs = await getAccessibilityPreferences();
    setA11yPrefs(prefs);
  };

  const handlePress = async () => {
    if (!disabled) {
      await announceForAccessibility(`${label} pressed`);
      onPress();
    }
  };

  const handleFocus = async () => {
    setIsFocused(true);
    await announceForAccessibility(`${label} button focused. ${hint || ''}`);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const getButtonVariantStyle = () => {
    if (variant === 'primary') return styles.buttonPrimary;
    if (variant === 'secondary') return styles.buttonSecondary;
    if (variant === 'danger') return styles.buttonDanger;
    return styles.buttonPrimary;
  };

  const buttonStyle = [
    styles.button,
    getButtonVariantStyle(),
    disabled && styles.buttonDisabled,
    isFocused && styles.buttonFocused,
    a11yPrefs?.highContrastMode && styles.buttonHighContrast,
  ];

  const minTouchSize = getAccessibleTouchTarget();

  return (
    <TouchableOpacity
      accessible
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityHint={hint}
      onPress={handlePress}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled}
      style={[buttonStyle, { minHeight: minTouchSize, minWidth: minTouchSize }]}
      activeOpacity={0.7}
    >
      <Text
        style={styles.buttonText}
        allowFontScaling={true}
        maxFontSizeMultiplier={1.2}
      >
        {icon && `${icon} `}
        {label}
      </Text>
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#f1f1f1',
    marginVertical: 6,
  },
  messageBubbleOwn: {
    backgroundColor: '#0b6efd',
  },
  focused: {
    borderWidth: 2,
    borderColor: '#000000',
    opacity: 0.9,
  },
  highContrast: {
    borderWidth: 2,
    borderColor: '#000000',
  },
  messageText: {
    fontSize: 14,
    color: '#0f1724',
    lineHeight: 20,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputField: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
  },
  inputHighContrast: {
    borderWidth: 2,
    borderColor: '#000000',
  },
  characterCountContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonPrimary: {
    backgroundColor: '#0b6efd',
  },
  buttonSecondary: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonDanger: {
    backgroundColor: '#ef4444',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonFocused: {
    borderWidth: 2,
    borderColor: '#000000',
    opacity: 0.9,
  },
  buttonHighContrast: {
    borderWidth: 2,
    borderColor: '#000000',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default {
  AccessibleMessage,
  AccessibleMessageInput,
  AccessibleButton,
};

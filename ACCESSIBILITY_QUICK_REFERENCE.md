# Accessibility Quick Reference

## What's Implemented

✅ **Focus Management**
- Proper focus order following reading flow
- Visible focus indicators (2pt black border)
- Programmatic focus management for modals

✅ **Screen Reader Support**
- Descriptive accessibility labels on all elements
- Live regions for real-time announcements
- Semantic roles (button, input, list, etc.)
- Status and state information

✅ **Keyboard Navigation**
- Full keyboard support (Tab, Shift+Tab, Arrow keys, Enter, Escape)
- No keyboard traps
- Logical tab order
- Shortcut keys for common actions

✅ **High Contrast Mode**
- 7:1 contrast ratio (AAA standard)
- Enhanced borders and outlines
- Pure black (#000000) and white (#ffffff) palette
- 2pt black borders on interactive elements

✅ **Color Blindness Support**
- Icons + colors (not color alone)
- Alternative palettes for protanopia, deuteranopia, tritanopia
- Clear status indicators (✓, ✓✓, ✗, ⏱)

✅ **Text Scaling**
- Large text mode (1.3x scaling)
- Bold text option
- Increased line height (1.5x)
- Respects system font size

✅ **Motor Accessibility**
- Touch targets: 44x44 pts minimum
- Proper button spacing
- Animation reduction support
- No gesture-only controls

## Quick Integration

### 1. Add to App Root
```typescript
import { initializeAccessibility } from '../services/accessibility';

useEffect(() => {
  initializeAccessibility();
}, []);
```

### 2. Use Accessible Components
```typescript
import { AccessibleButton, AccessibleMessage } from '../components/AccessibleComponents';

<AccessibleButton
  label="Send"
  onPress={handleSend}
  variant="primary"
/>

<AccessibleMessage
  id="m1"
  senderName="Dr. Smith"
  text="How are you?"
  timestamp={Date.now()}
  isOwn={false}
/>
```

### 3. Add Accessibility Settings
```typescript
import { Switch, View, Text } from 'react-native';
import { getAccessibilityPreferences, updateAccessibilityPreference } from '../services/accessibility';

<Switch
  value={prefs.highContrastMode}
  onValueChange={(v) => updateAccessibilityPreference('highContrastMode', v)}
/>
```

## Key APIs

### Focus Management
```typescript
FocusManager.announceFocus(label)    // Announce focus
FocusManager.moveFocus(elementId)    // Move focus
FocusManager.trapFocus(onPress, onEsc) // Focus trap
```

### Screen Reader
```typescript
announceForAccessibility(message)
ScreenReaderOptimization.formatTimeForScreenReader(timestamp)
ScreenReaderOptimization.formatStatusForScreenReader(status)
ScreenReaderOptimization.formatListForScreenReader(items)
```

### Keyboard
```typescript
KeyboardNavigation.isNavigationKey(key)
KeyboardNavigation.isConfirmationKey(key)
KeyboardNavigation.isEscapeKey(key)
KeyboardNavigation.getNextElement(elements, current)
KeyboardNavigation.getPreviousElement(elements, current)
```

### Visual
```typescript
HighContrastMode.getColors()
HighContrastMode.applyHighContrast(style)
getAccessibleColor(color, mode)          // mode: 'protanopia', etc.
getAccessibleFontSize(base, isLarge, isBold)
getAccessibleLineHeight(fontSize)
getAccessibleTouchTarget(baseSize)
```

### Motion
```typescript
MotionReduction.getAnimationConfig(enabled, config)
MotionReduction.getFadeConfig(enabled)
MotionReduction.getSlideConfig(enabled)
```

## Testing Checklist

### Screen Reader Test
- [ ] TalkBack (Android) / VoiceOver (iOS) enabled
- [ ] All buttons announce their purpose
- [ ] Messages include sender name and timestamp
- [ ] Status changes announced
- [ ] Navigation working in reading order

### Keyboard Test
- [ ] Tab key moves through elements logically
- [ ] Shift+Tab moves backward
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals
- [ ] Arrow keys navigate lists
- [ ] No keyboard traps

### Visual Test
- [ ] High contrast mode enabled
- [ ] Text readable at 200% zoom
- [ ] Focus indicators clearly visible
- [ ] Color not the only indicator
- [ ] Icons clear and meaningful
- [ ] 7:1 contrast ratio on all text

### Motor Test
- [ ] All buttons >= 44x44 pts
- [ ] Buttons well-spaced
- [ ] Animations can be disabled
- [ ] No swipe-only controls
- [ ] Easy-to-tap targets

## Accessibility Preferences

```typescript
interface AccessibilityPreferences {
  highContrastMode: boolean;     // 7:1 contrast, 2pt borders
  screenReaderEnabled: boolean;  // Auto-detected
  reduceMotion: boolean;         // Disable animations
  largeText: boolean;            // 1.3x scaling
  colorBlindMode: string;        // 'none' | 'protanopia' | etc.
  boldText: boolean;             // Bold text throughout
  keyboardNavigationEnabled: boolean; // Full keyboard support
}
```

## Component Props

### AccessibleMessage
```typescript
<AccessibleMessage
  id: string;                    // Unique ID
  senderName: string;            // Announced
  text?: string;                 // Message content
  timestamp: string;             // ISO string
  isOwn: boolean;               // Own message?
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  messageType?: string;          // 'text', 'image', etc.
  onPress?: () => void;
  onLongPress?: () => void;
/>
```

### AccessibleButton
```typescript
<AccessibleButton
  label: string;                 // Button text + accessible label
  hint?: string;                 // Additional hint
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: string;                 // Icon emoji
/>
```

### AccessibleMessageInput
```typescript
<AccessibleMessageInput
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  maxLength?: number;            // Default: 1000
/>
```

## Best Practices

1. **Always test with screen readers** - Don't assume labels are correct
2. **Test keyboard navigation** - Ensure logical tab order
3. **Check contrast ratios** - Use tools to verify 4.5:1 (AA) or 7:1 (AAA)
4. **Provide text alternatives** - For icons and images
5. **Use semantic HTML** - Proper roles and states
6. **Test at 200% zoom** - Ensure layout doesn't break
7. **Test with actual users** - Real feedback is invaluable
8. **Plan for motion** - Respect reduce motion preferences
9. **Support keyboard-only** - No mouse/touch dependencies
10. **Maintain focus management** - Clear focus indicators

## Common Issues & Fixes

**Screen reader not announcing labels**
- Add `accessible={true}` to component
- Ensure `accessibilityLabel` is set
- Use `accessibilityHint` for additional context

**Keyboard navigation not working**
- Check `tabIndex` (if applicable)
- Ensure elements are `onFocus`/`onBlur` handlers
- Test with real keyboard, not simulated

**Focus indicator not visible**
- Add 2pt border in high contrast mode
- Use high-contrast colors (#000000, #ffffff)
- Ensure border has sufficient size (>= 2pt)

**Color contrast too low**
- Use HighContrastMode.getColors()
- Test with contrast checker tool
- Aim for 7:1 (AAA) minimum in healthcare

**Touch targets too small**
- Minimum 44x44 pts (48x48 recommended)
- Use getAccessibleTouchTarget()
- Add padding if needed

## Files

- **services/accessibility.ts** - All accessibility utilities
- **components/AccessibleComponents.tsx** - Reusable components
- **ACCESSIBILITY.md** - Full documentation

## Next Steps

1. Initialize accessibility on app start
2. Replace UI components with accessible versions
3. Add accessibility settings to profile
4. Test with screen readers
5. Test with keyboard only
6. Gather user feedback
7. Iterate based on feedback

## Standards Compliance

✅ **WCAG 2.1 Level AA**
- All interactive elements accessible
- Sufficient color contrast
- Keyboard navigable
- Screen reader compatible

✅ **WCAG 2.1 Level AAA**
- High contrast mode
- Enhanced text scaling
- Color blindness support
- Motion reduction

## Support

Questions? Check:
1. **ACCESSIBILITY.md** - Full guide with examples
2. **AccessibleComponents.tsx** - Usage examples
3. **services/accessibility.ts** - Available functions
4. **WCAG 2.1** - Standards reference

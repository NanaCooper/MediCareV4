# MediCare Accessibility Guide

## Overview

MediCare includes comprehensive accessibility features to ensure the messaging system is usable by everyone, including users with:
- Visual impairments (screen reader users)
- Motor impairments (keyboard navigation)
- Cognitive disabilities
- Hearing impairments
- Color blindness

## Accessibility Features Implemented

### 1. Focus Management

✅ **Proper Focus Order**
- Focus follows logical reading order
- Focus indicators are clearly visible (2pt black border in high contrast mode)
- Focus is managed programmatically when modals open/close

```typescript
import { FocusManager } from '../services/accessibility';

// Announce focus
await FocusManager.announceFocus('Message button');

// Move focus programmatically
await FocusManager.moveFocus(elementId);

// Trap focus in modal
const focusTrap = FocusManager.trapFocus(
  onBackdropPress,
  onEscapePress
);
```

✅ **Focus Indicators**
- 2px black border on focused elements
- High contrast focus state
- Clearly distinguishable from regular state
- Minimum size 44x44 pts for touch targets

### 2. Screen Reader Support

✅ **Accessible Labels**
- All interactive elements have descriptive labels
- Labels include context (e.g., "Message from Dr. Smith")
- Action buttons have clear hints

```typescript
import { ScreenReaderOptimization } from '../services/accessibility';

// Format timestamp for screen reader
const readableTime = ScreenReaderOptimization.formatTimeForScreenReader(timestamp);
// Output: "Today at 2:30 PM"

// Format status
const readableStatus = ScreenReaderOptimization.formatStatusForScreenReader('read');
// Output: "Message read"

// Format list
const list = ScreenReaderOptimization.formatListForScreenReader(
  ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams']
);
// Output: "Dr. Smith, Dr. Johnson, and Dr. Williams"
```

✅ **Live Regions**
- Notifications announced as they arrive
- Character count updated as user types
- Status changes announced immediately
- Uses `accessibilityLiveRegion="polite"` for important updates

```typescript
<View
  accessible
  accessibilityLabel="Character count"
  accessibilityLiveRegion="polite"
>
  <Text>{characterCount}/{maxLength} characters</Text>
</View>
```

✅ **Semantic Elements**
- Proper accessibility roles (button, input, etc.)
- State information communicated (disabled, checked, etc.)
- Hints provided for complex interactions

### 3. Keyboard Navigation

✅ **Full Keyboard Support**
- All functions accessible via keyboard
- No keyboard traps
- Tab order follows visual layout
- Arrow keys for list navigation

```typescript
import { KeyboardNavigation } from '../services/accessibility';

// Check if key is navigation key
if (KeyboardNavigation.isNavigationKey(key)) {
  // Handle up/down/left/right/tab
}

// Check if key is confirmation key
if (KeyboardNavigation.isConfirmationKey(key)) {
  // Handle Enter or Space
}

// Get next/previous focusable elements
const next = KeyboardNavigation.getNextElement(elements, currentId);
const prev = KeyboardNavigation.getPreviousElement(elements, currentId);
```

✅ **Shortcut Keys**
- Tab - Move to next element
- Shift+Tab - Move to previous element
- Enter/Space - Activate button
- Arrow Up/Down - Navigate list
- Escape - Close modal/cancel

### 4. High Contrast Mode

✅ **Enhanced Contrast**
- 7:1 contrast ratio for text (AAA standard)
- Dark mode support
- Special high contrast color palette

```typescript
import { HighContrastMode } from '../services/accessibility';

// Get high contrast colors
const colors = HighContrastMode.getColors();
// {
//   primary: '#003f9a',      // Very dark blue
//   secondary: '#006400',    // Very dark green
//   danger: '#8b0000',       // Very dark red
//   background: '#ffffff',   // Pure white
//   text: '#000000',         // Pure black
// }

// Apply high contrast styling
const style = HighContrastMode.applyHighContrast(baseStyle);
```

✅ **Border Emphasis**
- 2pt black borders on interactive elements in high contrast mode
- Enhanced visual separation
- Clear element boundaries

### 5. Color Blindness Support

✅ **Color-Independent Design**
- Color not the only information source
- Icons and text labels used alongside colors
- Alternative color palettes for different types of color blindness

```typescript
import { getAccessibleColor } from '../services/accessibility';

// Get color for protanopia (red-blind)
const color = getAccessibleColor('#ef4444', 'protanopia');
// Returns: '#ffb700' (yellow instead)

// Supported modes:
// - 'high-contrast'
// - 'protanopia' (red-blind)
// - 'deuteranopia' (green-blind)
// - 'tritanopia' (blue-yellow-blind)
```

✅ **Icon Indicators**
- Status shown with both color and icon
- Sent: ✓ (check mark)
- Delivered: ✓ (double check)
- Read: ✓✓ (double check)
- Sending: ⏱ (timer)
- Failed: ✗ (X mark)

### 6. Text Scaling

✅ **Font Size Adjustment**
- Supports system font size settings
- Up to 1.3x scaling without breaking layout
- Large text mode available

```typescript
import { getAccessibleFontSize, getAccessibleLineHeight } from '../services/accessibility';

// Get scaled font size
const sizing = getAccessibleFontSize(
  14,           // base size
  true,         // isLargeText
  true          // isBoldText
);
// Returns: { fontSize: 18.2, fontWeight: '700' }

// Get accessible line height
const lineHeight = getAccessibleLineHeight(16);
// Returns: 24 (1.5x multiplier)
```

✅ **Large Text Mode**
- 1.3x text scaling
- Increased line height (1.5x)
- Bold text option
- Preserves layout

### 7. Motor Accessibility

✅ **Touch Target Size**
- Minimum 44x44 pts for all interactive elements
- Proper spacing between buttons
- Larger hit areas for common actions

```typescript
import { getAccessibleTouchTarget } from '../services/accessibility';

const minSize = getAccessibleTouchTarget(44);
// Returns: 44 (minimum recommended)
```

✅ **Animation Reduction**
- Respects `prefers-reduced-motion` system setting
- Option to disable animations
- Instant feedback for important actions

```typescript
import { MotionReduction } from '../services/accessibility';

// Get animation config
const config = MotionReduction.getAnimationConfig(
  reduceMotionEnabled,
  { duration: 300 }
);
// If reduceMotionEnabled: { duration: 0 }
// Otherwise: { duration: 300, useNativeDriver: true }
```

## Usage Examples

### Using Accessible Components

```typescript
import {
  AccessibleMessage,
  AccessibleButton,
  AccessibleMessageInput,
} from '../components/AccessibleComponents';

// Accessible message
<AccessibleMessage
  id="msg-1"
  senderName="Dr. Smith"
  text="How are you feeling today?"
  timestamp={new Date().toISOString()}
  isOwn={false}
  status="read"
  messageType="text"
  onPress={() => console.log('Message pressed')}
/>

// Accessible button
<AccessibleButton
  label="Send Message"
  hint="Double tap to send message"
  onPress={handleSend}
  variant="primary"
  icon="📤"
/>

// Accessible input
<AccessibleMessageInput
  value={text}
  onChangeText={setText}
  onSubmit={handleSend}
  placeholder="Type your message"
  maxLength={1000}
/>
```

### Configuring Accessibility Preferences

```typescript
import {
  initializeAccessibility,
  getAccessibilityPreferences,
  updateAccessibilityPreference,
} from '../services/accessibility';

// Initialize on app start
useEffect(() => {
  initializeAccessibility();
}, []);

// Get preferences
const prefs = await getAccessibilityPreferences();
console.log(prefs.highContrastMode);

// Update specific preference
await updateAccessibilityPreference('highContrastMode', true);
```

### Adding to Settings Screen

```typescript
import { Switch, View, Text } from 'react-native';
import {
  getAccessibilityPreferences,
  updateAccessibilityPreference,
} from '../services/accessibility';

export function AccessibilitySettings() {
  const [prefs, setPrefs] = useState(null);

  useEffect(() => {
    getAccessibilityPreferences().then(setPrefs);
  }, []);

  const handleToggle = async (key, value) => {
    const updated = await updateAccessibilityPreference(key, value);
    setPrefs(updated);
  };

  return (
    <View>
      {/* High Contrast Mode */}
      <View>
        <Text>High Contrast Mode</Text>
        <Switch
          value={prefs?.highContrastMode}
          onValueChange={(v) => handleToggle('highContrastMode', v)}
        />
      </View>

      {/* Large Text */}
      <View>
        <Text>Large Text</Text>
        <Switch
          value={prefs?.largeText}
          onValueChange={(v) => handleToggle('largeText', v)}
        />
      </View>

      {/* Bold Text */}
      <View>
        <Text>Bold Text</Text>
        <Switch
          value={prefs?.boldText}
          onValueChange={(v) => handleToggle('boldText', v)}
        />
      </View>

      {/* Reduce Motion */}
      <View>
        <Text>Reduce Motion</Text>
        <Switch
          value={prefs?.reduceMotion}
          onValueChange={(v) => handleToggle('reduceMotion', v)}
        />
      </View>

      {/* Color Blind Mode */}
      <View>
        <Text>Color Blind Mode</Text>
        <Picker
          selectedValue={prefs?.colorBlindMode}
          onValueChange={(v) => handleToggle('colorBlindMode', v)}
        >
          <Picker.Item label="None" value="none" />
          <Picker.Item label="Protanopia (Red-Blind)" value="protanopia" />
          <Picker.Item label="Deuteranopia (Green-Blind)" value="deuteranopia" />
          <Picker.Item label="Tritanopia (Blue-Yellow-Blind)" value="tritanopia" />
        </Picker>
      </View>
    </View>
  );
}
```

## Compliance Standards

✅ **WCAG 2.1 Level AA Compliance**
- All interactive elements have accessible names
- Color contrast >= 4.5:1 for normal text
- Color contrast >= 3:1 for large text
- Focus indicators visible
- No keyboard traps

✅ **WCAG 2.1 Level AAA Features**
- High contrast mode (7:1 contrast ratio)
- Enhanced focus indicators
- Color blindness support
- Large text mode (1.3x)

## Testing Accessibility

### Android
1. Enable TalkBack (Settings > Accessibility > TalkBack)
2. Enable high contrast (Settings > Accessibility > Display)
3. Enable large text (Settings > Display > Font size)

### iOS
1. Enable VoiceOver (Settings > Accessibility > VoiceOver)
2. Enable high contrast (Settings > Accessibility > Display & Text Size > Increase Contrast)
3. Enable larger text (Settings > Accessibility > Display & Text Size > Larger Accessibility Sizes)

### Testing Checklist

**Screen Reader**
- [ ] All buttons have labels
- [ ] Status messages announced
- [ ] Timestamps readable
- [ ] List items individually selectable
- [ ] Modal focus trapped

**Keyboard Navigation**
- [ ] Tab moves to next element
- [ ] Shift+Tab moves to previous
- [ ] Enter activates buttons
- [ ] Arrow keys navigate lists
- [ ] Escape closes modals

**Visual**
- [ ] High contrast mode enabled
- [ ] All text readable at 200% zoom
- [ ] Focus indicators visible
- [ ] Color not only indicator
- [ ] Icons clear and meaningful

**Motor**
- [ ] All buttons >= 44x44 pts
- [ ] No gesture requirements
- [ ] Animations can be disabled
- [ ] Tap targets well-spaced

## Files Created

- **`services/accessibility.ts`** - Core accessibility service
- **`components/AccessibleComponents.tsx`** - Accessible UI components
- **`ACCESSIBILITY.md`** - This guide

## Next Steps

1. Review `services/accessibility.ts` for available utilities
2. Use `AccessibleComponents` in your chat interface
3. Add accessibility settings to profile screen
4. Test with screen readers and keyboard
5. Gather feedback from users with disabilities

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [Material Design Accessibility](https://material.io/design/usability/accessibility.html)
- [Apple Accessibility Guidelines](https://www.apple.com/accessibility/)

## Support

For accessibility issues or questions:
1. Check this guide for solutions
2. Review code examples in components
3. Test with actual assistive technologies
4. Gather user feedback
5. File accessibility issues with reproduction steps

import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  Pressable,
  View,
  ViewStyle,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { Feather } from "@expo/vector-icons";

// Consistent professional color palette
const PRIMARY_COLOR = "#0b6efd";
const SURFACE_COLOR = "#ffffff";
const TEXT_COLOR = "#1d2b3e";
const MUTED_TEXT = "#6a788e";
const BORDER_COLOR = "#e1e6f0";
const RIPPLE_COLOR = "rgba(11, 110, 253, 0.08)";

type MenuItem = { label: string; route: string; icon?: React.ComponentProps<typeof Feather>["name"]; };
type Props = { visible: boolean; onClose: () => void; items: MenuItem[]; offsetY?: number; style?: ViewStyle; };

export default function DropdownMenu({ visible, onClose, items, offsetY = 56, style }: Props) {
  const router = useRouter();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: visible ? 1 : 0, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true, }).start();
  }, [visible, anim]);
  const { signOut } = useAuth();

  if (!visible) return null;

  const backdropOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] });
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] });

  const handleNavigate = async (route: string) => {
    onClose();
    if (route === '/login') {
      try {
        await signOut();
      } catch {
        // ignore
      }
      setTimeout(() => router.replace(route), 100);
      return;
    }
  setTimeout(() => router.push(route as any), 100);
  };

  return (
    <View style={styles.wrapper} pointerEvents={visible ? "auto" : "none"}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close menu">
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </Pressable>

      <Animated.View style={[ styles.menu, { top: offsetY, transform: [{ translateY }, { scale }] }, style, ]}>
        {items.map((it, index) => (
          <React.Fragment key={it.label}>
            <Pressable
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              android_ripple={{ color: RIPPLE_COLOR }}
              onPress={() => handleNavigate(it.route)}
              accessibilityRole="menuitem"
              accessibilityLabel={it.label}
            >
              <View style={styles.iconWrap}>
                <Feather name={it.icon || 'circle'} size={20} color={MUTED_TEXT} />
              </View>
              <Text style={styles.itemLabel}>{it.label}</Text>
            </Pressable>
            {index < items.length - 1 && <View style={styles.separator} />}
          </React.Fragment>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { ...StyleSheet.absoluteFillObject, zIndex: 999 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "#000" },
  menu: {
    position: "absolute",
    left: 14,
    right: 14,
    borderRadius: 16,
    backgroundColor: SURFACE_COLOR,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
      android: { elevation: 12 },
    }),
  },
  item: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14 },
  itemPressed: { backgroundColor: RIPPLE_COLOR },
  iconWrap: { width: 40, alignItems: "center", justifyContent: "center", marginRight: 12 },
  itemLabel: { fontSize: 17, color: TEXT_COLOR, fontWeight: "600" },
  separator: { height: 1, backgroundColor: BORDER_COLOR, marginLeft: 72 },
});

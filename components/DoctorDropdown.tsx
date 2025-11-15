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
import { MaterialIcons, Feather, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";

// Professional color palette
const PRIMARY_COLOR = "#0b6efd";
const SURFACE_COLOR = "#ffffff";
const TEXT_COLOR = "#1d2b3e";
const MUTED_TEXT = "#6a788e";
const BORDER_COLOR = "#e1e6f0";
const RIPPLE_COLOR = "rgba(11, 110, 253, 0.08)";

type IconSpec = string | { name: string; family?: "MaterialIcons" | "Feather" | "Ionicons" | "FontAwesome5"; color?: string; size?: number; };
type MenuItem = { label: string; route: string; icon?: IconSpec; };
type Props = { visible: boolean; onClose: () => void; items: MenuItem[]; offsetY?: number; style?: ViewStyle; };

export default function DoctorDropdown({ visible, onClose, items, offsetY = 72, style }: Props) {
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
    // If this is the logout action, sign out first then navigate to login
    if (route === "/login") {
      try {
          await signOut();
        } catch {
          // swallow errors but still navigate
        }
      setTimeout(() => router.replace(route), 100);
      return;
    }

  setTimeout(() => router.replace(route as any), 100);
  };

  const renderIcon = (icon?: IconSpec) => {
    if (!icon) return <View style={styles.dot} />;
    const iconColor = MUTED_TEXT;
    const iconSize = 20;

    if (typeof icon === "string") {
      switch (icon.toLowerCase()) {
        case "schedule": return <MaterialIcons name="calendar-today" size={iconSize} color={iconColor} />;
        case "messages": return <Ionicons name="chatbubble-ellipses-outline" size={iconSize} color={iconColor} />;
        case "patients": return <Feather name="users" size={iconSize} color={iconColor} />;
        case "profile": return <MaterialIcons name="person-outline" size={iconSize} color={iconColor} />;
        case "logout": return <Feather name="log-out" size={iconSize} color={iconColor} />;
        default: return <View style={styles.dot} />;
      }
    }

    const IconComponent = {
      Feather,
      Ionicons,
      FontAwesome5,
      MaterialIcons,
    }[icon.family || "MaterialIcons"];

    return <IconComponent name={icon.name as any} size={icon.size || iconSize} color={icon.color || iconColor} />;
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
              <View style={styles.iconWrap}>{renderIcon(it.icon)}</View>
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
    alignSelf: "center",
    width: "80%",
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
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: PRIMARY_COLOR },
  itemLabel: { fontSize: 17, color: TEXT_COLOR, fontWeight: "600" },
  separator: { height: 1, backgroundColor: BORDER_COLOR, marginLeft: 72 },
});

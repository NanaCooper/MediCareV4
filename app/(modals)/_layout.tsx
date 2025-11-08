import React from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";

/**
 * Modal layout for the (modals) route group.
 * Uses native modal presentation style with swipe-to-dismiss and header hidden.
 */
export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Use modal presentation so it looks and behaves like a native modal
        presentation: "modal",
        // Allow vertical gestures to dismiss (swipe-down)
        gestureEnabled: true,
        gestureDirection: "vertical",
        animation: "slide_from_bottom",
        contentStyle: { backgroundColor: "transparent" },
        cardStyle: { backgroundColor: "transparent" },
        gestureResponseDistance:
          Platform.OS === "ios" ? { vertical: 120 } : { vertical: 80 },
      }}
    />
  );
}
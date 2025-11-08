import React from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";


export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Enable swipe gestures (works on iOS by default; enabled on Android where supported)
        gestureEnabled: true,
        // Make gestures horizontal for natural back behavior
        gestureDirection: "horizontal",
        // Slightly faster slide animation for auth flow feeling snappy
        animation: "slide_from_right",
        // Ensure consistent background across all auth screens
        contentStyle: { backgroundColor: "#ffffff" },
        // Card style (shadow/elevation) to make transitions feel native
        cardStyle: { backgroundColor: "#ffffff" },
        // Tweak gesture sensitivity per platform for a better mobile UX
        gestureResponseDistance:
          Platform.OS === "ios" ? { horizontal: 30 } : { horizontal: 20 },
        // Keep header styling consistent in case a screen shows a header later
        headerStyle: { backgroundColor: "#ffffff" },
      }}
    />
  );
}
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  BackHandler,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";

export default function BookingConfirmationModal() {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const anim = useRef(new Animated.Value(1)).current; // for small entrance if needed

  const details = {
    doctor: "Dr. Nana Cooper",
    date: "2025-11-12",
    time: "10:00 AM",
    location: "MediCare Central - 123 Main St",
  };

  useEffect(() => {
    // Animate in (optional subtle)
    Animated.timing(anim, {
      toValue: 1,
      duration: 240,
      useNativeDriver: true,
    }).start();

    // Hardware back handling: close modal
    const onBackPress = () => {
      router.back();
      return true; // prevent default behavior
    };
    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, [router, anim]);

  const handleConfirm = () => {
    console.log("Booking confirmed:", details);
    setConfirmed(true);
    Alert.alert("Success", "Appointment confirmed (mock).");
    // Close after small delay to show success
    setTimeout(() => router.back(), 700);
  };

  const handleEdit = () => {
    console.log("Edit booking requested");
    router.back();
    // Optionally navigate to edit screen after closing
  setTimeout(() => router.push("/patient/appointments" as any), 120);
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      {/* Backdrop tap closes modal */}
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => router.back()} />

      <Animated.View style={[styles.card, { transform: [{ scale: anim }] }]}>
        {!confirmed ? (
          <>
            <Text style={styles.title}>Confirm Appointment</Text>

            <View style={styles.row}>
              <Text style={styles.label}>Doctor</Text>
              <Text style={styles.value}>{details.doctor}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{details.date}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Time</Text>
              <Text style={styles.value}>{details.time}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Location</Text>
              <Text style={styles.value}>{details.location}</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.outlineBtn} onPress={handleEdit}>
                <Text style={styles.outlineBtnText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirm}>
                <Text style={styles.primaryBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.successWrap}>
            <Text style={styles.successTitle}>Confirmed</Text>
            <Text style={styles.successMsg}>
              Your appointment with {details.doctor} on {details.date} at {details.time} is confirmed.
            </Text>
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  card: {
    marginHorizontal: 16,
    marginBottom: Platform.OS === "ios" ? 28 : 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    zIndex: 1001,
    elevation: 8,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { color: "#666" },
  value: { fontWeight: "600" },

  actions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16 },
  outlineBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 10,
  },
  outlineBtnText: { color: "#333", fontWeight: "600" },
  primaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#0b6efd",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },

  successWrap: { alignItems: "center", paddingVertical: 16 },
  successTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  successMsg: { color: "#444", textAlign: "center" },
});
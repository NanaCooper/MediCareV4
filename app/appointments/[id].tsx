import React, { useMemo } from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

type Params = { id?: string };

export default function AppointmentDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<Params>();
  const id = params.id ?? "unknown";

  // Mock data lookup
  const appointment = useMemo(() => {
    return {
      id,
      date: "2025-11-12",
      time: "10:00 AM",
      doctor: { id: "d1", name: "Dr. Nana Cooper", specialty: "General Practitioner" },
      location: "MediCare Central - 123 Main St",
      status: "Upcoming",
      notes: "Bring previous blood test results.",
    };
  }, [id]);

  const handleCancel = () => {
    console.log("Cancel appointment", id);
    Alert.alert("Cancelled (mock)", "Appointment cancelled (mock).");
    router.replace("/patient/appointments");
  };

  const handleReschedule = () => {
    console.log("Reschedule appointment", id);
    // navigate to booking with doctor id for rescheduling
    router.push(`/booking/${appointment.doctor.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Appointment Details</Text>
        <Text style={styles.sub}>ID: {appointment.id}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.rowLabel}>Doctor</Text>
        <Text style={styles.rowValue}>{appointment.doctor.name} — {appointment.doctor.specialty}</Text>

        <Text style={styles.rowLabel}>Date & Time</Text>
        <Text style={styles.rowValue}>{appointment.date} • {appointment.time}</Text>

        <Text style={styles.rowLabel}>Location</Text>
        <Text style={styles.rowValue}>{appointment.location}</Text>

        <Text style={styles.rowLabel}>Status</Text>
        <Text style={styles.rowValue}>{appointment.status}</Text>

        <Text style={styles.rowLabel}>Notes</Text>
        <Text style={styles.rowValue}>{appointment.notes}</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, styles.outline]} onPress={handleReschedule}>
            <Text style={styles.outlineText}>Reschedule</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.negative]} onPress={handleCancel}>
            <Text style={styles.negativeText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "700" },
  sub: { color: "#666", marginTop: 4 },

  card: { backgroundColor: "#fafafa", padding: 14, borderRadius: 10, marginTop: 8 },
  rowLabel: { color: "#666", marginTop: 10, fontSize: 12 },
  rowValue: { fontSize: 16, fontWeight: "600", marginTop: 4 },

  actions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 18 },
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, marginLeft: 10 },
  outline: { borderWidth: 1, borderColor: "#0b6efd", backgroundColor: "#fff" },
  outlineText: { color: "#0b6efd", fontWeight: "700" },
  negative: { backgroundColor: "#fff0f0", borderWidth: 1, borderColor: "#d83b3b" },
  negativeText: { color: "#d83b3b", fontWeight: "700" },
});
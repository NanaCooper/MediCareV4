import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Pressable,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";

/**
 * Alternative style for Doctor Queue — "Calm Clinical"
 * - Cleaner, more clinical look (more whitespace, lighter borders)
 * - Muted slate tones with a soft green accent for actionable items
 * - Compact rows with clear affordances: Start, Message, Call
 * - Consistent vector icons and improved accessibility labels
 *
 * Save as queue.alt.tsx to preview as an alternate style. Replace queue.tsx when ready.
 */

type Appointment = {
  id: string;
  time: string;
  patient: string;
  reason?: string;
  status?: "waiting" | "checked-in" | "in-consultation";
};

const BG = "#f4f6f8"; // slightly warmer neutral
const SURFACE = "#ffffff";
const ACCENT = "#0ea57d"; // soft healthcare green
const MUTED = "#7b8794";
const PRIMARY = "#0b6efd";

export default function DoctorQueueAlt() {
  const router = useRouter();

  const mockAppointments: Appointment[] = [
    { id: "1", time: "09:00", patient: "Nana Cooper", reason: "Follow-up", status: "waiting" },
    { id: "2", time: "09:20", patient: "Alex Riley", reason: "New consult", status: "checked-in" },
    { id: "3", time: "09:45", patient: "Sam Lee", reason: "Prescription refill", status: "waiting" },
  ];

  const handleStart = (appt: Appointment) => {
    router.push(`/consultation/${appt.id}`);
  };
  const handleMessage = (appt: Appointment) => {
    router.push(`/doctor-messages/${appt.id}`);
  };
  const handleCall = (appt: Appointment) => {
    // placeholder; integrate telephony or VOIP later
    // use alert for demo feedback
    alert(`Calling ${appt.patient} (mock)`);
  };

  const renderRow = ({ item }: { item: Appointment }) => {
    const checkedIn = item.status === "checked-in";
    const inConsult = item.status === "in-consultation";
    const statusLabel = inConsult ? "In consult" : checkedIn ? "Checked in" : "Waiting";

    return (
      <View style={styles.row}>
        <View style={styles.leftCol}>
          <Text style={styles.time}>{item.time}</Text>
          <View style={[styles.statusBadge, checkedIn && styles.statusBadgeChecked]}>
            <Text style={[styles.statusText, checkedIn && styles.statusTextChecked]}>{statusLabel}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.centerCol}
          onPress={() => router.push(`/patients/${item.id}`)}
          accessibilityLabel={`Open patient ${item.patient}`}
          activeOpacity={0.85}
        >
          <Text style={styles.patientName}>{item.patient}</Text>
          <Text style={styles.reason} numberOfLines={1}>
            {item.reason ?? "General consultation"}
          </Text>
        </TouchableOpacity>

        <View style={styles.actionsCol}>
          <Pressable
            onPress={() => handleStart(item)}
            style={({ pressed }) => [styles.startBtn, pressed && styles.pressed]}
            accessibilityLabel={`Start consultation with ${item.patient}`}
          >
            <MaterialIcons name="play-arrow" size={18} color="#fff" />
            <Text style={styles.startText}>Start</Text>
          </Pressable>

          <View style={styles.iconRow}>
            <TouchableOpacity onPress={() => handleMessage(item)} style={styles.iconBtn} accessibilityLabel={`Message ${item.patient}`}>
              <Feather name="message-square" size={18} color={PRIMARY} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleCall(item)} style={styles.iconBtn} accessibilityLabel={`Call ${item.patient}`}>
              <Feather name="phone" size={18} color={ACCENT} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <View style={styles.container}>
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{mockAppointments.length}</Text>
            <Text style={styles.summaryLabel}>Appointments</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{mockAppointments.filter(a => a.status === "checked-in").length}</Text>
            <Text style={styles.summaryLabel}>Checked in</Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>2</Text>
            <Text style={styles.summaryLabel}>In progress</Text>
          </View>
        </View>

        <FlatList
          data={mockAppointments}
          keyExtractor={(i) => i.id}
          renderItem={renderRow}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },

  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  summaryNumber: { fontSize: 18, fontWeight: "800", color: "#0f1724" },
  summaryLabel: { color: MUTED, marginTop: 4, fontSize: 12 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: SURFACE,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    shadowColor: "#000",
    shadowOpacity: 0.01,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },

  leftCol: {
    width: 96,
    alignItems: "flex-start",
  },
  time: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f1724",
  },
  statusBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: "#fff7f3",
    borderWidth: 1,
    borderColor: "#ffe7dd",
  },
  statusBadgeChecked: {
    backgroundColor: "#ecfdf5",
    borderColor: "#d1fae5",
  },
  statusText: { color: "#92400e", fontWeight: "700", fontSize: 11 },
  statusTextChecked: { color: "#065f46" },

  centerCol: { flex: 1, paddingHorizontal: 12 },
  patientName: { fontSize: 16, fontWeight: "800", color: "#0f1724" },
  reason: { color: MUTED, marginTop: 6 },

  actionsCol: {
    width: 106,
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 64,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ACCENT,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  startText: { color: "#fff", fontWeight: "700", marginLeft: 6 },

  iconRow: { flexDirection: "row", marginTop: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  separator: { height: 12 },
  pressed: { opacity: 0.85 },
});

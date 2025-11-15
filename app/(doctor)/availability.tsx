import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import DoctorDropdown from "../../components/DoctorDropdown";

type DayAvailability = {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
};

const initialWeek: DayAvailability[] = [
  { day: "Mon", enabled: true, start: "09:00", end: "17:00" },
  { day: "Tue", enabled: true, start: "09:00", end: "17:00" },
  { day: "Wed", enabled: true, start: "09:00", end: "17:00" },
  { day: "Thu", enabled: true, start: "09:00", end: "17:00" },
  { day: "Fri", enabled: true, start: "09:00", end: "17:00" },
  { day: "Sat", enabled: false, start: "09:00", end: "12:00" },
  { day: "Sun", enabled: false, start: "00:00", end: "00:00" },
];

export default function AvailabilityManagement() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [week, setWeek] = useState<DayAvailability[]>(initialWeek);

  const menuItems = [
    { label: "Dashboard", route: "/doctor", icon: "🏠" },
    { label: "Schedule", route: "/doctor/schedule", icon: "🗓️" },
    { label: "Patient Queue", route: "/doctor/queue", icon: "👥" },
    { label: "Messages", route: "/doctor/messages", icon: "💬" },
    { label: "My Patients", route: "/doctor/my-patients", icon: "📋" },
    { label: "Availability", route: "/doctor/availability", icon: "⏰" },
    { label: "Profile", route: "/doctor/profile", icon: "👩‍⚕️" },
    { label: "Logout", route: "/login", icon: "🚪" },
  ];

  const toggleDay = (index: number) => {
    setWeek((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], enabled: !copy[index].enabled };
      return copy;
    });
  };

  const setTime = (index: number, field: "start" | "end", value: string) => {
    setWeek((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSave = () => {
    console.log("Saved availability:", week);
    Alert.alert("Saved", "Availability settings saved (mock).");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setMenuVisible((v) => !v)}
          style={styles.hamburger}
        >
          <Text style={styles.hamburgerIcon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Availability</Text>

        <TouchableOpacity style={styles.profileBtn}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>D</Text>
          </View>
        </TouchableOpacity>
      </View>

      <DoctorDropdown
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        items={menuItems}
        offsetY={Platform.OS === "ios" ? 88 : 72}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          Set your weekly availability. Toggle a day on and edit start / end
          times. This is a mock interface — replace with time pickers / calendar
          picker later.
        </Text>

        {week.map((d, i) => (
          <View key={d.day} style={styles.dayRow}>
            <View style={styles.dayLeft}>
              <Text style={styles.dayLabel}>{d.day}</Text>
              <Switch value={d.enabled} onValueChange={() => toggleDay(i)} />
            </View>

            <View style={styles.dayRight}>
              <TextInput
                style={[styles.timeInput, !d.enabled && styles.disabledInput]}
                value={d.start}
                onChangeText={(val) => setTime(i, "start", val)}
                editable={d.enabled}
              />
              <Text style={styles.toText}>to</Text>
              <TextInput
                style={[styles.timeInput, !d.enabled && styles.disabledInput]}
                value={d.end}
                onChangeText={(val) => setTime(i, "end", val)}
                editable={d.enabled}
              />
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Availability</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 72,
    paddingTop: Platform.OS === "ios" ? 24 : 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  hamburger: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  hamburgerIcon: { fontSize: 22 },
  title: { fontSize: 18, fontWeight: "600" },
  profileBtn: { padding: 6 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0b6efd",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700" },

  content: { padding: 16 },
  description: { color: "#666", marginBottom: 12 },

  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#f4f4f4",
  },
  dayLeft: { width: 110, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dayLabel: { fontWeight: "700", marginRight: 8 },

  dayRight: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end" },
  timeInput: {
    width: 80,
    height: 36,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: "#fafafa",
    textAlign: "center",
  },
  disabledInput: {
    opacity: 0.5,
  },
  toText: { marginHorizontal: 8, color: "#666" },

  saveBtn: {
    marginTop: 12,
    backgroundColor: "#0b6efd",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "700" },
});
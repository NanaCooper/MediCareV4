import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

/**
 * Polished Doctor Schedule placeholder
 * - Premium visual language: soft background, elevated card, refined typography
 * - Uses vector icons for header actions and dropdown menu items
 * - Calendar mock includes a week-strip and selectable time slots (mock)
 * - Dropdown menu items updated to use icon specs compatible with DoctorDropdown
 */

const BG = "#f6f8ff";
const CARD = "#ffffff";
const PRIMARY = "#0b6efd";

export default function DoctorSchedule() {
  const router = useRouter();

  const [selectedDay, setSelectedDay] = useState(2); // 0..6 (mock: Wednesday)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const week = [
    { key: "Mon", date: "10" },
    { key: "Tue", date: "11" },
    { key: "Wed", date: "12" },
    { key: "Thu", date: "13" },
    { key: "Fri", date: "14" },
    { key: "Sat", date: "15" },
    { key: "Sun", date: "16" },
  ];

  const timeSlots = ["08:30", "09:00", "10:00", "11:30", "14:00", "15:30"];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>This week</Text>

          <FlatList
            data={week}
            horizontal
            keyExtractor={(it) => it.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weekList}
            renderItem={({ item, index }) => {
              const selected = index === selectedDay;
              return (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedDay(index);
                    setSelectedSlot(null);
                  }}
                  style={[styles.dayPill, selected && styles.dayPillSelected]}
                >
                  <Text style={[styles.dayLabel, selected && styles.dayLabelSelected]}>
                    {item.key}
                  </Text>
                  <Text style={[styles.dayDate, selected && styles.dayDateSelected]}>
                    {item.date}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Available time slots — {week[selectedDay].key}</Text>

            <View style={styles.slotsGrid}>
              {timeSlots.map((t) => {
                const active = t === selectedSlot;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setSelectedSlot(active ? null : t)}
                    style={[styles.slot, active && styles.slotActive]}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.slotText, active && styles.slotTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.hintRow}>
              <MaterialIcons name="info-outline" size={16} color="#6b7280" />
              <Text style={styles.hintText}>Tap a slot to block/unblock. This is a mock UI.</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Calendar (mock)</Text>
          <View style={styles.calendarMock}>
            <Text style={styles.calendarText}>Full calendar view coming soon</Text>
            <Text style={styles.calendarSubtext}>Replace with a real calendar component (react-native-calendars, etc.)</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  container: { flex: 1, paddingHorizontal: 20, paddingBottom: 20 },

  card: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    // border + shadow for premium look
    borderWidth: 1,
    borderColor: "rgba(15,23,36,0.03)",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0f1724", marginBottom: 10 },

  weekList: { paddingVertical: 6 },
  dayPill: {
    width: 64,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#fbfdff",
    borderWidth: 1,
    borderColor: "rgba(15,23,36,0.03)",
  },
  dayPillSelected: {
    backgroundColor: "#eaf4ff",
    borderColor: PRIMARY,
  },
  dayLabel: { fontSize: 13, color: "#6b7280" },
  dayLabelSelected: { color: PRIMARY, fontWeight: "700" },
  dayDate: { marginTop: 6, fontWeight: "700", color: "#0f1724" },
  dayDateSelected: { color: "#0f1724" },

  section: { marginTop: 12 },
  sectionLabel: { color: "#6b7280", marginBottom: 10 },

  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    // For Android fallback where gap isn't supported, use margins on slot
  },
  slot: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#fbfdff",
    borderWidth: 1,
    borderColor: "rgba(15,23,36,0.03)",
    marginRight: 8,
    marginBottom: 8,
  },
  slotActive: {
    backgroundColor: "#0b6efd",
    borderColor: "#0b6efd",
  },
  slotText: { color: "#0f1724", fontWeight: "600" },
  slotTextActive: { color: "#fff" },

  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  hintText: {
    marginLeft: 8,
    color: "#6b7280",
    fontSize: 13,
  },

  calendarMock: {
    height: 160,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(15,23,36,0.03)",
    backgroundColor: "#fbfdff",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  calendarText: { color: "#475569", fontSize: 15, fontWeight: "700" },
  calendarSubtext: { color: "#9aa7c7", fontSize: 12, marginTop: 8, textAlign: "center" },
});

import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
} from "react-native";

type Appointment = {
  id: string;
  date: string;
  time: string;
  doctor: string;
  status: "upcoming" | "completed" | "cancelled";
};

export default function Appointments() {

  const appointments: Appointment[] = [
    { id: "1", date: "2025-11-10", time: "10:00", doctor: "Dr. Nana Cooper", status: "upcoming" },
    { id: "2", date: "2025-10-15", time: "09:00", doctor: "Dr. Alex Riley", status: "completed" },
    { id: "3", date: "2025-09-02", time: "13:30", doctor: "Dr. Sam Lee", status: "cancelled" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <FlatList
          data={appointments}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.dateText}>{item.date}</Text>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>

              <View style={styles.cardRight}>
                <Text style={styles.doctorText}>{item.doctor}</Text>
                <Text style={[styles.status, item.status === "upcoming" ? styles.upcoming : item.status === "completed" ? styles.completed : styles.cancelled]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, padding: 16 },
  card: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f2f2f2",
    marginBottom: 10,
    backgroundColor: "#fafafa",
  },
  cardLeft: { width: 110 },
  dateText: { fontWeight: "700" },
  timeText: { color: "#666", marginTop: 6 },

  cardRight: { flex: 1, alignItems: "flex-end" },
  doctorText: { fontWeight: "700" },
  status: { marginTop: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontWeight: "700" },
  upcoming: { backgroundColor: "#edf7f1", color: "#0a8a59" },
  completed: { backgroundColor: "#eef2ff", color: "#4b5cff" },
  cancelled: { backgroundColor: "#fff0f0", color: "#d83b3b" },
});

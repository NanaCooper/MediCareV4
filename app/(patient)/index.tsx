import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";

const BG = "#f6f8ff";
const CARD = "#ffffff";
const PRIMARY = "#0b6efd";
const MUTED = "#6b7280";

export default function PatientDashboard(): JSX.Element {
  const router = useRouter();

  const upcoming = [
    { id: "a1", date: "2025-11-10", time: "10:00", doctor: "Dr. Nana Cooper", location: "MediCare Central" },
    { id: "a2", date: "2025-11-18", time: "14:30", doctor: "Dr. Alex Riley", location: "North Clinic" },
  ];
  const stats = {
    appointmentsThisMonth: 3,
    prescriptions: 5,
    labResults: 2,
  };
  const recentActivity = [
    { id: "r1", title: "Lab result: CBC available", time: "2h ago" },
    { id: "r2", title: "Prescription renewed: Metformin", time: "2 days ago" },
    { id: "r3", title: "Message from Dr. Nana Cooper", time: "3 days ago" },
  ];

  const renderAppointment = ({ item }: { item: typeof upcoming[0] }) => (
    <TouchableOpacity
      style={styles.apptCard}
      activeOpacity={0.85}
      onPress={() => router.push(`/appointments/${item.id}`)}
      accessibilityLabel={`Open appointment on ${item.date} with ${item.doctor}`}
    >
      <View style={styles.apptLeft}>
        <View style={styles.dateBox}>
          <Text style={styles.dateDay}>{item.date.split("-")[2]}</Text>
          <Text style={styles.dateMonth}>{new Date(item.date).toLocaleString(undefined, { month: "short" })}</Text>
        </View>
      </View>

      <View style={styles.apptMiddle}>
        <Text style={styles.apptDoctor}>{item.doctor}</Text>
        <Text style={styles.apptMeta}>
          {item.time} • {item.location}
        </Text>
      </View>

      <View style={styles.apptRight}>
        <TouchableOpacity
          style={styles.cta}
          onPress={() => router.push(`/consultation/${item.id}`)}
          accessibilityLabel="Join consultation"
        >
          <Feather name="video" size={14} color="#fff" />
          <Text style={styles.ctaText}>Join</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderActivity = ({ item }: { item: typeof recentActivity[0] }) => (
    <View style={styles.activityRow}>
      <MaterialIcons name="history" size={18} color="#9aa7c7" />
      <View style={{ marginLeft: 12 }}>
        <Text style={styles.activityText}>{item.title}</Text>
        <Text style={styles.activityTime}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good afternoon</Text>
          <Text style={styles.username}>Nana Cooper</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/messages")}
            accessibilityLabel="Open messages"
          >
            <Feather name="message-circle" size={20} color={PRIMARY} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => router.push("/patients/you")}
            accessibilityLabel="Open profile"
          >
            <Text style={styles.profileInitial}>N</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.container}>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/booking/doctor-list")} accessibilityLabel="Book appointment">
            <Feather name="calendar" size={20} color={PRIMARY} />
            <Text style={styles.actionTitle}>Book</Text>
            <Text style={styles.actionSubtitle}>Appointment</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/prescriptions")} accessibilityLabel="View prescriptions">
            <Feather name="file-text" size={20} color="#16a34a" />
            <Text style={styles.actionTitle}>Prescriptions</Text>
            <Text style={styles.actionSubtitle}>{stats.prescriptions} active</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/labs")} accessibilityLabel="View lab results">
            <MaterialIcons name="science" size={20} color="#f59e0b" />
            <Text style={styles.actionTitle}>Labs</Text>
            <Text style={styles.actionSubtitle}>{stats.labResults} results</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          <FlatList
            data={upcoming}
            keyExtractor={(i) => i.id}
            renderItem={renderAppointment}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            style={{ marginTop: 8 }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        </View>

        <View style={styles.rowStats}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.appointmentsThisMonth}</Text>
            <Text style={styles.statLabel}>Appointments (this month)</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.prescriptions}</Text>
            <Text style={styles.statLabel}>Active prescriptions</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.labResults}</Text>
            <Text style={styles.statLabel}>Lab results</Text>
          </View>
        </View>

        <View style={[styles.section, { marginTop: 14 }]}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <FlatList
            data={recentActivity}
            keyExtractor={(i) => i.id}
            renderItem={renderActivity}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            style={{ marginTop: 8 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const shadow = {
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6,
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 18 : 12,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  greeting: { color: MUTED, fontSize: 13 },
  username: { fontSize: 22, fontWeight: "800", color: "#0f1724", marginTop: 4 },

  headerRight: { flexDirection: "row", alignItems: "center" },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    ...shadow,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
  profileInitial: { color: "#fff", fontWeight: "800" },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    ...shadow,
  },
  actionTitle: { fontSize: 14, fontWeight: "800", marginTop: 8 },
  actionSubtitle: { color: MUTED, fontSize: 12, marginTop: 2 },

  section: { marginTop: 18 },

  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#0f1724" },

  apptCard: {
    flexDirection: "row",
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    ...shadow,
  },
  apptLeft: {},
  dateBox: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#eef6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  dateDay: { fontSize: 18, fontWeight: "900", color: PRIMARY },
  dateMonth: { fontSize: 12, color: MUTED },

  apptMiddle: { flex: 1, marginLeft: 12 },
  apptDoctor: { fontSize: 16, fontWeight: "800", color: "#0f1724" },
  apptMeta: { color: MUTED, marginTop: 4 },

  apptRight: { marginLeft: 8 },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  ctaText: { color: "#fff", fontWeight: "800", marginLeft: 8 },

  rowStats: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    ...shadow,
  },
  statNumber: { fontSize: 20, fontWeight: "900", color: PRIMARY },
  statLabel: { color: MUTED, fontSize: 12, marginTop: 6 },

  activityRow: { flexDirection: "row", alignItems: "center" },
  activityText: { fontSize: 14, color: "#0f1724", fontWeight: "600" },
  activityTime: { color: MUTED, marginTop: 4, fontSize: 12 },
});

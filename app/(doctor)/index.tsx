import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

/**
 * Polished Doctor Dashboard
 * - Elevated, card-based layout with refined spacing and typography
 * - Iconography via @expo/vector-icons for a premium, consistent look
 * - Better color tokens and subtle shadows for depth
 * - Touchable message rows and stat cards prepared for navigation
 */

const BG = "#f6f8ff";
const PRIMARY = "#0b6efd";
const CARD = "#ffffff";

export default function DoctorDashboard() {
  const router = useRouter();

  // Mock data
  const todaysAppointments = 8;
  const patientsInQueue = 3;
  const patientsSeenThisWeek = 26;
  const recentMessages = [
    { id: "1", from: "Nana Cooper", text: "Thanks doc — prescription received.", time: "09:12" },
    { id: "2", from: "Alex Riley", text: "Can we reschedule tomorrow?", time: "Yesterday" },
  ];

  const StatCard = ({ icon, value, label, onPress }: { icon: React.ReactNode; value: number | string; label: string; onPress?: () => void }) => (
    <TouchableOpacity style={styles.statCard} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.statIconWrap}>{icon}</View>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }: { item: typeof recentMessages[0] }) => (
    <TouchableOpacity
      style={styles.messageRow}
      activeOpacity={0.8}
      onPress={() => {
        // navigate to conversation (placeholder)
        router.push(`/doctor-messages/${item.id}`);
      }}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.from.charAt(0)}</Text>
      </View>

      <View style={styles.messageContent}>
        <Text style={styles.messageFrom}>{item.from}</Text>
        <Text style={styles.messageText} numberOfLines={1}>
          {item.text}
        </Text>
      </View>

      <Text style={styles.messageTime}>{item.time}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <View style={styles.container}>
        <View style={styles.cardRow}>
          <StatCard
            icon={<MaterialIcons name="calendar-today" size={20} color={PRIMARY} />}
            value={todaysAppointments}
            label="Today's Appointments"
            onPress={() => router.push("/(doctor)/schedule")}
          />
          <StatCard
            icon={<Feather name="users" size={20} color="#16a34a" />}
            value={patientsInQueue}
            label="In Queue"
            onPress={() => router.push("/(doctor)/queue")}
          />
        </View>

        <View style={styles.bigCard}>
          <View style={styles.bigCardHeader}>
            <Text style={styles.bigCardTitle}>Quick Stats</Text>
            <Text style={styles.bigCardSub}>This week</Text>
          </View>
          <View style={styles.bigCardBody}>
            <View style={styles.bigStat}>
              <Text style={styles.bigStatNumber}>{patientsSeenThisWeek}</Text>
              <Text style={styles.bigStatLabel}>Patients seen</Text>
            </View>

            <View style={styles.pulse}>
              <View style={styles.pulseDot} />
              <Text style={styles.pulseText}>Clinic running smoothly — keep up the good work</Text>
            </View>
          </View>
        </View>

        <View style={styles.messagesCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Messages</Text>
            <TouchableOpacity onPress={() => router.push("/(doctor)/messages")}>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={recentMessages}
            keyExtractor={(i) => i.id}
            renderItem={renderMessage}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flex: 1, paddingHorizontal: 20, paddingBottom: 20 },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },

  statCard: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    alignItems: "center",
    // shadow
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#f0f6ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statNumber: { fontSize: 22, fontWeight: "800", color: PRIMARY },
  statLabel: { fontSize: 12, color: "#6b7280", marginTop: 6, textAlign: "center" },

  bigCard: {
    marginTop: 16,
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(15,23,36,0.04)",
    // elevation / shadow
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  bigCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bigCardTitle: { fontSize: 16, fontWeight: "800", color: "#0f1724" },
  bigCardSub: { color: "#6b7280", fontSize: 12 },

  bigCardBody: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bigStat: { flex: 1 },
  bigStatNumber: { fontSize: 28, fontWeight: "900", color: "#0f1724" },
  bigStatLabel: { color: "#6b7280", marginTop: 6 },

  pulse: { flex: 1.3, marginLeft: 12, flexDirection: "row", alignItems: "center" },
  pulseDot: { width: 10, height: 10, borderRadius: 6, backgroundColor: "#10b981", marginRight: 10 },
  pulseText: { color: "#475569", fontSize: 13 },

  messagesCard: { marginTop: 18 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#0f1724" },
  viewAll: { color: PRIMARY, fontWeight: "700" },

  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#eef6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: PRIMARY, fontWeight: "800" },

  messageContent: { flex: 1 },
  messageFrom: { fontWeight: "700", color: "#0f1724" },
  messageText: { color: "#6b7280", marginTop: 4 },

  messageTime: { color: "#9aa7c7", fontSize: 12, marginLeft: 8 },

  sep: { height: 1, backgroundColor: "rgba(15,23,36,0.03)" },
});

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  StatusBar,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

type Patient = {
  id: string;
  name: string;
  lastVisit: string;
  nextAppointment?: string;
  conditions: string[];
  avatarColor?: string;
};

const BG = "#f6f8ff";
const CARD = "#ffffff";
const PRIMARY = "#0b6efd";
const MUTED = "#6b7280";

export default function MyPatients() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const patients: Patient[] = [
    {
      id: "p1",
      name: "Nana Cooper",
      lastVisit: "2025-11-02",
      nextAppointment: "2025-11-12",
      conditions: ["Hypertension"],
      avatarColor: "#eaf4ff",
    },
    {
      id: "p2",
      name: "Alex Riley",
      lastVisit: "2025-10-21",
      nextAppointment: "2025-11-10",
      conditions: ["Diabetes", "Asthma"],
      avatarColor: "#fff5e6",
    },
    {
      id: "p3",
      name: "Sam Lee",
      lastVisit: "2025-11-01",
      nextAppointment: undefined,
      conditions: ["Allergies"],
      avatarColor: "#f6f9ee",
    },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.conditions.join(" ").toLowerCase().includes(q)
    );
  }, [query]);

  const openPatient = (id: string) => {
    router.push(`/patients/${id}`);
  };

  const startChat = (id: string) => {
    // In this project the patient chat route is /doctor-messages/:conversationId or /messages/:conversationId.
    // We'll navigate to the doctor conversation route placeholder with the patient id.
    router.push(`/doctor-messages/${id}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <View style={styles.content}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Feather name="search" size={18} color="#9aa7c7" />
            <TextInput
              placeholder="Search patients or conditions"
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              accessible
              accessibilityLabel="Search patients"
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery("")} style={styles.clearBtn} accessibilityLabel="Clear search">
                <Feather name="x" size={16} color="#9aa7c7" />
              </Pressable>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push("/doctor/my-patients/new")}
            accessibilityLabel="Add patient"
          >
            <Feather name="user-plus" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          style={{ width: "100%", marginTop: 12 }}
          contentContainerStyle={{ paddingBottom: 32 }}
          renderItem={({ item }) => (
            <View style={styles.patientCard}>
              <TouchableOpacity style={styles.patientLeft} onPress={() => openPatient(item.id)} activeOpacity={0.85}>
                <View style={[styles.avatarCircle, { backgroundColor: item.avatarColor ?? "#eef6ff" }]}>
                  <Text style={styles.avatarCircleText}>{item.name.charAt(0)}</Text>
                </View>
                <View style={styles.patientMiddle}>
                  <Text style={styles.patientName}>{item.name}</Text>
                  <Text style={styles.patientMeta}>
                    Last visit: <Text style={styles.metaValue}>{item.lastVisit}</Text>
                    {item.nextAppointment ? (
                      <Text> · Next: <Text style={styles.metaValue}>{item.nextAppointment}</Text></Text>
                    ) : null}
                  </Text>

                  <View style={styles.conditionsRow}>
                    {item.conditions.map((c) => (
                      <View key={c} style={styles.conditionPill}>
                        <Text style={styles.conditionText}>{c}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.patientActions}>
                <TouchableOpacity style={styles.iconAction} onPress={() => startChat(item.id)} accessibilityLabel={`Message ${item.name}`}>
                  <Feather name="message-circle" size={18} color={PRIMARY} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.viewBtn} onPress={() => openPatient(item.id)} accessibilityLabel={`View ${item.name}`}>
                  <Text style={styles.viewBtnText}>View</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No patients found</Text>
              <Text style={styles.emptySubtitle}>Try a different search term or add a new patient.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 14 },

  searchRow: { flexDirection: "row", alignItems: "center" },
  searchBox: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "rgba(15,23,36,0.03)",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    height: "100%",
    color: "#0f1724",
    fontSize: 15,
  },
  clearBtn: { padding: 8 },

  addBtn: {
    marginLeft: 12,
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0b6efd",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  patientCard: {
    marginTop: 12,
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(15,23,36,0.03)",
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  patientLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarCircleText: { color: PRIMARY, fontWeight: "800", fontSize: 18 },

  patientMiddle: { flex: 1 },
  patientName: { fontSize: 16, fontWeight: "800", color: "#0f1724" },
  patientMeta: { color: MUTED, marginTop: 4, fontSize: 13 },
  metaValue: { color: "#0f1724", fontWeight: "700" },

  conditionsRow: { flexDirection: "row", marginTop: 8, flexWrap: "wrap" },
  conditionPill: {
    backgroundColor: "#f3f7ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 8,
    marginTop: 6,
  },
  conditionText: { color: "#0b6efd", fontSize: 12, fontWeight: "700" },

  patientActions: { flexDirection: "row", alignItems: "center", marginLeft: 8 },
  iconAction: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#fbfdff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(15,23,36,0.03)",
  },
  viewBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(11,110,253,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  viewBtnText: { color: PRIMARY, fontWeight: "700" },

  empty: { padding: 28, alignItems: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#0f1724", marginBottom: 6 },
  emptySubtitle: { color: MUTED, textAlign: "center" },
});

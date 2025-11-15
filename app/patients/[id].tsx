import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from "expo-router";

type Params = { id?: string };

export default function PatientForDoctorView() {
  const params = useLocalSearchParams<Params>();
  const id = params.id ?? "unknown";

  const patient = useMemo(() => ({
    id,
    name: "Nana Cooper",
    age: 36,
    conditions: ["Hypertension"],
    medications: ["Metformin"],
    lastVisit: "2025-11-02",
    notes: "Monitoring blood pressure at home.",
  }), [id]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.name}>{patient.name} (ID: {patient.id})</Text>
        <Text style={styles.meta}>Age: {patient.age} • Last visit: {patient.lastVisit}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Medical History</Text>
          <Text style={styles.cardText}>Conditions: {patient.conditions.join(", ")}</Text>
          <Text style={styles.cardText}>Medications: {patient.medications.join(", ")}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Notes</Text>
          <Text style={styles.cardText}>{patient.notes}</Text>
        </View>

        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionText}>Open Full Medical Record</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  name: { fontSize: 20, fontWeight: "700" },
  meta: { color: "#666", marginTop: 6, marginBottom: 12 },

  card: { backgroundColor: "#fafafa", padding: 12, borderRadius: 10, marginBottom: 12 },
  cardTitle: { fontWeight: "700", marginBottom: 8 },
  cardText: { color: "#444" },

  actionBtn: { marginTop: 16, backgroundColor: "#0b6efd", padding: 12, borderRadius: 8, alignItems: "center" },
  actionText: { color: "#fff", fontWeight: "700" },
});
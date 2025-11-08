import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

type Params = { appointmentId?: string };

export default function ConsultationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Params>();
  const appointmentId = params.appointmentId ?? "unknown";

  // mock state
  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [vitals, setVitals] = useState({ bp: "120/80", hr: "72" });

  const handleSaveNotes = () => {
    console.log("Save consultation notes (mock):", { appointmentId, notes, prescription, vitals });
    Alert.alert("Saved", "Consultation notes saved (mock).");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Consultation — {appointmentId}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vitals</Text>
          <Text style={styles.row}>BP: {vitals.bp}</Text>
          <Text style={styles.row}>HR: {vitals.hr}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Notes</Text>
          <TextInput style={[styles.input, { height: 120 }]} value={notes} onChangeText={setNotes} multiline placeholder="Enter observations, exam findings..." />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prescription</Text>
          <TextInput style={styles.input} value={prescription} onChangeText={setPrescription} placeholder="e.g., Drug, dosage, frequency" />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNotes}>
          <Text style={styles.saveText}>Save Consultation</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.saveBtn, { marginTop: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#0b6efd" }]} onPress={() => router.push("/(modals)/medical-notes")}>
          <Text style={{ color: "#0b6efd", fontWeight: "700" }}>Open Medical Notes Modal</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { padding: 16, borderBottomWidth: 1, borderColor: "#eee" },
  title: { fontSize: 18, fontWeight: "700" },

  content: { padding: 16 },
  section: { marginBottom: 14 },
  sectionTitle: { fontWeight: "700", marginBottom: 8 },
  row: { color: "#444", marginBottom: 6 },

  input: { borderWidth: 1, borderColor: "#eee", borderRadius: 8, paddingHorizontal: 10, backgroundColor: "#fafafa" },

  saveBtn: { marginTop: 8, backgroundColor: "#0b6efd", padding: 12, borderRadius: 8, alignItems: "center" },
  saveText: { color: "#fff", fontWeight: "700" },
});
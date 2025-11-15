import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from "expo-router";

type Params = { appointmentId?: string };

export default function ConsultationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Params>();
  const appointmentId = params.appointmentId ?? "unknown";

  // Mock patient data
  const patientData = {
    name: "James Wilson",
    age: 34,
    lastVisit: "2024-11-01",
    conditions: ["Hypertension", "Type 2 Diabetes"],
    medications: ["Lisinopril 10mg", "Metformin 1000mg"],
    allergies: ["Penicillin", "Shellfish"],
  };

  // mock state
  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [vitals] = useState({ bp: "120/80", hr: "72", temp: "98.6", rr: "16" });
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [showPatientHistory, setShowPatientHistory] = useState(false);

  const handleSaveNotes = () => {
    console.log("Save consultation notes (mock):", { appointmentId, notes, prescription, vitals });
    Alert.alert("Saved", "Consultation notes saved (mock).");
  };

  const handleStartVideoCall = () => {
    setIsVideoCallActive(true);
    Alert.alert("Video Call", "Starting video consultation...");
    setTimeout(() => setIsVideoCallActive(false), 3000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Consultation</Text>
          <Text style={styles.patientName}>{patientData.name}, {patientData.age}</Text>
        </View>
        <TouchableOpacity 
          style={styles.videoButton}
          onPress={handleStartVideoCall}
        >
          <Text style={styles.videoIcon}>📹</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.subHeader}>
        <TouchableOpacity 
          style={[styles.tab, styles.tabActive]}
          onPress={() => setShowPatientHistory(false)}
        >
          <Text style={styles.tabText}>Consultation</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => setShowPatientHistory(true)}
        >
          <Text style={styles.tabText}>History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {!showPatientHistory ? (
          <>
            {/* Vitals Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Vitals</Text>
              <View style={styles.vitalsGrid}>
                <View style={styles.vitalCard}>
                  <Text style={styles.vitalLabel}>BP</Text>
                  <Text style={styles.vitalValue}>{vitals.bp}</Text>
                  <Text style={styles.vitalUnit}>mmHg</Text>
                </View>
                <View style={styles.vitalCard}>
                  <Text style={styles.vitalLabel}>HR</Text>
                  <Text style={styles.vitalValue}>{vitals.hr}</Text>
                  <Text style={styles.vitalUnit}>bpm</Text>
                </View>
                <View style={styles.vitalCard}>
                  <Text style={styles.vitalLabel}>Temp</Text>
                  <Text style={styles.vitalValue}>{vitals.temp}</Text>
                  <Text style={styles.vitalUnit}>°F</Text>
                </View>
                <View style={styles.vitalCard}>
                  <Text style={styles.vitalLabel}>RR</Text>
                  <Text style={styles.vitalValue}>{vitals.rr}</Text>
                  <Text style={styles.vitalUnit}>breaths</Text>
                </View>
              </View>
            </View>

            {/* Medical Notes Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 Medical Notes</Text>
              <TextInput 
                style={[styles.input, { height: 120 }]} 
                value={notes} 
                onChangeText={setNotes} 
                multiline 
                placeholder="Enter observations, exam findings..."
                placeholderTextColor="#999"
              />
            </View>

            {/* Prescription Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💊 Prescription</Text>
              <TextInput 
                style={styles.input} 
                value={prescription} 
                onChangeText={setPrescription} 
                placeholder="e.g., Drug, dosage, frequency"
                placeholderTextColor="#999"
              />
            </View>

            {/* Action Buttons */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNotes}>
              <Text style={styles.saveText}>Save Consultation</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.saveBtn, { marginTop: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#0b6efd" }]} 
              onPress={() => router.push("/(modals)/medical-notes")}
            >
              <Text style={{ color: "#0b6efd", fontWeight: "700" }}>Open Medical Notes Modal</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Patient History View */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👤 Patient Info</Text>
              <View style={styles.historyCard}>
                <Text style={styles.historyLabel}>Name:</Text>
                <Text style={styles.historyValue}>{patientData.name}</Text>
              </View>
              <View style={styles.historyCard}>
                <Text style={styles.historyLabel}>Age:</Text>
                <Text style={styles.historyValue}>{patientData.age} years</Text>
              </View>
              <View style={styles.historyCard}>
                <Text style={styles.historyLabel}>Last Visit:</Text>
                <Text style={styles.historyValue}>{patientData.lastVisit}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🩺 Medical Conditions</Text>
              {patientData.conditions.map((condition, idx) => (
                <View key={idx} style={styles.historyCard}>
                  <Text style={styles.historyValue}>• {condition}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💊 Current Medications</Text>
              {patientData.medications.map((med, idx) => (
                <View key={idx} style={styles.historyCard}>
                  <Text style={styles.historyValue}>• {med}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚠️ Allergies</Text>
              {patientData.allergies.map((allergy, idx) => (
                <View key={idx} style={[styles.historyCard, styles.allergyCard]}>
                  <Text style={styles.allergyText}>• {allergy}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Video Call Modal */}
      <Modal
        visible={isVideoCallActive}
        transparent
        animationType="fade"
      >
        <View style={styles.videoContainer}>
          <View style={styles.videoFrame}>
            <Text style={styles.videoPlaceholder}>📹 Video Call Active</Text>
            <Text style={styles.videoSubtext}>Dr. System • {patientData.name}</Text>
          </View>
          <TouchableOpacity 
            style={styles.videoEndBtn}
            onPress={() => setIsVideoCallActive(false)}
          >
            <Text style={styles.videoEndText}>End Call</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  
  header: { 
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1, 
    borderColor: "#eee" 
  },
  title: { fontSize: 18, fontWeight: "700", color: "#0f1724" },
  patientName: { fontSize: 13, color: "#666", marginTop: 4 },
  
  videoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  videoIcon: { fontSize: 20 },

  subHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#0b6efd",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },

  content: { padding: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontWeight: "700", marginBottom: 12, fontSize: 15, color: "#0f1724" },

  // Vitals Grid
  vitalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  vitalCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#f0f6ff",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  vitalLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  vitalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0b6efd",
  },
  vitalUnit: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },

  // Input and Buttons
  input: { 
    borderWidth: 1, 
    borderColor: "#eee", 
    borderRadius: 8, 
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fafafa",
    color: "#0f1724",
    fontSize: 14,
  },

  saveBtn: { 
    marginTop: 8, 
    backgroundColor: "#0b6efd", 
    padding: 14, 
    borderRadius: 8, 
    alignItems: "center" 
  },
  saveText: { 
    color: "#fff", 
    fontWeight: "700",
    fontSize: 14,
  },

  // History Cards
  historyCard: {
    backgroundColor: "#f9f9f9",
    borderLeftWidth: 3,
    borderLeftColor: "#0b6efd",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderRadius: 6,
  },
  allergyCard: {
    borderLeftColor: "#e23b3b",
    backgroundColor: "#fff5f5",
  },
  historyLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  historyValue: {
    fontSize: 14,
    color: "#0f1724",
    marginTop: 4,
  },
  allergyText: {
    fontSize: 14,
    color: "#e23b3b",
    fontWeight: "600",
  },

  // Video Call Modal
  videoContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  videoFrame: {
    width: "90%",
    height: "60%",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  videoPlaceholder: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "700",
    marginBottom: 10,
  },
  videoSubtext: {
    fontSize: 14,
    color: "#999",
  },
  videoEndBtn: {
    backgroundColor: "#e23b3b",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  videoEndText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
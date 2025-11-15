import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  BackHandler,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";

export default function MedicalNotesModal() {
  const router = useRouter();
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [followUp, setFollowUp] = useState("");

  useEffect(() => {
    const onBackPress = () => {
      router.back();
      return true;
    };
    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, [router]);

  const handleSave = () => {
    console.log("Save medical notes (mock):", { diagnosis, treatment, followUp });
    Alert.alert("Saved", "Medical notes saved to history (mock).");
    router.back();
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => router.back()} />

      <View style={styles.card}>
        <ScrollView>
          <Text style={styles.title}>Medical Notes</Text>

          <Text style={styles.label}>Diagnosis</Text>
          <TextInput value={diagnosis} onChangeText={setDiagnosis} style={[styles.input, { height: 80 }]} multiline />

          <Text style={styles.label}>Treatment Plan</Text>
          <TextInput value={treatment} onChangeText={setTreatment} style={[styles.input, { height: 100 }]} multiline />

          <Text style={styles.label}>Follow-up</Text>
          <TextInput value={followUp} onChangeText={setFollowUp} style={styles.input} />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleSave}>
              <Text style={styles.primaryBtnText}>Save to Medical History</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    zIndex: 1001,
    maxHeight: "80%",
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  label: { color: "#666", marginTop: 8 },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    paddingHorizontal: 10,
    backgroundColor: "#fafafa",
    marginTop: 6,
  },
  actions: { marginTop: 16, alignItems: "flex-end" },
  primaryBtn: { backgroundColor: "#0b6efd", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
});
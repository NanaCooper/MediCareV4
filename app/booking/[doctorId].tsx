import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  FlatList,
  TextInput,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

type Params = { doctorId?: string };

export default function BookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Params>();
  const doctorId = params.doctorId ?? "unknown";

  // Mock doctor
  const doctor = useMemo(() => ({ id: doctorId, name: "Dr. Nana Cooper", specialty: "General Practitioner" }), [doctorId]);

  const [date, setDate] = useState("2025-11-12");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  // Mock available slots
  const slots = ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM"];

  const handleConfirm = () => {
    if (!selectedSlot) {
      Alert.alert("Select time", "Please select a time slot before confirming.");
      return;
    }
    const payload = { doctorId, date, time: selectedSlot, notes };
    console.log("Confirm booking (mock):", payload);
    // open booking-confirmation modal
    router.push("/(modals)/booking-confirmation");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Book with {doctor.name}</Text>
        <Text style={styles.sub}>{doctor.specialty}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Date</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />

        <Text style={[styles.label, { marginTop: 12 }]}>Available Time Slots</Text>
        <FlatList
          data={slots}
          keyExtractor={(s) => s}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => {
            const selected = item === selectedSlot;
            return (
              <TouchableOpacity
                onPress={() => setSelectedSlot(item)}
                style={[styles.slot, selected && styles.slotSelected]}
              >
                <Text style={[styles.slotText, selected && { color: "#fff" }]}>{item}</Text>
              </TouchableOpacity>
            );
          }}
        />

        <Text style={[styles.label, { marginTop: 14 }]}>Notes (optional)</Text>
        <TextInput style={[styles.input, { height: 80 }]} value={notes} onChangeText={setNotes} multiline />

        <View style={styles.actions}>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Confirm Booking</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "700" },
  sub: { color: "#666", marginTop: 4 },

  form: { marginTop: 8 },
  label: { color: "#666", fontSize: 13 },
  input: { height: 44, borderWidth: 1, borderColor: "#eee", borderRadius: 8, paddingHorizontal: 10, marginTop: 6, backgroundColor: "#fafafa" },

  slot: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: "#eee", marginRight: 8, backgroundColor: "#fff" },
  slotSelected: { backgroundColor: "#0b6efd", borderColor: "#0b6efd" },
  slotText: { color: "#333", fontWeight: "600" },

  actions: { marginTop: 18, alignItems: "center" },
  confirmBtn: { backgroundColor: "#0b6efd", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  confirmText: { color: "#fff", fontWeight: "700" },
});
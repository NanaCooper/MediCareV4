import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";

type Doctor = {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  fee: string;
};

export default function Doctors() {
  const [query, setQuery] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState<string | null>(null);

  const doctors: Doctor[] = [
    { id: "d1", name: "Dr. Nana Cooper", specialization: "General Practitioner", rating: 4.8, fee: "$50" },
    { id: "d2", name: "Dr. Alex Riley", specialization: "Cardiologist", rating: 4.6, fee: "$80" },
    { id: "d3", name: "Dr. Sam Lee", specialization: "Dermatologist", rating: 4.4, fee: "$60" },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return doctors.filter((d) => {
      if (specializationFilter && d.specialization !== specializationFilter) return false;
      if (!q) return true;
      return d.name.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q);
    });
  }, [query, specializationFilter]);

  const specializations = Array.from(new Set(doctors.map((d) => d.specialization)));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TextInput
          placeholder="Search doctors or specializations"
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
        />

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, !specializationFilter && styles.filterChipActive]}
            onPress={() => setSpecializationFilter(null)}
          >
            <Text style={styles.filterText}>All</Text>
          </TouchableOpacity>
          {specializations.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.filterChip, specializationFilter === s && styles.filterChipActive]}
              onPress={() => setSpecializationFilter((prev) => (prev === s ? null : s))}
            >
              <Text style={styles.filterText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          style={{ width: "100%", marginTop: 12 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.specialization} • {item.rating}★</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.fee}>{item.fee}</Text>
                <TouchableOpacity style={styles.bookBtn}>
                  <Text style={styles.bookBtnText}>Book</Text>
                </TouchableOpacity>
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
  content: { flex: 1, padding: 16, alignItems: "center" },
  searchInput: {
    width: "100%",
    height: 44,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fafafa",
  },

  filterRow: { flexDirection: "row", marginTop: 12, flexWrap: "wrap" },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#eee",
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  filterChipActive: { backgroundColor: "#f0f6ff", borderColor: "#0b6efd" },
  filterText: { color: "#333" },

  card: {
    width: "100%",
    flexDirection: "row",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f2f2f2",
    marginBottom: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  name: { fontWeight: "700" },
  meta: { marginTop: 6, color: "#666" },
  fee: { fontWeight: "700", marginBottom: 8 },
  bookBtn: { backgroundColor: "#0b6efd", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  bookBtnText: { color: "#fff" },
});

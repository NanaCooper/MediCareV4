import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";

export default function SpecialtiesScreen() {
  const router = useRouter();
  const specialties = useMemo(() => ["General Practitioner", "Cardiologist", "Dermatologist", "Pediatrics"], []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Specialties</Text></View>

      <FlatList
        data={specialties}
        keyExtractor={(s) => s}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => router.push((`/patient/doctors?specialty=${encodeURIComponent(item)}`) as any)}>
            <Text style={styles.itemText}>{item}</Text>
            <Text style={styles.chev}>›</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { padding: 16, borderBottomWidth: 1, borderColor: "#eee" },
  title: { fontSize: 20, fontWeight: "700" },

  item: { padding: 12, backgroundColor: "#fafafa", borderRadius: 8, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemText: { fontWeight: "600" },
  chev: { color: "#999" },
});
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
} from "react-native";

type RecordItem = {
  id: string;
  date: string;
  title: string;
  summary: string;
  type: "lab" | "prescription" | "visit";
};

export default function MedicalRecords() {

  const records: RecordItem[] = [
    { id: "r1", date: "2025-11-02", title: "CBC Result", summary: "All values within normal range", type: "lab" },
    { id: "r2", date: "2025-10-20", title: "Prescription: Metformin", summary: "30 days supply", type: "prescription" },
    { id: "r3", date: "2025-09-15", title: "Visit: Follow-up", summary: "Blood pressure stable", type: "visit" },
  ];

  // Simple timeline grouping by date display
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <FlatList
          data={records}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={styles.recordRow}>
              <View style={styles.recordLeft}>
                <Text style={styles.recordDate}>{item.date}</Text>
              </View>
              <View style={styles.recordRight}>
                <Text style={styles.recordTitle}>{item.title}</Text>
                <Text style={styles.recordSummary}>{item.summary}</Text>
                <Text style={styles.recordType}>{item.type.toUpperCase()}</Text>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, padding: 16 },
  recordRow: { flexDirection: "row", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#f2f2f2", backgroundColor: "#fafafa" },
  recordLeft: { width: 100 },
  recordDate: { fontWeight: "700" },

  recordRight: { flex: 1 },
  recordTitle: { fontWeight: "700" },
  recordSummary: { color: "#666", marginTop: 6 },
  recordType: { marginTop: 8, color: "#0b6efd", fontWeight: "700" },
});

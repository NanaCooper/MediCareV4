import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

type Branch = {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
};

export default function Branches() {

  const branches: Branch[] = [
    { id: "b1", name: "MediCare Central", address: "123 Main St", phone: "+1 555-0101", hours: "Mon-Fri 08:00-17:00" },
    { id: "b2", name: "MediCare West", address: "45 West Ave", phone: "+1 555-0102", hours: "Mon-Sat 09:00-15:00" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <FlatList
          data={branches}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} activeOpacity={0.8}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.address}>{item.address}</Text>
              <Text style={styles.meta}>{item.phone} · {item.hours}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, padding: 16 },
  card: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#f2f2f2", marginBottom: 12, backgroundColor: "#fff" },
  name: { fontWeight: "700" },
  address: { color: "#666", marginTop: 6 },
  meta: { color: "#999", marginTop: 8 },
});

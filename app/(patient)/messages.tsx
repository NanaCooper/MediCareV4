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

type Conversation = {
  id: string;
  doctor: string;
  lastMessage: string;
  time: string;
  unread: number;
};

export default function PatientMessages() {
  const [query, setQuery] = useState("");

  const conversations: Conversation[] = [
    { id: "1", doctor: "Dr. Nana Cooper", lastMessage: "Please take your medication", time: "09:12", unread: 0 },
    { id: "2", doctor: "Dr. Alex Riley", lastMessage: "Let's reschedule", time: "Yesterday", unread: 1 },
    { id: "3", doctor: "Dr. Sam Lee", lastMessage: "Results look good", time: "Nov 5", unread: 0 },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) => c.doctor.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TextInput
          placeholder="Search conversations"
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
        />

        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          style={{ width: "100%", marginTop: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} activeOpacity={0.8}>
              <View style={styles.left}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.doctor.charAt(0)}</Text>
                </View>
              </View>

              <View style={styles.middle}>
                <Text style={styles.name}>{item.doctor}</Text>
                <Text style={styles.last}>{item.lastMessage}</Text>
              </View>

              <View style={styles.right}>
                <Text style={styles.time}>{item.time}</Text>
                {item.unread > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.unread}</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No conversations</Text></View>}
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

  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomColor: "#f4f4f4", borderBottomWidth: 1 },
  left: { width: 56, alignItems: "center" },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#f0f6ff", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#0b6efd", fontWeight: "700" },

  middle: { flex: 1, paddingHorizontal: 8 },
  name: { fontWeight: "700" },
  last: { color: "#666", marginTop: 4 },

  right: { width: 72, alignItems: "flex-end" },
  time: { color: "#999", fontSize: 12 },
  badge: { marginTop: 6, backgroundColor: "#e23b3b", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: "#fff", fontWeight: "700" },

  empty: { padding: 20, alignItems: "center" },
  emptyText: { color: "#999" },
});

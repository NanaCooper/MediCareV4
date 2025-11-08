import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";

type Conversation = {
  id: string;
  patient: string;
  lastMessage: string;
  time: string;
  unread: number;
};

export default function DoctorMessages() {
  const [query, setQuery] = useState("");

  // Mock conversations
  const conversations: Conversation[] = [
    {
      id: "1",
      patient: "Nana Cooper",
      lastMessage: "Thanks doc — prescription received.",
      time: "09:12",
      unread: 0,
    },
    {
      id: "2",
      patient: "Alex Riley",
      lastMessage: "Can we reschedule tomorrow?",
      time: "Yesterday",
      unread: 2,
    },
    {
      id: "3",
      patient: "Sam Lee",
      lastMessage: "Need advice on side effects.",
      time: "Nov 5",
      unread: 1,
    },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.patient.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.searchRow}>
          <TextInput
            placeholder="Search conversations"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          style={{ width: "100%", marginTop: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.convRow} activeOpacity={0.75}>
              <View style={styles.convLeft}>
                <View style={styles.convAvatar}>
                  <Text style={styles.convAvatarText}>
                    {item.patient.charAt(0)}
                  </Text>
                </View>
              </View>

              <View style={styles.convMiddle}>
                <Text style={styles.patientName}>{item.patient}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.lastMessage}
                </Text>
              </View>

              <View style={styles.convRight}>
                <Text style={styles.timeText}>{item.time}</Text>
                {item.unread > 0 ? (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread}</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No conversations found</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, padding: 16, alignItems: "center" },
  searchRow: { width: "100%" },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fafafa",
  },

  convRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  convLeft: { width: 56, alignItems: "center" },
  convAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  convAvatarText: { color: "#0b6efd", fontWeight: "700" },

  convMiddle: { flex: 1, paddingHorizontal: 8 },
  patientName: { fontWeight: "700" },
  lastMessage: { color: "#666", marginTop: 4 },

  convRight: { width: 72, alignItems: "flex-end" },
  timeText: { color: "#999", fontSize: 12 },
  unreadBadge: {
    marginTop: 6,
    backgroundColor: "#e23b3b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: "center",
  },
  unreadText: { color: "#fff", fontWeight: "700" },

  empty: { padding: 20, alignItems: "center" },
  emptyText: { color: "#999" },
});

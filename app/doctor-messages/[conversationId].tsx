import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import DoctorDropdown from "../../components/DoctorDropdown";

type Params = { conversationId?: string };

export default function DoctorConversation() {
  const router = useRouter();
  const params = useLocalSearchParams<Params>();
  const conversationId = params.conversationId ?? "unknown";

  const [menuVisible, setMenuVisible] = useState(false);
  const [messages, setMessages] = useState([
    { id: "m1", from: "patient", text: "Hello doctor.", time: "09:00" },
    { id: "m2", from: "doctor", text: "Hi — how can I help?", time: "09:02" },
  ]);
  const [text, setText] = useState("");

  const menuItems = [
    { label: "Prescription", route: "/(modals)/prescription", icon: "💊" },
    { label: "Medical Notes", route: "/(modals)/medical-notes", icon: "📝" },
    { label: "Back to Messages", route: "/doctor/messages", icon: "💬" },
  ];

  const send = () => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { id: `${Date.now()}`, from: "doctor", text: text.trim(), time: "Now" }]);
    setText("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuVisible((v) => !v)} style={styles.hamburger}>
          <Text style={styles.hamburgerIcon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Conversation: {conversationId}</Text>

        <View style={styles.profilePlaceholder} />
      </View>

      <DoctorDropdown visible={menuVisible} onClose={() => setMenuVisible(false)} items={menuItems} offsetY={Platform.OS === "ios" ? 88 : 72} />

      <FlatList
        style={{ flex: 1, padding: 12 }}
        data={messages}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.from === "doctor" ? styles.bubbleRight : styles.bubbleLeft]}>
            <Text style={{ color: item.from === "doctor" ? "#fff" : "#111" }}>{item.text}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        )}
        inverted={false}
      />

      <View style={styles.inputRow}>
        <TextInput value={text} onChangeText={setText} placeholder="Type a message" style={styles.input} />
        <TouchableOpacity style={styles.sendBtn} onPress={send}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.attachBtn} onPress={() => router.push("/(modals)/file-picker")}>
          <Text style={{ fontSize: 18 }}>📎</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 72,
    paddingTop: Platform.OS === "ios" ? 24 : 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  hamburger: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  hamburgerIcon: { fontSize: 22 },
  title: { fontSize: 16, fontWeight: "700" },
  profilePlaceholder: { width: 36 },

  bubble: { padding: 10, borderRadius: 10, marginVertical: 6, maxWidth: "75%" },
  bubbleLeft: { backgroundColor: "#f1f1f1", alignSelf: "flex-start" },
  bubbleRight: { backgroundColor: "#0b6efd", alignSelf: "flex-end" },
  time: { fontSize: 10, color: "#666", marginTop: 6 },

  inputRow: { flexDirection: "row", padding: 10, borderTopWidth: 1, borderColor: "#eee", alignItems: "center" },
  input: { flex: 1, height: 44, borderRadius: 8, borderWidth: 1, borderColor: "#eee", paddingHorizontal: 10, backgroundColor: "#fafafa" },
  sendBtn: { marginLeft: 8, backgroundColor: "#0b6efd", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  sendText: { color: "#fff", fontWeight: "700" },
  attachBtn: { marginLeft: 8, padding: 8 },
});
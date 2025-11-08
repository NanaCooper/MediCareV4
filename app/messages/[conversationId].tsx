import React, { useState } from "react";
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
import { useLocalSearchParams } from "expo-router";
import DropdownMenu from "../../components/DropdownMenu";

type Params = { conversationId?: string };

export default function PatientConversation() {
  const params = useLocalSearchParams<Params>();
  const conversationId = params.conversationId ?? "unknown";
  const [menuVisible, setMenuVisible] = useState(false);
  const [messages, setMessages] = useState([
    { id: "m1", from: "doctor", text: "Please take your meds.", time: "09:00" },
    { id: "m2", from: "patient", text: "Thanks doctor.", time: "09:05" },
  ]);
  const [text, setText] = useState("");

  const menuItems = [
    { label: "Attach file", route: "/(modals)/file-picker", icon: "📎" },
    { label: "Branch info", route: "/(modals)/branch-info", icon: "📍" },
  ];

  const send = () => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { id: `${Date.now()}`, from: "patient", text: text.trim(), time: "Now" }]);
    setText("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuVisible((v) => !v)} style={styles.hamburger}>
          <Text style={styles.hamburgerIcon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Chat — {conversationId}</Text>

        <View style={{ width: 36 }} />
      </View>

      <DropdownMenu visible={menuVisible} onClose={() => setMenuVisible(false)} items={menuItems} offsetY={Platform.OS === "ios" ? 84 : 72} />

      <FlatList
        data={messages}
        keyExtractor={(i) => i.id}
        style={{ flex: 1, padding: 12 }}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.from === "patient" ? styles.bubbleRight : styles.bubbleLeft]}>
            <Text style={{ color: item.from === "patient" ? "#fff" : "#111" }}>{item.text}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput value={text} onChangeText={setText} placeholder="Type a message" style={styles.input} />
        <TouchableOpacity style={styles.sendBtn} onPress={send}>
          <Text style={styles.sendText}>Send</Text>
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

  bubble: { padding: 10, borderRadius: 10, marginVertical: 6, maxWidth: "75%" },
  bubbleLeft: { backgroundColor: "#f1f1f1", alignSelf: "flex-start" },
  bubbleRight: { backgroundColor: "#0b6efd", alignSelf: "flex-end" },
  time: { fontSize: 10, color: "#666", marginTop: 6 },

  inputRow: { flexDirection: "row", padding: 10, borderTopWidth: 1, borderColor: "#eee", alignItems: "center" },
  input: { flex: 1, height: 44, borderRadius: 8, borderWidth: 1, borderColor: "#eee", paddingHorizontal: 10, backgroundColor: "#fafafa" },
  sendBtn: { marginLeft: 8, backgroundColor: "#0b6efd", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  sendText: { color: "#fff", fontWeight: "700" },
});
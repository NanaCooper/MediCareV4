import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";

// Mock conversations for doctor with patients
const MOCK_DOCTOR_CONVERSATIONS = [
  {
    id: "conv-doc-1",
    patientId: "mock-user-patient",
    patientName: "James Wilson",
    lastMessage: "Can I reschedule my appointment?",
    lastMessageTime: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: "conv-doc-2",
    patientId: "patient-2",
    patientName: "Lisa Anderson",
    lastMessage: "Thank you for the prescription",
    lastMessageTime: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: "conv-doc-3",
    patientId: "patient-3",
    patientName: "Robert Martinez",
    lastMessage: "I have a question about my medication",
    lastMessageTime: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: "conv-doc-4",
    patientId: "patient-4",
    patientName: "Sarah Thompson",
    lastMessage: "Feeling much better, thanks!",
    lastMessageTime: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    unreadCount: 0,
    isOnline: false,
  },
];

// Quick response templates for doctors
const QUICK_RESPONSES = [
  { id: "1", text: "I'll review your results and follow up shortly." },
  { id: "2", text: "Please schedule a follow-up appointment with my secretary." },
  { id: "3", text: "Make sure to take the medication as prescribed." },
  { id: "4", text: "If symptoms persist, please visit the clinic." },
  { id: "5", text: "Your prescription is ready at the pharmacy." },
  { id: "6", text: "Let me know if you have any other concerns." },
];

function formatTime(isoString: string) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function DoctorMessages() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedTemplateConvId, setSelectedTemplateConvId] = useState<string | null>(null);

  const filteredConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_DOCTOR_CONVERSATIONS;
    return MOCK_DOCTOR_CONVERSATIONS.filter((c) =>
      c.patientName.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSendQuickResponse = (template: typeof QUICK_RESPONSES[0]) => {
    // In a real app, send the message and update conversation
    alert(`Sent: "${template.text}"`);
    setSelectedTemplateConvId(null);
  };

  const renderConversation = ({ item }: any) => (
    <TouchableOpacity
      style={styles.conversationRow}
      onPress={() => router.push(`/doctor-messages/${item.id}`)}
    >
      <View style={styles.conversationLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.patientName.charAt(0)}</Text>
        </View>
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.conversationMiddle}>
        <View style={styles.nameRow}>
          <Text style={styles.patientName}>{item.patientName}</Text>
          {item.isOnline && <Text style={styles.onlineText}>●</Text>}
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      <View style={styles.conversationRight}>
        <Text style={styles.timeText}>{formatTime(item.lastMessageTime)}</Text>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderQuickTemplate = ({ item }: any) => (
    <TouchableOpacity
      style={styles.templateButton}
      onPress={() => handleSendQuickResponse(item)}
    >
      <Text style={styles.templateText}>{item.text}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search patients"
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholderTextColor="#999"
        />
      </View>

      {filteredConversations.length > 0 ? (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversation}
          style={styles.list}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {query ? "No conversations found" : "No conversations yet"}
          </Text>
        </View>
      )}

      {/* Quick Response Templates Modal */}
      <Modal
        visible={selectedTemplateConvId !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTemplateConvId(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Quick Responses</Text>
            <TouchableOpacity
              onPress={() => setSelectedTemplateConvId(null)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={QUICK_RESPONSES}
            keyExtractor={(item) => item.id}
            renderItem={renderQuickTemplate}
            contentContainerStyle={styles.templateList}
          />
        </SafeAreaView>
      </Modal>

      {/* Floating Action Button for Quick Response */}
      {selectedTemplateConvId === null && filteredConversations.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() =>
            setSelectedTemplateConvId(filteredConversations[0]?.id || "")
          }
        >
          <Text style={styles.fabText}>⚡</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#0f1724" },

  searchRow: { paddingHorizontal: 16, paddingVertical: 12 },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fafafa",
    color: "#0f1724",
  },

  list: { flex: 1 },
  conversationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f4",
  },
  conversationLeft: { width: 56, alignItems: "center", position: "relative" },
  conversationMiddle: { flex: 1, marginHorizontal: 12 },
  conversationRight: { width: 72, alignItems: "flex-end" },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10b981",
    borderWidth: 2,
    borderColor: "#fff",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  onlineText: {
    fontSize: 10,
    color: "#10b981",
    marginLeft: 6,
  },
  avatarText: { color: "#0b6efd", fontWeight: "700", fontSize: 16 },

  patientName: { fontWeight: "700", fontSize: 14, color: "#0f1724" },
  lastMessage: { color: "#666", marginTop: 4, fontSize: 13 },
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
  unreadText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: { color: "#999", fontSize: 16 },

  // Quick Response Styles
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0b6efd",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  fabText: { fontSize: 24 },

  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#0f1724" },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: { fontSize: 24, color: "#999" },

  templateList: { padding: 16 },
  templateButton: {
    backgroundColor: "#f0f6ff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#0b6efd",
  },
  templateText: {
    fontSize: 14,
    color: "#0f1724",
    lineHeight: 20,
  },
});

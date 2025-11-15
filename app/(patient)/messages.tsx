import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";

// Mock conversations for demo (patient with doctors)
const MOCK_CONVERSATIONS = [
  {
    id: 'conv-1',
    doctorId: 'mock-user-doctor',
    doctorName: 'Dr. John Smith',
    lastMessage: 'Your appointment is confirmed for tomorrow at 2 PM',
    lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: 'conv-2',
    doctorId: 'doc-2',
    doctorName: 'Dr. Sarah Johnson',
    lastMessage: 'Please send your recent lab results',
    lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: 'conv-3',
    doctorId: 'doc-3',
    doctorName: 'Dr. Michael Chen',
    lastMessage: 'Your prescription is ready for pickup',
    lastMessageTime: new Date(Date.now() - 172800000).toISOString(),
    unreadCount: 1,
    isOnline: true,
  },
];

// Mock doctors for "Start New Conversation"
const MOCK_DOCTORS = [
  { id: 'mock-user-doctor', name: 'Dr. John Smith', specialty: 'General Practitioner' },
  { id: 'doc-2', name: 'Dr. Sarah Johnson', specialty: 'Cardiologist' },
  { id: 'doc-3', name: 'Dr. Michael Chen', specialty: 'Neurologist' },
  { id: 'doc-4', name: 'Dr. Emily Williams', specialty: 'Dermatologist' },
];

function formatTime(isoString: string) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function PatientMessages() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showNewConversation, setShowNewConversation] = useState(false);

  const filteredConversations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_CONVERSATIONS;
    return MOCK_CONVERSATIONS.filter((c) => c.doctorName.toLowerCase().includes(q));
  }, [query]);

  const availableDoctors = useMemo(() => {
    const existingDoctorIds = new Set(MOCK_CONVERSATIONS.map((c) => c.doctorId));
    return MOCK_DOCTORS.filter((d) => !existingDoctorIds.has(d.id));
  }, []);

  // Calculate total unread count
  const totalUnread = useMemo(() => {
    return MOCK_CONVERSATIONS.reduce((sum, c) => sum + c.unreadCount, 0);
  }, []);

  const handleStartConversation = (doctor: any) => {
    // In a real app, create conversation and navigate
    // For now, just show a toast or navigate with params
    alert(`Starting conversation with ${doctor.name}`);
    setShowNewConversation(false);
  };

  const renderConversation = ({ item }: any) => (
    <TouchableOpacity
      style={styles.conversationRow}
      onPress={() => router.push(`/messages/${item.id}`)}
    >
      <View style={styles.conversationLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.doctorName.charAt(0)}</Text>
        </View>
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.conversationMiddle}>
        <View style={styles.nameRow}>
          <Text style={styles.doctorName}>{item.doctorName}</Text>
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

  const renderDoctor = ({ item }: any) => (
    <TouchableOpacity
      style={styles.doctorOption}
      onPress={() => handleStartConversation(item)}
    >
      <View style={styles.doctorAvatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>{item.name}</Text>
        <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Messages</Text>
          {totalUnread > 0 && (
            <Text style={styles.unreadInfo}>{totalUnread} unread message{totalUnread !== 1 ? 's' : ''}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => setShowNewConversation(!showNewConversation)}
        >
          <Text style={styles.newButtonText}>{showNewConversation ? '✕' : '+'}</Text>
        </TouchableOpacity>
      </View>

      {showNewConversation ? (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Start New Conversation</Text>
          {availableDoctors.length > 0 ? (
            <FlatList
              data={availableDoctors}
              keyExtractor={(item) => item.id}
              renderItem={renderDoctor}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noDataText}>No available doctors</Text>
          )}
        </View>
      ) : (
        <>
          <View style={styles.searchRow}>
            <TextInput
              placeholder="Search conversations"
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
                {query ? 'No conversations found' : 'No conversations yet'}
              </Text>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#0f1724" },
  unreadInfo: { fontSize: 12, color: "#e23b3b", marginTop: 2, fontWeight: "600" },
  newButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0b6efd",
    alignItems: "center",
    justifyContent: "center",
  },
  newButtonText: { fontSize: 20, color: "#fff", fontWeight: "700" },

  content: { flex: 1, padding: 16 },
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
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e3f2fd",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#0b6efd", fontWeight: "700", fontSize: 16 },

  doctorName: { fontWeight: "700", fontSize: 14, color: "#0f1724" },
  doctorSpecialty: { fontSize: 12, color: "#666", marginTop: 4 },
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

  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  emptyText: { color: "#999", fontSize: 16 },

  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12, color: "#0f1724" },
  noDataText: { color: "#999", textAlign: "center", marginTop: 20 },

  doctorOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
  },
  doctorInfo: { flex: 1 },
});

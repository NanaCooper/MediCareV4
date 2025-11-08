import React, { useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  FlatList,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

type PickedFile = {
  id: string;
  name: string;
  uri?: string;
  type: "image" | "pdf";
  progress?: number;
};

export default function FilePickerModal() {
  const router = useRouter();
  const [files, setFiles] = useState<PickedFile[]>([]);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Mock pick functions (replace with expo-image-picker / document-picker)
  const mockPick = (kind: PickedFile["type"]) => {
    const newFile: PickedFile = {
      id: Math.random().toString(36).slice(2),
      name: kind === "image" ? "photo.jpg" : "document.pdf",
      uri: kind === "image" ? "https://via.placeholder.com/100" : undefined,
      type: kind,
      progress: 0,
    };
    setFiles((s) => [newFile, ...s]);
    simulateUpload(newFile.id);
  };

  const simulateUpload = (id: string) => {
    let p = 0;
    const interval = setInterval(() => {
      p += 0.15;
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, progress: Math.min(1, p) } : f)));
      Animated.timing(progressAnim, {
        toValue: Math.min(1, p),
        duration: 150,
        useNativeDriver: false,
      }).start();

      if (p >= 1) clearInterval(interval);
    }, 300);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpload = () => {
    console.log("Files to upload (mock):", files);
    Alert.alert("Upload", "Files uploaded (mock).");
    router.back();
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => router.back()} />

      <View style={styles.card}>
        <Text style={styles.title}>Attach Files</Text>

        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => mockPick("image")}>
            <Text style={styles.actionText}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => mockPick("image")}>
            <Text style={styles.actionText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => mockPick("pdf")}>
            <Text style={styles.actionText}>Documents</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={files}
          keyExtractor={(i) => i.id}
          style={{ marginTop: 12, maxHeight: 220 }}
          renderItem={({ item }) => (
            <View style={styles.fileRow}>
              <View style={styles.fileLeft}>
                {item.type === "image" && item.uri ? (
                  <Image source={{ uri: item.uri }} style={styles.thumb} />
                ) : (
                  <View style={styles.fileIcon}>
                    <Text style={{ color: "#fff" }}>{item.type === "pdf" ? "PDF" : "FILE"}</Text>
                  </View>
                )}
              </View>

              <View style={styles.fileMiddle}>
                <Text style={styles.filename}>{item.name}</Text>
                <View style={styles.progressBar}>
                  <Animated.View style={[styles.progressFill, { width: `${(item.progress ?? 0) * 100}%` }]} />
                </View>
              </View>

              <View style={styles.fileRight}>
                <TouchableOpacity onPress={() => removeFile(item.id)}>
                  <Text style={{ color: "#d83b3b" }}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: "#999", marginTop: 8 }}>No files selected</Text>}
        />

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleUpload}>
            <Text style={styles.primaryBtnText}>Upload</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    zIndex: 1001,
  },
  title: { fontSize: 18, fontWeight: "700" },
  buttonsRow: { flexDirection: "row", marginTop: 12, justifyContent: "space-between" },
  actionBtn: { padding: 10, backgroundColor: "#f5f7ff", borderRadius: 8, minWidth: 90, alignItems: "center" },
  actionText: { color: "#0b6efd", fontWeight: "700" },

  fileRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  fileLeft: { width: 56, alignItems: "center" },
  thumb: { width: 48, height: 48, borderRadius: 6 },
  fileIcon: { width: 48, height: 48, borderRadius: 6, backgroundColor: "#0b6efd", alignItems: "center", justifyContent: "center" },

  fileMiddle: { flex: 1, paddingHorizontal: 12 },
  filename: { fontWeight: "700" },
  progressBar: { height: 8, backgroundColor: "#f1f1f1", borderRadius: 6, marginTop: 8, overflow: "hidden" },
  progressFill: { height: 8, backgroundColor: "#0b6efd", borderRadius: 6 },

  fileRight: { width: 70, alignItems: "center" },

  actions: { marginTop: 16, alignItems: "flex-end" },
  primaryBtn: { backgroundColor: "#0b6efd", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
});
import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Fonts } from "../../constants/theme";
import { ChatMessage } from "./ChatScreen";

interface ActionMenuProps {
  visible: boolean;
  selectedMessage: ChatMessage | null;
  onClose: () => void;
  onCopy: () => void;
  onReply: () => void;
  onForward: () => void;
  onDelete: () => void;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  visible,
  selectedMessage,
  onClose,
  onCopy,
  onReply,
  onForward,
  onDelete,
}) => {
  return (
    <Modal
      visible={visible && !!selectedMessage}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        onPress={onClose}
        activeOpacity={1}
      >
        <View style={styles.container}>
          <View style={styles.handle} />
          <Text style={styles.title}>Message Actions</Text>

          {/* Copy Action */}
          <TouchableOpacity style={styles.item} onPress={onCopy}>
            <Text style={styles.icon}>📋</Text>
            <View style={styles.content}>
              <Text style={styles.label}>Copy</Text>
              <Text style={styles.description}>Copy message text</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          {/* Reply Action */}
          <TouchableOpacity style={styles.item} onPress={onReply}>
            <Text style={styles.icon}>↩️</Text>
            <View style={styles.content}>
              <Text style={styles.label}>Reply</Text>
              <Text style={styles.description}>Quote this message</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          {/* Forward Action */}
          <TouchableOpacity style={styles.item} onPress={onForward}>
            <Text style={styles.icon}>➡️</Text>
            <View style={styles.content}>
              <Text style={styles.label}>Forward</Text>
              <Text style={styles.description}>Send to another chat</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          {/* Delete Action (only for own messages) */}
          {selectedMessage?.isOwn && (
            <TouchableOpacity
              style={[styles.item, styles.itemDanger]}
              onPress={onDelete}
            >
              <Text style={styles.icon}>🗑️</Text>
              <View style={styles.content}>
                <Text style={[styles.label, styles.labelDanger]}>Delete</Text>
                <Text style={styles.description}>Remove this message</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          )}

          {/* Cancel Action */}
          <TouchableOpacity style={[styles.item, styles.cancel]} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  container: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f1724",
    marginBottom: 16,
    textAlign: "center",
    fontFamily: Fonts.interBold,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#f8f9fa",
  },
  itemDanger: {
    backgroundColor: "#fef2f2",
  },
  icon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f1724",
    marginBottom: 2,
  },
  labelDanger: {
    color: "#dc2626",
  },
  description: {
    fontSize: 12,
    color: "#999",
  },
  arrow: {
    fontSize: 18,
    color: "#ccc",
  },
  cancel: {
    borderBottomWidth: 0,
    marginTop: 8,
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: "transparent",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
});

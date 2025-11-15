import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Fonts } from "../../constants/theme";

interface MedicalReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSend: (reportType: string, reportTitle: string, date: string, summary?: string) => void;
}

export const MedicalReportModal: React.FC<MedicalReportModalProps> = ({
  visible,
  onClose,
  onSend,
}) => {
  const [reportType, setReportType] = useState("Lab Result");
  const [reportTitle, setReportTitle] = useState("");
  const [date, setDate] = useState("");
  const [summary, setSummary] = useState("");

  const handleSend = () => {
    onSend(reportType, reportTitle, date, summary);
    setReportType("Lab Result");
    setReportTitle("");
    setDate("");
    setSummary("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        onPress={onClose}
        activeOpacity={1}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Share Medical Report</Text>
          <Text style={styles.description}>Share a medical report or test result</Text>
          <ScrollView style={styles.form}>
            <Text style={styles.label}>Report Type</Text>
            <View style={styles.reportTypeButtons}>
              {["Lab Result", "Imaging", "Diagnosis"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.reportTypeButton,
                    reportType === type && styles.reportTypeButtonSelected,
                  ]}
                  onPress={() => setReportType(type)}
                >
                  <Text
                    style={[
                      styles.reportTypeText,
                      reportType === type && styles.reportTypeTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Report Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Blood Test Results"
              placeholderTextColor="#999"
              value={reportTitle}
              onChangeText={setReportTitle}
            />
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              placeholder="2025-11-14"
              placeholderTextColor="#999"
              value={date}
              onChangeText={setDate}
            />
            <Text style={styles.label}>Summary (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Add notes about this report..."
              placeholderTextColor="#999"
              value={summary}
              onChangeText={setSummary}
              multiline
            />
          </ScrollView>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={onClose}
            >
              <Text style={styles.buttonSecondaryText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleSend}
            >
              <Text style={styles.buttonText}>Share Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 32,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f1724",
    paddingHorizontal: 20,
    marginBottom: 6,
    fontFamily: Fonts.interBold,
  },
  description: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 20,
    marginBottom: 18,
    fontWeight: "500",
    lineHeight: 20,
  },
  form: {
    maxHeight: 280,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f1724",
    marginBottom: 8,
    letterSpacing: 0.3,
    fontFamily: Fonts.interSemiBold,
  },
  reportTypeButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  reportTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: "#e8ecf1",
    borderRadius: 10,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
  },
  reportTypeButtonSelected: {
    backgroundColor: "#0b6efd",
    borderColor: "#0b6efd",
  },
  reportTypeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f1724",
  },
  reportTypeTextSelected: {
    color: "#fff",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e8ecf1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    backgroundColor: "#f8f9fa",
    color: "#0f1724",
    fontWeight: "500",
    marginBottom: 16,
  },
  textarea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: "#e8ecf1",
  },
  button: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    backgroundColor: "#0b6efd",
    shadowColor: "#0b6efd",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonSecondary: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1.5,
    borderColor: "#e8ecf1",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  buttonSecondaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f1724",
    letterSpacing: 0.3,
  },
});

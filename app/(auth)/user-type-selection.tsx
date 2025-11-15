import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";

// A more professional color palette
const BG_COLOR = "#f7f9fc";
const PRIMARY_COLOR = "#0b6efd"; // A modern, accessible blue
const CARD_BG = "#ffffff";
const TEXT_COLOR = "#1d2b3e";
const MUTED_TEXT = "#6a788e";
const BORDER_COLOR = "#e1e6f0";

export default function UserTypeSelection() {
  const router = useRouter();
  const { setUserType } = useAuth();
  const [selection, setSelection] = useState<"patient" | "doctor" | null>(null);

  const handleContinue = () => {
    if (!selection) return;

    // Persist user type
    setUserType(selection);

    // Navigate to the appropriate dashboard
    if (selection === "patient") {
      router.replace("/(patient)/" as any);
    } else {
      router.replace("/(doctor)/" as any);
    }
  };

  const SelectionCard = ({
    type,
    title,
    description,
    iconName,
  }: {
    type: "patient" | "doctor";
    title: string;
    description: string;
    iconName: React.ComponentProps<typeof Feather>["name"];
  }) => {
    const isSelected = selection === type;
    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => setSelection(type)}
        activeOpacity={0.8}
      >
        <Feather
          name={iconName}
          size={28}
          color={isSelected ? PRIMARY_COLOR : TEXT_COLOR}
          style={styles.cardIcon}
        />
        <View style={styles.cardTextContainer}>
          <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
            {title}
          </Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
        <View style={[styles.radioCircle, isSelected && { borderColor: PRIMARY_COLOR }]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BG_COLOR} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Feather name="activity" size={40} color={PRIMARY_COLOR} />
          <Text style={styles.title}>Select Your Role</Text>
          <Text style={styles.subtitle}>
            Choose your role to personalize your experience.
          </Text>
        </View>

        <View style={styles.selectionContainer}>
          <SelectionCard
            type="patient"
            title="I am a Patient"
            description="Book appointments and manage your health records."
            iconName="user"
          />
          <SelectionCard
            type="doctor"
            title="I am a Healthcare Provider"
            description="Manage your patients, schedule, and consultations."
            iconName="briefcase"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !selection && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!selection}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continue</Text>
          <Feather name="arrow-right" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: TEXT_COLOR,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: MUTED_TEXT,
    textAlign: "center",
  },
  selectionContainer: {},
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: BORDER_COLOR,
    marginBottom: 16,
    shadowColor: "#1d2b3e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardSelected: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: "#eaf4ff",
  },
  cardIcon: {
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: TEXT_COLOR,
  },
  cardTitleSelected: {
    color: PRIMARY_COLOR,
  },
  cardDescription: {
    fontSize: 14,
    color: MUTED_TEXT,
    marginTop: 4,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BORDER_COLOR,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PRIMARY_COLOR,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
  },
  button: {
    backgroundColor: PRIMARY_COLOR,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: "#a0cfff", // A lighter, disabled version of primary
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8
  },
});

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Keyboard,
  Platform,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";

/**
 * Patient Profile — premium feel
 * - Soft branded background, elevated card, rounded corners
 * - Avatar with "change photo" action (mock)
 * - Inline validation for email/phone
 * - Dirty detection: Save enabled only when changes exist & inputs valid
 * - Loading state for save + animated snackbar feedback
 * - Accessibility labels and improved spacing/typography
 */

const BG = "#f6f8ff";
const CARD = "#ffffff";
const PRIMARY = "#0b6efd";
const MUTED = "#6b7280";
const DANGER = "#d83b3b";
const SNACK_BG = "#0b6efd";

export default function PatientProfile(): JSX.Element {
  // initial/mock loaded profile
  const initial = useMemo(
    () => ({
      fullName: "Nana Cooper",
      email: "nana@example.com",
      phone: "+1 555-0100",
      preferences: "SMS reminders: On",
      avatarUri: "",
    }),
    []
  );

  const [fullName, setFullName] = useState(initial.fullName);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [preferences, setPreferences] = useState(initial.preferences);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(initial.avatarUri || undefined);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // snackbar animation
  const snackAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!savedMsg) return;
    Animated.timing(snackAnim, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const t = setTimeout(() => {
      Animated.timing(snackAnim, {
        toValue: 0,
        duration: 320,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => setSavedMsg(null));
    }, 2000);

    return () => clearTimeout(t);
  }, [savedMsg, snackAnim]);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const isValidPhone = (v: string) =>
    // basic check: digits and minimal length (allow +, spaces, hyphens)
    /^[+\d][\d\s\-().]{6,}$/.test(v.trim());

  const validationError = useMemo(() => {
    if (!fullName.trim()) return "Please enter your full name.";
    if (!email.trim() || !isValidEmail(email)) return "Please enter a valid email address.";
    if (!phone.trim() || !isValidPhone(phone)) return "Please enter a valid phone number.";
    if (preferences.trim().length === 0) return "Please set your contact preferences.";
    return null;
  }, [fullName, email, phone, preferences]);

  const dirty = useMemo(() => {
    return (
      fullName !== initial.fullName ||
      email !== initial.email ||
      phone !== initial.phone ||
      preferences !== initial.preferences ||
      (avatarUri || "") !== (initial.avatarUri || "")
    );
  }, [fullName, email, phone, preferences, avatarUri, initial]);

  const handleSave = async () => {
    setError(null);
    Keyboard.dismiss();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      // replace with API call
      await new Promise((res) => setTimeout(res, 900));

      // Mock: set saved message
      setSavedMsg("Profile updated");
    } catch (err) {
      console.error("Save profile error", err);
      setError("Unable to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhoto = async () => {
    // Hook point: integrate expo-image-picker or similar.
    // For demo, toggle a placeholder image URI to simulate change.
    setAvatarUri((prev) =>
      prev
        ? undefined
        : "https://placehold.co/300x300/png?text=Nana+Cooper"
    );
    setSavedMsg("Profile photo updated (mock)");
  };

  const snackTranslateY = snackAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });
  const snackOpacity = snackAnim;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                {avatarUri ? (
                  <Image style={styles.avatarImage} source={{ uri: avatarUri }} />
                ) : (
                  <Text style={styles.avatarInitial}>N</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.changePhotoBtn}
                onPress={handleChangePhoto}
                accessibilityRole="button"
                accessibilityLabel="Change profile photo"
              >
                <Feather name="camera" size={14} color={PRIMARY} />
                <Text style={styles.changePhotoText}>Change photo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.headerInfo}>
              <Text style={styles.name}>{fullName}</Text>
              <Text style={styles.muted}>Member since 2023 • MediCare</Text>
              <View style={styles.quickRow}>
                <TouchableOpacity
                  style={styles.iconAction}
                  accessibilityRole="button"
                  accessibilityLabel="Message support"
                >
                  <Feather name="message-circle" size={16} color={PRIMARY} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconAction, { marginLeft: 8 }]}
                  accessibilityRole="button"
                  accessibilityLabel="View settings"
                >
                  <Feather name="settings" size={16} color={MUTED} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.form}>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Text style={styles.label}>Full name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
              placeholder="Full name"
              returnKeyType="next"
              accessibilityLabel="Full name"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder="you@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              accessibilityLabel="Email"
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              placeholder="+1 555-0100"
              keyboardType={Platform.OS === "ios" ? "phone-pad" : "numeric"}
              returnKeyType="next"
              accessibilityLabel="Phone"
            />

            <Text style={styles.label}>Preferences</Text>
            <TextInput
              value={preferences}
              onChangeText={setPreferences}
              style={[styles.input, styles.textArea]}
              placeholder="Contact & notification preferences"
              multiline
              accessibilityLabel="Preferences"
            />

            <View style={styles.feeRow}>
              <Text style={styles.helperText}>Your contact info is private and secure.</Text>
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, (!dirty || !!validationError || loading) && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!dirty || !!validationError || loading}
              accessibilityRole="button"
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{dirty ? "Save changes" : "No changes"}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.snack,
          {
            transform: [{ translateY: snackTranslateY }],
            opacity: snackOpacity,
          },
        ]}
      >
        <View style={styles.snackInner}>
          <Feather name="check-circle" size={18} color="#fff" />
          <Text style={styles.snackText}>{savedMsg ?? "Saved"}</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 18,
    // subtle border + shadow
    borderWidth: 1,
    borderColor: "rgba(15,23,36,0.03)",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },

  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatarWrap: { width: 120, alignItems: "center", marginRight: 12 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 14,
    backgroundColor: "#eef6ff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 8,
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarInitial: { fontSize: 32, fontWeight: "900", color: PRIMARY },

  changePhotoBtn: { flexDirection: "row", alignItems: "center" },
  changePhotoText: { marginLeft: 8, color: PRIMARY, fontWeight: "700", fontSize: 13 },

  headerInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: "900", color: "#0f1724" },
  muted: { color: MUTED, marginTop: 6 },

  quickRow: { flexDirection: "row", marginTop: 12 },
  iconAction: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(15,23,36,0.03)",
  },

  form: { marginTop: 6 },

  label: { fontSize: 13, color: MUTED, marginBottom: 8 },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(15,23,36,0.04)",
    backgroundColor: "#fbfdff",
    paddingHorizontal: 12,
    color: "#0f1724",
    marginBottom: 12,
  },
  textArea: { height: 100, paddingTop: 10, textAlignVertical: "top" },

  feeRow: { marginTop: 6, marginBottom: 6 },
  helperText: { color: MUTED, fontSize: 13 },

  saveBtn: {
    marginTop: 12,
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },

  error: { color: DANGER, marginBottom: 8 },

  snack: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 34,
    backgroundColor: SNACK_BG,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  snackInner: { flexDirection: "row", alignItems: "center" },
  snackText: { color: "#fff", fontWeight: "700", marginLeft: 10 },
});
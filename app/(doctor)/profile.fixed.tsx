import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TextInput,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
  Keyboard,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from "@expo/vector-icons";

/**
 * Cleaned Doctor profile component (temporary fixed file)
 */

const BG = "#f6f8ff";
const CARD = "#ffffff";
const PRIMARY = "#0b6efd";
const MUTED = "#6b7280";
const DANGER = "#d83b3b";
const SNACK_BG = "#0b6efd";

export default function DoctorProfile(): React.ReactElement {
  const initialProfile = useMemo(
    () => ({
      name: "Dr. Nana Cooper",
      specialization: "General Practitioner",
      qualifications: "MBBS, MD (Family Medicine)",
      bio:
        "Passionate about patient-centered care, preventive medicine and continuity of care.",
      fee: "50",
      avatarUri: "",
    }),
    []
  );

  const [specialization, setSpecialization] = useState(initialProfile.specialization);
  const [qualifications, setQualifications] = useState(initialProfile.qualifications);
  const [bio, setBio] = useState(initialProfile.bio);
  const [fee, setFee] = useState(initialProfile.fee);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(initialProfile.avatarUri || undefined);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const snackAnim = useRef(new Animated.Value(0)).current;

  const dirty = useMemo(() => {
    return (
      specialization !== initialProfile.specialization ||
      qualifications !== initialProfile.qualifications ||
      bio !== initialProfile.bio ||
      fee !== initialProfile.fee ||
      (avatarUri || "") !== (initialProfile.avatarUri || "")
    );
  }, [specialization, qualifications, bio, fee, avatarUri, initialProfile]);

  useEffect(() => {
    if (!savedMsg) return;
    Animated.timing(snackAnim, {
      toValue: 1,
      duration: 250,
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
    }, 2200);

    return () => clearTimeout(t);
  }, [savedMsg, snackAnim]);

  const validate = (): string | null => {
    if (!specialization.trim()) return "Please enter your specialization.";
    if (!qualifications.trim()) return "Please list your qualifications.";
    const feeNum = Number(fee);
    if (!fee || Number.isNaN(feeNum) || feeNum <= 0) return "Please enter a valid consultation fee.";
    if (bio.length > 800) return "Bio is too long (max 800 characters).";
    return null;
  };

  const handleSave = async () => {
    setError(null);
    Keyboard.dismiss();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    try {
      setLoading(true);
      await new Promise((res) => setTimeout(res, 900));
      setSavedMsg("Profile updated");
    } catch (err) {
      console.error("Save error", err);
      setError("Unable to save profile. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhoto = async () => {
    try {
      const fakeUri = avatarUri ? undefined : "https://placehold.co/300x300/png?text=Dr+N";
      setAvatarUri(fakeUri);
      setSavedMsg("Profile photo updated (mock)");
    } catch (err) {
      console.error("Photo error", err);
      setError("Unable to update photo.");
    }
  };

  const snackTranslateY = snackAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.photoWrap}>
              <View style={styles.photo}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.photoImage} />
                ) : (
                  <Text style={styles.photoInitial}>{initialProfile.name.charAt(0)}</Text>
                )}
              </View>

              <TouchableOpacity style={styles.changePhoto} onPress={handleChangePhoto} accessibilityRole="button">
                <Feather name="camera" size={14} color={PRIMARY} />
                <Text style={styles.changePhotoText}>Change photo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoWrap}>
              <Text style={styles.name}>{initialProfile.name}</Text>
              <Text style={styles.spec}>{specialization}</Text>
              <Text style={styles.small}>{qualifications}</Text>
            </View>
          </View>

          <View style={styles.form}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Text style={styles.label}>Specialization</Text>
            <TextInput style={styles.input} value={specialization} onChangeText={setSpecialization} placeholder="e.g., Cardiology" />

            <Text style={styles.label}>Qualifications</Text>
            <TextInput style={styles.input} value={qualifications} onChangeText={setQualifications} placeholder="e.g., MBBS, MD" />

            <Text style={styles.label}>Bio <Text style={styles.mutedText}>({bio.length}/800)</Text></Text>
            <TextInput style={[styles.input, styles.textArea]} value={bio} onChangeText={setBio} placeholder="Short professional bio" multiline maxLength={800} />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Consultation fee (USD)</Text>
                <TextInput style={styles.input} value={fee} onChangeText={(t) => setFee(t.replace(/[^\d.]/g, ""))} keyboardType="numeric" placeholder="50" />
              </View>

              <View style={styles.feePreview}>
                <Text style={styles.label}>Preview</Text>
                <View style={styles.feeBox}>
                  <MaterialIcons name="attach-money" size={18} color={PRIMARY} />
                  <Text style={styles.feeText}>${fee || "0"}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={[styles.saveBtn, (!dirty || loading) && styles.saveBtnDisabled]} onPress={handleSave} disabled={!dirty || loading} accessibilityRole="button">
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{dirty ? "Save changes" : "No changes"}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Animated.View pointerEvents="none" style={[styles.snack, { transform: [{ translateY: snackTranslateY }], opacity: snackAnim }]}> 
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
  content: { padding: 20 },
  card: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  profileRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 24 },
  photoWrap: { alignItems: "center", marginRight: 24 },
  photo: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#e1e8f5", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  photoImage: { width: 80, height: 80, borderRadius: 40 },
  photoInitial: { fontSize: 28, fontWeight: "bold", color: PRIMARY },
  changePhoto: { flexDirection: "row", alignItems: "center", paddingVertical: 4, paddingHorizontal: 8, backgroundColor: "#e1f0ff", borderRadius: 8 },
  changePhotoText: { marginLeft: 6, fontSize: 12, fontWeight: "600", color: PRIMARY },
  infoWrap: { flex: 1, paddingTop: 8 },
  name: { fontSize: 18, fontWeight: "bold", color: "#1c274c", marginBottom: 4 },
  spec: { fontSize: 14, color: MUTED, marginBottom: 2 },
  small: { fontSize: 12, color: MUTED },
  form: {},
  label: { fontSize: 14, color: MUTED, marginBottom: 8, fontWeight: "500" },
  input: { backgroundColor: BG, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, marginBottom: 16 },
  textArea: { minHeight: 120, textAlignVertical: "top", paddingTop: 12 },
  mutedText: { color: "#a0a0a0", fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  feePreview: { marginLeft: 16, alignItems: "center" },
  feeBox: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: BG, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 20 },
  feeText: { fontSize: 16, fontWeight: "bold", color: PRIMARY },
  saveBtn: { backgroundColor: PRIMARY, borderRadius: 12, padding: 16, alignItems: "center", marginTop: 16 },
  saveBtnDisabled: { backgroundColor: "#a0cfff" },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  errorText: { color: DANGER, marginBottom: 12, textAlign: "center" },
  snack: { position: "absolute", bottom: Platform.OS === "ios" ? 40 : 20, left: 20, right: 20, zIndex: 10 },
  snackInner: { flexDirection: "row", alignItems: "center", backgroundColor: SNACK_BG, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  snackText: { color: "#fff", marginLeft: 10, fontWeight: "600" },
});

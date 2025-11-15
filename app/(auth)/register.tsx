import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";

const PRIMARY = "#0b6efd";
const BG = "#f6f8ff";

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, isLoading: authLoading } = useAuth(); // Destructure signUp and authLoading
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false); // Local loading state, combined with authLoading
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim().toLowerCase());

  const validate = () => {
    if (!fullName.trim()) return "Please enter your full name.";
    if (!email.trim()) return "Please enter your email address.";
    if (!isValidEmail(email)) return "Please enter a valid email address.";
    if (password.length < 8)
      return "Password must be at least 8 characters long.";
    if (password !== confirm) return "Passwords do not match.";
    if (!agreeTerms)
      return "You must agree to the Terms and Privacy Policy to continue.";
    return null;
  };

  const handleCreateAccount = async () => {
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true); // Start local loading indicator
    try {
      // Call Firebase signUp with a default role (e.g., 'patient')
      // The user-type-selection screen will allow them to change this if needed.
      await signUp(email.trim(), password, 'patient');

      // Firebase Auth state listener in useAuth will handle navigation after successful sign-up
      // We no longer manually navigate here, as useProtectedRoute in useAuth handles it.
    } catch (err: any) {
      console.error("Registration error:", err);
      // Firebase Auth errors often have 'auth/' prefix, can be parsed for better messages
      const errorMessage = err.message.includes('auth/') 
        ? err.message.split('auth/')[1].replace(/\([^)]+\)/g, '').replace(/-/g, ' ').trim() // Basic parsing
        : "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false); // Stop local loading indicator
    }
  };

  const overallLoading = loading || authLoading;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brand}>
            <Text style={styles.logo}>MediCare</Text>
            <Text style={styles.tagline}>Join a premium, secure health experience</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.heading}>Create your account</Text>
            <Text style={styles.subheading}>Get started in seconds — secure & HIPAA-ready</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={styles.input}
              placeholder="Jane Doe"
              value={fullName}
              onChangeText={setFullName}
              editable={!overallLoading}
              returnKeyType="next"
              accessibilityLabel="Full name"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!overallLoading}
              returnKeyType="next"
              accessibilityLabel="Email"
            />

            <View style={styles.rowLabel}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity onPress={() => setSecure((s) => !s)} disabled={overallLoading}>
                <Text style={styles.toggle}>{secure ? "Show" : "Hide"}</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Create a strong password"
              secureTextEntry={secure}
              value={password}
              onChangeText={setPassword}
              editable={!overallLoading}
              returnKeyType="next"
              accessibilityLabel="Password"
            />

            <Text style={styles.label}>Confirm password</Text>
            <TextInput
              style={styles.input}
              placeholder="Repeat your password"
              secureTextEntry={secure}
              value={confirm}
              onChangeText={setConfirm}
              editable={!overallLoading}
              returnKeyType="done"
              accessibilityLabel="Confirm password"
            />

            <View style={styles.termsRow}>
              <TouchableOpacity
                onPress={() => setAgreeTerms((v) => !v)}
                style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: agreeTerms }}
                disabled={overallLoading}
              >
                {agreeTerms ? <Text style={styles.checkMark}>✓</Text> : null}
              </TouchableOpacity>
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.link} onPress={() => router.push("/terms" as any)}>
                  Terms
                </Text>{" "}
                and{" "}
                <Text style={styles.link} onPress={() => router.push("/privacy" as any)}>
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, (!agreeTerms || overallLoading) && styles.primaryBtnDisabled]}
              onPress={handleCreateAccount}
              disabled={!agreeTerms || overallLoading}
              accessibilityRole="button"
            >
              {overallLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Create account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => router.replace("/login")}
              disabled={overallLoading}
            >
              <Text style={styles.secondaryBtnText}>Already have an account? Sign in</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By creating an account you agree to our terms. We securely handle your health data.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },

  brand: {
    alignItems: "center",
    marginBottom: 14,
  },
  logo: {
    fontSize: 28,
    fontWeight: "800",
    color: PRIMARY,
    letterSpacing: 0.6,
  },
  tagline: {
    marginTop: 6,
    color: "#5b6b8a",
    fontSize: 13,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  heading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
    color: "#0f1724",
  },
  subheading: {
    color: "#6b7280",
    marginBottom: 12,
    fontSize: 14,
  },

  error: {
    color: "#d83b3b",
    marginBottom: 8,
    fontSize: 13,
    textAlign: "center",
  },

  label: {
    fontSize: 13,
    color: "#8892a8",
    marginBottom: 6,
  },
  rowLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  toggle: {
    color: PRIMARY,
    fontWeight: "600",
  },

  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eef2ff",
    paddingHorizontal: 12,
    backgroundColor: "#fbfdff",
    color: "#0f1724",
    marginBottom: 12,
  },

  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#dbe7ff",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  checkMark: { color: "#fff", fontWeight: "700" },
  termsText: { flex: 1, color: "#6b7280", fontSize: 13 },
  link: { color: PRIMARY, fontWeight: "700" },

  primaryBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnDisabled: {
    backgroundColor: "#93b5ff",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#eef2ff",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#9aa7c7",
    fontSize: 12,
  },

  secondaryBtn: {
    borderWidth: 1,
    borderColor: "rgba(11,110,253,0.12)",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: PRIMARY,
    fontWeight: "700",
  },

  footer: {
    marginTop: 18,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  footerText: {
    color: "#9aa7c7",
    fontSize: 12,
    textAlign: "center",
  },
});

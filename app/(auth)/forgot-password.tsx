import React, { useState } from "react";
import {
  SafeAreaView,
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
} from "react-native";
import { useRouter } from "expo-router";

const PRIMARY = "#0b6efd";
const BG = "#f6f8ff";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());

  const handleSendReset = async () => {
    setError(null);

    if (!email) {
      setError("Please enter the email address associated with your account.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      // mock network delay
      await new Promise((res) => setTimeout(res, 900));

      // Mock sending reset link (replace with real API call)
      console.log("Send password reset link to:", email.trim());

      Alert.alert(
        "Reset Link Sent",
        `If ${email.trim()} is registered, you'll receive a reset link shortly.`,
        [
          {
            text: "Back to Sign In",
            onPress: () => router.replace("/login"),
          },
        ],
        { cancelable: true }
      );
    } catch (err) {
      console.error("Reset error:", err);
      setError("Unable to send reset link. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View style={styles.brand}>
            <Text style={styles.logo}>MediCare</Text>
            <Text style={styles.tagline}>Secure · Private · Trusted</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Forgot password</Text>
            <Text style={styles.subtitle}>
              Enter your email and we'll send a secure link to reset your password.
            </Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="you@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="username"
              value={email}
              onChangeText={(t) => setEmail(t)}
              editable={!loading}
              returnKeyType="send"
              onSubmitEditing={handleSendReset}
              accessibilityLabel="Email input"
            />

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                (!isValidEmail(email) || loading) && styles.primaryBtnDisabled,
              ]}
              onPress={handleSendReset}
              disabled={!isValidEmail(email) || loading}
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Send reset link</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryLink}
              onPress={() => router.replace("/login")}
            >
              <Text style={styles.secondaryText}>Back to Sign in</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              If you don't receive an email within a few minutes, check your spam folder or contact
              support.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },

  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },

  brand: {
    alignItems: "center",
    marginBottom: 18,
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
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 20,
    // iOS shadow
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    // Android elevation
    elevation: 6,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f1724",
    marginBottom: 6,
  },
  subtitle: {
    color: "#6b7280",
    marginBottom: 12,
    fontSize: 14,
  },

  error: {
    color: "#d83b3b",
    marginBottom: 8,
    fontSize: 13,
  },

  label: {
    fontSize: 13,
    color: "#8892a8",
    marginBottom: 6,
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
  inputError: {
    borderColor: "#ffd6d6",
  },

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

  secondaryLink: {
    marginTop: 12,
    alignItems: "center",
  },
  secondaryText: {
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
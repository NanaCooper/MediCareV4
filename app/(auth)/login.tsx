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
  Pressable,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isLoading: authLoading } = useAuth(); // Destructure signIn and authLoading

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false); // Local loading state
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleSignIn = async () => {
    setError(null);

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true); // Start local loading indicator
    try {
      await signIn(email.trim(), password);
      // Navigation is now handled by useProtectedRoute in useAuth.tsx
    } catch (err: any) {
      console.log("Sign in error:", err);
      // Firebase Auth errors often have 'auth/' prefix, can be parsed for better messages
      const errorMessage = err.message.includes('auth/') 
        ? err.message.split('auth/')[1].replace(/\([^)]+\)/g, '').replace(/-/g, ' ').trim() // Basic parsing
        : "Sign in failed. Please check your credentials and try again.";
      setError(errorMessage);
    } finally {
      setLoading(false); // Stop local loading indicator
    }
  };

  const overallLoading = loading || authLoading;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6f8ff" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View style={styles.brand}>
            <Text style={styles.logo}>MediCare</Text>
            <Text style={styles.tagline}>Modern, secure healthcare in your pocket</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.subheading}>Sign in to continue</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@company.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="username"
                value={email}
                onChangeText={(t) => setEmail(t)}
                returnKeyType="next"
                editable={!overallLoading}
                accessibilityLabel="Email input"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.inputLabel}>Password</Text>
                <Pressable onPress={() => setSecure((s) => !s)} disabled={overallLoading}>
                  <Text style={styles.toggle}>{secure ? "Show" : "Hide"}</Text>
                </Pressable>
              </View>

              <TextInput
                style={styles.input}
                placeholder="••••••••"
                secureTextEntry={secure}
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                value={password}
                onChangeText={(t) => setPassword(t)}
                returnKeyType="done"
                editable={!overallLoading}
                accessibilityLabel="Password input"
              />
            </View>

            <TouchableOpacity
              style={styles.forgotRow}
              onPress={() => router.push("/forgot-password")}
              accessibilityRole="button"
              disabled={overallLoading}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, (!email || !password || overallLoading) && styles.primaryBtnDisabled]}
              onPress={handleSignIn}
              disabled={!email || !password || overallLoading}
              accessibilityRole="button"
              accessibilityState={{ disabled: !email || !password || overallLoading }}
            >
              {overallLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Sign in</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => router.push("/register")}
              accessibilityRole="button"
              disabled={overallLoading}
            >
              <Text style={styles.secondaryBtnText}>Create an account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By signing in you agree to our{" "}
              <Text style={styles.link}>Terms</Text> and <Text style={styles.link}>Privacy Policy</Text>.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const PRIMARY = "#0b6efd";
const BACKGROUND = "#f6f8ff";
const CARD = "#ffffff";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BACKGROUND },
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
    backgroundColor: CARD,
    borderRadius: 16,
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
    marginBottom: 6,
    color: "#0f1724",
  },
  subheading: {
    color: "#6b7280",
    marginBottom: 14,
  },

  error: {
    color: "#d83b3b",
    marginBottom: 10,
    fontSize: 13,
    textAlign: "center",
  },

  inputRow: {
    marginBottom: 12,
  },
  inputLabel: {
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
  },
  passwordLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggle: {
    color: PRIMARY,
    fontWeight: "600",
  },

  forgotRow: {
    alignItems: "flex-end",
    marginBottom: 14,
  },
  forgotText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: "600",
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
    fontSize: 16,
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
  link: {
    color: PRIMARY,
    fontWeight: "700",
  },
});

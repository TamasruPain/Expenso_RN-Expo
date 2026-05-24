import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useOAuthGoogle } from "@/hooks/useOAuthGoogle";
import { useSignIn } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { onPress: onGooglePress } = useOAuthGoogle();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const { colors } = useAppTheme();

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(tabs)");
      } else if (signInAttempt.status === "needs_second_factor") {
        // Prepare the second factor — send email code
        await signIn.prepareSecondFactor({
          strategy: "email_code",
        });
        setNeeds2FA(true);
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
        Alert.alert("Error", "Unexpected sign-in status. Please try again.");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors?.[0]?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const onVerify2FA = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code: verificationCode,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
      } else {
        console.error(JSON.stringify(result, null, 2));
        Alert.alert("Error", "Verification failed. Please try again.");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert(
        "Error",
        err.errors?.[0]?.message || "Invalid verification code",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (needs2FA) {
              setNeeds2FA(false);
              setVerificationCode("");
            } else {
              router.back();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        {needs2FA ? (
          <>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                Verify Your Identity
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                We sent a verification code to your email. Please enter it
                below.
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Verification Code"
                placeholder="Enter 6-digit code"
                keyboardType="number-pad"
                autoCapitalize="none"
                value={verificationCode}
                onChangeText={setVerificationCode}
              />
            </View>

            <Button
              title="Verify & Sign In"
              onPress={onVerify2FA}
              loading={loading}
              style={styles.loginButton}
            />

            <TouchableOpacity
              style={styles.resendButton}
              onPress={async () => {
                try {
                  await signIn?.prepareSecondFactor({
                    strategy: "email_code",
                  });
                  Alert.alert(
                    "Code Sent",
                    "A new verification code has been sent to your email.",
                  );
                } catch (err: any) {
                  Alert.alert(
                    "Error",
                    err.errors?.[0]?.message || "Failed to resend code",
                  );
                }
              }}
            >
              <Text
                style={[styles.forgotPasswordText, { color: colors.primary }]}
              >
                Resend Code
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                Welcome Back!
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Sign in to continue tracking your expenses
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Email Address"
                placeholder="example@mail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={emailAddress}
                onChangeText={setEmailAddress}
              />
              <Input
                label="Password"
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => router.push("/(auth)/forgot-password")}
              >
                <Text
                  style={[styles.forgotPasswordText, { color: colors.primary }]}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Login"
              onPress={onSignInPress}
              loading={loading}
              style={styles.loginButton}
            />

            <View style={styles.dividerContainer}>
              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />
              <Text
                style={[styles.dividerText, { color: colors.textSecondary }]}
              >
                OR
              </Text>
              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />
            </View>

            <Button
              title="Continue with Google"
              variant="outline"
              onPress={onGooglePress}
              icon={
                <Ionicons name="logo-google" size={20} color={colors.text} />
              }
              style={styles.googleButton}
            />

            <View style={styles.footer}>
              <Text
                style={[styles.footerText, { color: colors.textSecondary }]}
              >
                Don&apos;t have an account?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => router.replace("/(auth)/register")}
              >
                <Text style={[styles.footerLink, { color: colors.primary }]}>
                  Register
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Theme.spacing.lg,
  },
  header: {
    marginBottom: Theme.spacing.xxl,
  },
  title: {
    fontSize: Theme.typography.size.h1 - 4,
    fontWeight: "700",
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    fontSize: Theme.typography.size.md,
    lineHeight: 22,
  },
  form: {
    marginBottom: Theme.spacing.lg,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: -Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  forgotPasswordText: {
    fontSize: Theme.typography.size.sm,
    fontWeight: "600",
  },
  resendButton: {
    alignSelf: "center",
    marginTop: Theme.spacing.md,
  },
  loginButton: {
    width: "100%",
    marginBottom: Theme.spacing.lg,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Theme.spacing.md,
    fontSize: Theme.typography.size.xs,
    fontWeight: "600",
  },
  googleButton: {
    width: "100%",
    marginBottom: Theme.spacing.xl,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: Theme.typography.size.sm,
  },
  footerLink: {
    fontSize: Theme.typography.size.sm,
    fontWeight: "700",
  },
});

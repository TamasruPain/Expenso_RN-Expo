import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { colors } = useAppTheme();

  const [step, setStep] = useState<"request" | "reset">("request");
  const [emailAddress, setEmailAddress] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onRequestReset = async () => {
    if (!isLoaded) return;
    if (!emailAddress) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: emailAddress,
      });
      setStep("reset");
      Alert.alert(
        "Code Sent",
        "A password reset code has been sent to your email."
      );
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors?.[0]?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async () => {
    if (!isLoaded) return;
    if (!code) {
      Alert.alert("Error", "Please enter the verification code.");
      return;
    }
    if (!password || password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        Alert.alert("Success", "Your password has been reset successfully.");
        router.replace("/(tabs)");
      } else {
        console.error(JSON.stringify(result, null, 2));
        Alert.alert("Error", "Reset failed. Please try again.");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors?.[0]?.message || "Invalid code or reset attempt");
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
            if (step === "reset") {
              setStep("request");
              setCode("");
              setPassword("");
            } else {
              router.back();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        {step === "request" ? (
          <>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                Forgot Password
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Enter your email address and we will send you a code to reset your password.
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
            </View>

            <Button
              title="Send Reset Code"
              onPress={onRequestReset}
              loading={loading}
              style={styles.submitButton}
            />
          </>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                Reset Password
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Enter the verification code sent to {emailAddress} and choose a new password.
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Verification Code"
                placeholder="123456"
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
              />
              <Input
                label="New Password"
                placeholder="Minimum 8 characters"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <Button
              title="Reset Password"
              onPress={onResetPassword}
              loading={loading}
              style={styles.submitButton}
            />
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
  submitButton: {
    width: "100%",
    marginBottom: Theme.spacing.lg,
  },
});

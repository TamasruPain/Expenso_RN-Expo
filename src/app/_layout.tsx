import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthSync } from "@/hooks/useAuthSync";
import { tokenCache } from "@/lib/clerk";
import { useSecurityStore } from "@/stores/useSecurityStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { requestPermissions, scheduleDailyReminder, addNotificationClickResponseListener } from "@/lib/notifications";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { AppState, AppStateStatus, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  console.warn("Clerk publishable key is missing!");
}

export default function RootLayout() {
  const { authenticate, isBiometricsEnabled, isAuthenticated, resetAuth } =
    useSecurityStore();
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    // Initial authentication on launch
    if (isBiometricsEnabled) {
      authenticate();
    }
  }, [isBiometricsEnabled, authenticate]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // If going to background, reset auth status so it asks again when returning
      if (
        appState.match(/active/) &&
        nextAppState === "background" &&
        isBiometricsEnabled
      ) {
        resetAuth();
      }

      // If coming back to foreground
      if (
        appState.match(/inactive|background/) &&
        nextAppState === "active" &&
        isBiometricsEnabled
      ) {
        authenticate();
      }

      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, [appState, isBiometricsEnabled, authenticate, resetAuth]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <ClerkLoaded>
          {isBiometricsEnabled && !isAuthenticated ? (
            <LockedScreen />
          ) : (
            <RootLayoutContent />
          )}
        </ClerkLoaded>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

function LockedScreen() {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        },
      ]}
    >
      <Ionicons name="lock-closed" size={64} color={colors.primary} />
      <Text
        style={{
          marginTop: 24,
          fontSize: 18,
          color: colors.text,
          fontWeight: "600",
        }}
      >
        App Locked
      </Text>
      <Text style={{ marginTop: 8, fontSize: 14, color: colors.textSecondary }}>
        Authenticate to continue
      </Text>
    </View>
  );
}

function RootLayoutContent() {
  useAuthSync();
  const { colors } = useAppTheme();
  const { isNotificationsEnabled, dailyReminderTime } = useSettingsStore();

  useEffect(() => {
    async function initNotifications() {
      if (isNotificationsEnabled) {
        const granted = await requestPermissions();
        if (granted) {
          await scheduleDailyReminder(dailyReminderTime);
        }
      }
    }
    initNotifications();

    const subscription = addNotificationClickResponseListener((response) => {
      console.log("Notification clicked:", response.notification.request.content);
    });

    return () => {
      subscription.remove();
    };
  }, [isNotificationsEnabled, dailyReminderTime]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}

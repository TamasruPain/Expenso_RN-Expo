import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSecurityStore } from "@/stores/useSecurityStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { requestPermissions, scheduleDailyReminder, cancelAllNotifications } from "@/lib/notifications";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value?: string;
  type?: "link" | "toggle" | "info";
  onPress?: () => void;
  isEnabled?: boolean;
  onToggle?: (value: boolean) => void;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  value,
  type = "link",
  onPress,
  isEnabled,
  onToggle,
}) => {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.card }]}
      onPress={type === "link" ? onPress : undefined}
      activeOpacity={type === "link" ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.primarySurface },
          ]}
        >
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <Text style={[styles.settingTitle, { color: colors.text }]}>
          {title}
        </Text>
      </View>

      <View style={styles.settingRight}>
        {type === "link" && (
          <View style={styles.linkContent}>
            {value && (
              <Text style={[styles.valueText, { color: colors.textSecondary }]}>
                {value}
              </Text>
            )}
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textSecondary}
            />
          </View>
        )}
        {type === "toggle" && (
          <Switch
            value={isEnabled}
            onValueChange={onToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        )}
        {type === "info" && (
          <Text style={[styles.valueText, { color: colors.textSecondary }]}>
            {value}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { user } = useAuthStore();
  const { isBiometricsEnabled, setBiometricsEnabled } = useSecurityStore();
  const { isNotificationsEnabled, setNotificationsEnabled, dailyReminderTime } = useSettingsStore();

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      const granted = await requestPermissions();
      if (granted) {
        setNotificationsEnabled(true);
        await scheduleDailyReminder(dailyReminderTime);
      } else {
        setNotificationsEnabled(false);
        Alert.alert(
          "Permission Denied",
          "Please enable notifications in your device settings to receive updates and reminders."
        );
      }
    } else {
      setNotificationsEnabled(false);
      await cancelAllNotifications();
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Settings
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Application
          </Text>
          <SettingItem
            icon="notifications-outline"
            title="Push Notifications"
            type="toggle"
            isEnabled={isNotificationsEnabled}
            onToggle={handleToggleNotifications}
          />
          <SettingItem
            icon="finger-print-outline"
            title="Biometric Lock"
            type="toggle"
            isEnabled={isBiometricsEnabled}
            onToggle={setBiometricsEnabled}
          />
          <SettingItem
            icon="cash-outline"
            title="Primary Currency"
            value={
              user ? `${user.currency} (${user.currency_symbol})` : "USD ($)"
            }
            onPress={() => router.push("/(onboarding)/currency")}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Support & Legal
          </Text>
          <SettingItem
            icon="help-circle-outline"
            title="Help Center"
            onPress={() => router.push("/help")}
          />
          <SettingItem
            icon="document-text-outline"
            title="Terms of Service"
            onPress={() => router.push("/help")}
          />
          <SettingItem
            icon="shield-outline"
            title="Privacy Policy"
            onPress={() => router.push("/privacy")}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            About
          </Text>
          <SettingItem
            icon="information-outline"
            title="Version"
            value={Constants.expoConfig?.version || "1.0.0"}
            type="info"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: Theme.typography.size.lg,
    fontWeight: "700",
  },
  section: {
    marginTop: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: Theme.spacing.sm,
    marginLeft: Theme.spacing.xs,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.lg,
    marginBottom: Theme.spacing.xs,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: Theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  linkContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.xs,
  },
  valueText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

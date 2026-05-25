import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBudgetStore } from "@/stores/useBudgetStore";
import { useGamificationStore } from "@/stores/useGamificationStore";
import { useGoalStore } from "@/stores/useGoalStore";
import { useThemeStore } from "@/stores/useThemeStore";
import { useTransactionStore } from "@/stores/useTransactionStore";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import React, { useMemo } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { badges, streakCount } = useGamificationStore();
  const { goals } = useGoalStore();
  const { signOut } = useAuth();
  const { transactions } = useTransactionStore();
  const { budgets } = useBudgetStore();

  const totalSavings = useMemo(() => {
    return goals.reduce((sum, g) => sum + (g.current_amount || 0), 0);
  }, [goals]);

  const rank = useMemo(() => {
    const earnedCount = badges.length;
    if (earnedCount >= 5) return "Gold";
    if (earnedCount >= 3) return "Silver";
    if (earnedCount >= 1) return "Bronze";
    return "Novice";
  }, [badges]);

  const { theme, setTheme } = useThemeStore();
  const { colors, isDark } = useAppTheme();

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/welcome");
        },
      },
    ]);
  };

  const currentMonthName = format(new Date(), "MMMM yyyy");

  const budgetSummary = useMemo(() => {
    // Calculate total budget (fallback to 1250 if none)
    const totalBudget = budgets.reduce((acc, b) => acc + b.amount, 0) || 1250;

    // Calculate spent for CURRENT month only
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthTx = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalSpent = monthTx
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const percent =
      totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;

    return {
      total: totalBudget,
      spent: totalSpent,
      percent: Math.round(percent),
    };
  }, [budgets, transactions]);

  const initials = useMemo(() => {
    const name = user?.fullName || "U";
    const parts = name.split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name[0].toUpperCase();
  }, [user?.fullName]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ─── Profile Header Card ─── */}
        <LinearGradient
          colors={isDark ? ["#3B2EAF", "#5B3EC9"] : ["#A88DFB", "#7C5CFC"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        >
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.fullName || "User"}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user?.email || "No email"}
              </Text>
            </View>
          </View>

          {/* Spending + Budget row */}
          <View style={styles.spendingRow}>
            <View>
              <Text style={styles.spendLabel}>Total Spent</Text>
              <Text style={styles.spendAmount}>
                {user?.currency_symbol || "$"}{" "}
                {budgetSummary.spent.toLocaleString()}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.spendLabel}>{currentMonthName}</Text>
              <Text style={styles.spendAmount}>
                {budgetSummary.percent}% used
              </Text>
            </View>
          </View>

          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${budgetSummary.percent}%` },
              ]}
            />
          </View>
        </LinearGradient>

        {/* ─── Streak Cards ─── */}
        <View style={styles.streakRow}>
          {/* Day Streak Card */}
          <View
            style={[
              styles.streakCardCompact,
              {
                backgroundColor: colors.card,
                shadowColor: isDark ? "#000" : "#7C5CFC",
              },
            ]}
          >
            <View
              style={[
                styles.streakIconCompact,
                {
                  backgroundColor: isDark
                    ? "rgba(124,92,252,0.2)"
                    : colors.primarySurface,
                },
              ]}
            >
              <Ionicons name="flame" size={14} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.streakLabelCompact, { color: colors.textSecondary }]}>
                Day Streak
              </Text>
              <Text style={[styles.streakValueCompact, { color: colors.text }]}>
                {streakCount}
              </Text>
            </View>
          </View>

          {/* Best Streak Card */}
          <View
            style={[
              styles.streakCardCompact,
              {
                backgroundColor: colors.card,
                shadowColor: isDark ? "#000" : "#7C5CFC",
              },
            ]}
          >
            <View
              style={[
                styles.streakIconCompact,
                {
                  backgroundColor: isDark
                    ? "rgba(0,208,158,0.15)"
                    : "#E8FFF6",
                },
              ]}
            >
              <Ionicons name="trophy" size={14} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.streakLabelCompact, { color: colors.textSecondary }]}>
                Best Streak
              </Text>
              <Text style={[styles.streakValueCompact, { color: colors.text }]}>
                23
              </Text>
            </View>
          </View>
        </View>

        {/* ─── Savings & Achievements Cards ─── */}
        <View style={[styles.streakRow, { marginTop: -4, marginBottom: Theme.spacing.lg }]}>
          {/* Savings Goals Card */}
          <TouchableOpacity
            style={[
              styles.streakCard,
              styles.clickableCard,
              {
                backgroundColor: colors.card,
                shadowColor: isDark ? "#000" : "#7C5CFC",
              },
            ]}
            onPress={() => router.push("/goal")}
            activeOpacity={0.7}
          >
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward" size={14} color="#3B82F6" />
            </View>
            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
                gap: 10,
              }}
            >
              <View
                style={[
                  styles.streakIcon,
                  {
                    backgroundColor: isDark
                      ? "rgba(124,92,252,0.15)"
                      : colors.primarySurface,
                  },
                ]}
              >
                <Ionicons name="flag" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.streakValue, { color: colors.text }]}>
                {user?.currency_symbol || "$"}{totalSavings.toLocaleString()}
              </Text>
            </View>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
              {goals.length} Savings Goal{goals.length !== 1 ? "s" : ""}
            </Text>
          </TouchableOpacity>

          {/* Badges Card */}
          <TouchableOpacity
            style={[
              styles.streakCard,
              styles.clickableCard,
              {
                backgroundColor: colors.card,
                shadowColor: isDark ? "#000" : "#7C5CFC",
              },
            ]}
            onPress={() => router.push("/badges")}
            activeOpacity={0.7}
          >
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward" size={14} color="#3B82F6" />
            </View>
            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
                gap: 10,
              }}
            >
              <View
                style={[
                  styles.streakIcon,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,184,0,0.15)"
                      : "#FFF8E7",
                  },
                ]}
              >
                <Ionicons name="ribbon" size={18} color="#FFB800" />
              </View>
              <Text style={[styles.streakValue, { color: colors.text }]}>
                {badges.length}/6
              </Text>
            </View>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
              {rank} Rank
            </Text>
          </TouchableOpacity>
        </View>

        {/* ─── Theme Selector ─── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Appearance
        </Text>
        <View
          style={[
            styles.themeSelector,
            {
              backgroundColor: isDark ? colors.card : colors.primarySurface,
            },
          ]}
        >
          {(
            [
              { key: "light", icon: "sunny", label: "Light" },
              { key: "dark", icon: "moon", label: "Dark" },
              { key: "system", icon: "phone-portrait", label: "System" },
            ] as const
          ).map((item) => {
            const isActive = theme === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.themeOption,
                  isActive && {
                    backgroundColor: colors.card,
                    borderColor: colors.primary,
                    borderWidth: 0.5,
                    elevation: 2,
                    shadowColor: "#000000ff",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                  },
                ]}
                onPress={() => setTheme(item.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={`${item.icon}-outline` as any}
                  size={18}
                  color={isActive ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    {
                      color: isActive ? colors.text : colors.textSecondary,
                      fontWeight: isActive ? "700" : "500",
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ─── Menu Items ─── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          General
        </Text>
        <View
          style={[
            styles.menuCard,
            {
              backgroundColor: colors.card,
              shadowColor: isDark ? "#000" : "#7C5CFC",
            },
          ]}
        >
          {[
            {
              icon: "settings-outline",
              label: "Settings",
              onPress: () => router.push("/settings"),
            },
            {
              icon: "shield-checkmark-outline",
              label: "Privacy & Security",
              onPress: () => router.push("/privacy"),
            },
            {
              icon: "help-circle-outline",
              label: "Help & Support",
              onPress: () => router.push("/help"),
            },
          ].map((item, i, arr) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                i < arr.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: isDark
                    ? "rgba(255,255,255,0.06)"
                    : colors.border,
                },
              ]}
              onPress={item.onPress}
              activeOpacity={0.6}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={colors.textSecondary}
                />
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  {item.label}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── Footer ─── */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.logoutButton,
              {
                backgroundColor: isDark ? "rgba(255,92,92,0.15)" : "#FFE0E0",
                borderWidth: 1,
                borderColor: isDark ? "rgba(255,92,92,0.25)" : "#FFBDBD",
              },
            ]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={[styles.logoutText, { color: colors.danger }]}>
              Logout
            </Text>
          </TouchableOpacity>

          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Expenso v{Constants.expoConfig?.version || "1.0.0"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: 100,
  },

  // ─── Header Card ──────────────────────────────────────────
  headerCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.xl,
    marginBottom: Theme.spacing.md,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: Theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  userEmail: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 1,
  },
  spendingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  spendLabel: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  spendAmount: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFF",
    borderRadius: 3,
  },

  // ─── Streak Cards ─────────────────────────────────────────
  streakRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: Theme.spacing.lg,
  },
  streakCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: Theme.radius.lg,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  streakIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  streakValue: {
    fontSize: 22,
    fontWeight: "800",
  },
  streakLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  streakCardCompact: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Theme.radius.md,
    gap: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  streakIconCompact: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  streakValueCompact: {
    fontSize: 15,
    fontWeight: "800",
    marginTop: -2,
  },
  streakLabelCompact: {
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  clickableCard: {
    borderWidth: 1.5,
    borderColor: "#3B82F6",
  },
  arrowContainer: {
    position: "absolute",
    top: 8,
    right: 8,
  },

  // ─── Section ──────────────────────────────────────────────
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
    marginLeft: 2,
  },

  // ─── Theme ────────────────────────────────────────────────
  themeSelector: {
    flexDirection: "row",
    padding: 4,
    borderRadius: Theme.radius.md,
    gap: 4,
    marginBottom: Theme.spacing.lg,
  },
  themeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: Theme.radius.sm,
    gap: 6,
  },
  themeOptionText: {
    fontSize: 13,
  },

  // ─── Menu ─────────────────────────────────────────────────
  menuCard: {
    borderRadius: Theme.radius.lg,
    marginBottom: Theme.spacing.lg,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
  },

  // ─── Footer ───────────────────────────────────────────────
  footer: {
    alignItems: "center",
    gap: 12,
    paddingBottom: Theme.spacing.md,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 14,
    borderRadius: Theme.radius.lg,
    gap: 10,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
  },
  versionText: {
    fontSize: 12,
    fontWeight: "500",
  },
});

import { BADGES } from "@/constants/badges";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useDatabase } from "@/hooks/useDatabase";
import { useBudgetStore } from "@/stores/useBudgetStore";
import { useGamificationStore } from "@/stores/useGamificationStore";
import { useTransactionStore } from "@/stores/useTransactionStore";
import { BadgeItem } from "@/components/gamification/BadgeItem";
import { StreakCard } from "@/components/gamification/StreakCard";
import { AchievementToast } from "@/components/gamification/AchievementToast";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BadgesScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { refreshAllData, awardBadge } = useDatabase();
  const { badges, streakCount } = useGamificationStore();
  const { transactions } = useTransactionStore();
  const { budgets } = useBudgetStore();

  const [isLoading, setIsLoading] = useState(true);
  const [unlockedBadge, setUnlockedBadge] = useState<{
    title: string;
    description: string;
    icon: string;
    color: string;
  } | null>(null);

  useEffect(() => {
    const initAndCheckBadges = async () => {
      try {
        await refreshAllData();

        // Retrieve the latest fetched data directly from Zustand stores
        const currentBadges = useGamificationStore.getState().badges;
        const currentTransactions = useTransactionStore.getState().transactions;
        const currentBudgets = useBudgetStore.getState().budgets;
        const currentStreak = useGamificationStore.getState().streakCount;

        const earnedTypes = new Set(currentBadges.map((b) => b.badge_type));

        // Rule 1: Early Bird
        const isEarlyBird = currentTransactions.some((t) => {
          if (!t.date) return false;
          const hrs = new Date(t.date).getHours();
          return hrs < 8;
        });

        // Rule 2: Budget Master
        const isBudgetMaster =
          currentBudgets.length > 0 &&
          currentBudgets.every((b) => (b.spent || 0) <= b.amount);

        // Rule 3: Super Saver
        const monthlyTotals: { [key: string]: { income: number; expense: number } } = {};
        currentTransactions.forEach((t) => {
          if (!t.date || typeof t.date !== "string") return;
          const monthKey = t.date.substring(0, 7);
          if (!monthlyTotals[monthKey]) {
            monthlyTotals[monthKey] = { income: 0, expense: 0 };
          }
          if (t.type === "income") {
            monthlyTotals[monthKey].income += t.amount;
          } else if (t.type === "expense") {
            monthlyTotals[monthKey].expense += t.amount;
          }
        });
        const isSuperSaver = Object.values(monthlyTotals).some(
          (m) => m.income > 0 && (m.income - m.expense) / m.income >= 0.3
        );

        // Rule 4: Night Owl
        const isNightOwl = currentTransactions.some((t) => {
          if (!t.date) return false;
          const hrs = new Date(t.date).getHours();
          return t.type === "expense" && hrs < 5;
        });

        // Rule 5: Analyst
        const isAnalyst = currentStreak >= 7;

        // Rule 6: Planner
        const isPlanner = currentBudgets.length >= 5;

        const rules = [
          { id: "1", condition: isEarlyBird },
          { id: "2", condition: isBudgetMaster },
          { id: "3", condition: isSuperSaver },
          { id: "4", condition: isNightOwl },
          { id: "5", condition: isAnalyst },
          { id: "6", condition: isPlanner },
        ];

        for (const rule of rules) {
          if (rule.condition && !earnedTypes.has(rule.id)) {
            earnedTypes.add(rule.id);
            try {
              await awardBadge(rule.id);
              const badgeDetails = BADGES.find((b) => b.id === rule.id);
              if (badgeDetails) {
                setUnlockedBadge({
                  title: `Badge Unlocked! 🏆`,
                  description: `You've earned the "${badgeDetails.name}" badge!`,
                  icon: badgeDetails.icon,
                  color: badgeDetails.color,
                });
              }
            } catch (err) {
              console.error(`Error awarding badge ${rule.id}:`, err);
            }
          }
        }
      } catch (error) {
        console.error("Failed to initialize badges screen:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAndCheckBadges();
  }, [refreshAllData, awardBadge]);

  const weeklyProgress = useMemo(() => {
    const progress = [false, false, false, false, false, false, false];
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sun, 1 = Mon, etc.
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDay);
    startOfWeek.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(startOfWeek);
      targetDate.setDate(startOfWeek.getDate() + i);

      const hasTx = transactions.some((t) => {
        const d = new Date(t.date);
        return (
          d.getDate() === targetDate.getDate() &&
          d.getMonth() === targetDate.getMonth() &&
          d.getFullYear() === targetDate.getFullYear()
        );
      });
      progress[i] = hasTx;
    }
    return progress;
  }, [transactions]);

  const earnedBadgeTypes = new Set(badges.map((b) => b.badge_type));

  const mappedBadges = BADGES.map((badge) => ({
    ...badge,
    earned: earnedBadgeTypes.has(badge.id),
  }));

  const earnedCount = mappedBadges.filter((b) => b.earned).length;

  let rank = "Novice";
  if (earnedCount >= 5) {
    rank = "Gold";
  } else if (earnedCount >= 3) {
    rank = "Silver";
  } else if (earnedCount >= 1) {
    rank = "Bronze";
  }

  const renderBadge = (item: (typeof mappedBadges)[0]) => (
    <BadgeItem
      key={item.id}
      name={item.name}
      description={item.description}
      icon={item.icon}
      color={item.color}
      earned={item.earned}
    />
  );

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
          Badges & Rewards
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={["#8854ff", "#8fb0ff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statsContainer}
          >
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {earnedCount}/{BADGES.length}
              </Text>
              <Text style={styles.statLabel}>Badges</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{rank}</Text>
              <Text style={styles.statLabel}>Rank</Text>
            </View>
          </LinearGradient>

          {/* Daily Logging Streak Card */}
          <StreakCard
            streakCount={streakCount}
            weeklyProgress={weeklyProgress}
          />

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Achievements
          </Text>

          <View style={styles.badgesWrapper}>
            {mappedBadges.map((badge) => renderBadge(badge))}
          </View>
        </ScrollView>
      )}

      <AchievementToast
        visible={unlockedBadge !== null}
        onClose={() => setUnlockedBadge(null)}
        title={unlockedBadge?.title || ""}
        description={unlockedBadge?.description || ""}
        iconName={unlockedBadge?.icon}
        iconColor={unlockedBadge?.color}
      />
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
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
  },
  backButton: {
    padding: 8,
    marginRight: Theme.spacing.sm,
  },
  headerTitle: {
    fontSize: Theme.typography.size.lg,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
  },
  statsContainer: {
    flexDirection: "row",
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.xl,
    marginBottom: Theme.spacing.xl,
    elevation: 4,
    shadowColor: "#7C5CFC",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: "#FFF",
    fontSize: Theme.typography.size.xxl,
    fontWeight: "700",
  },
  statLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  sectionTitle: {
    fontSize: Theme.typography.size.lg,
    fontWeight: "700",
    marginBottom: Theme.spacing.md,
  },
  badgesWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Theme.spacing.md,
    justifyContent: "space-between",
  },
  badgeCard: {
    width: "47%",
    padding: 12,
    borderRadius: 16,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom: Theme.spacing.sm,
  },
  badgeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Theme.spacing.sm,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: 10,
    textAlign: "center",
    lineHeight: 14,
  },
  lockedContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  lockedText: {
    fontSize: 10,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

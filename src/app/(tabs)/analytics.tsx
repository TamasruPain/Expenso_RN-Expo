import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { useTransactionStore } from "@/stores/useTransactionStore";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Modular Analytics Components
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SpendingHeatmap } from "@/components/analytics/SpendingHeatmap";
import { TrendBarChart } from "@/components/analytics/TrendBarChart";
import { CategoryPieChart } from "@/components/analytics/CategoryPieChart";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HEATMAP_COLS = 7;
const HEATMAP_GAP = 6;
const HEATMAP_PADDING = Theme.spacing.lg * 2 + Theme.spacing.md * 2;
const CELL_SIZE =
  (SCREEN_WIDTH - HEATMAP_PADDING - HEATMAP_GAP * (HEATMAP_COLS - 1)) /
  HEATMAP_COLS;

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AnalyticsScreen() {
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly" | "yearly">(
    "monthly",
  );
  const { colors, isDark } = useAppTheme();
  const { user } = useAuthStore();
  const { transactions, getTotalExpense, isLoading } = useTransactionStore();
  const { categories } = useCategoryStore();

  const analyticsData = useMemo(() => {
    const totalSpent = getTotalExpense();
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const breakdown = categories
      .map((cat) => {
        const amount = transactions
          .filter((t) => t.categoryId === cat.id && t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);
        return {
          name: cat.name,
          amount,
          color: cat.color || colors.primary,
          percent: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
        };
      })
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    // Heatmap data for current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0=Sun

    // Leading blanks so the grid aligns to the correct weekday
    const heatmapBlanks = Array.from({ length: startDayOfWeek }, (_, i) => ({
      day: -(i + 1),
      intensity: -1,
      amount: 0,
    }));

    const heatmapDays = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dayTx = transactions.filter((t) => {
        const d = new Date(t.date);
        return (
          d.getDate() === day &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear() &&
          t.type === "expense"
        );
      });
      const dayAmount = dayTx.reduce((sum, t) => sum + t.amount, 0);
      const count = dayTx.length;
      return {
        day,
        intensity: Math.min(4, count),
        amount: dayAmount,
      };
    });

    const heatmap = [...heatmapBlanks, ...heatmapDays];

    // Weekly bar chart data (last 7 days)
    const weeklyBars = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayLabel = format(d, "EEE");
      const dayAmount = transactions
        .filter((t) => {
          const td = new Date(t.date);
          return (
            td.getDate() === d.getDate() &&
            td.getMonth() === d.getMonth() &&
            td.getFullYear() === d.getFullYear() &&
            t.type === "expense"
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);
      return { label: dayLabel, amount: dayAmount };
    });
    const maxBar = Math.max(...weeklyBars.map((b) => b.amount), 1);

    return {
      totalSpent,
      totalIncome,
      breakdown,
      heatmap,
      weeklyBars,
      maxBar,
      monthName: format(now, "MMMM yyyy"),
      txCount: transactions.length,
    };
  }, [transactions, categories, getTotalExpense, colors.primary]);

  // ─── Heatmap Cell ──────────────────────────────────────────────
  const renderHeatmapCell = (item: {
    day: number;
    intensity: number;
    amount: number;
  }) => {
    if (item.intensity < 0) {
      return <View key={`blank-${item.day}`} style={styles.heatmapCellBlank} />;
    }

    const intensityColors = isDark
      ? [
          "rgba(255,255,255,0.04)",
          "rgba(124,92,252,0.25)",
          "rgba(124,92,252,0.45)",
          "rgba(124,92,252,0.70)",
          "rgba(124,92,252,0.95)",
        ]
      : ["#EDE8FF", "#C9B8FF", "#A78BFA", "#8B5CF6", "#7C3AED"];

    const isToday = item.day === new Date().getDate();
    const bgColor = intensityColors[item.intensity];

    return (
      <View
        key={item.day}
        style={[
          styles.heatmapCell,
          {
            backgroundColor: bgColor,
            borderWidth: isToday ? 2 : 0,
            borderColor: isToday ? colors.primary : "transparent",
          },
        ]}
      >
        <Text
          style={[
            styles.heatmapDayText,
            {
              color:
                item.intensity >= 3
                  ? "#FFF"
                  : item.intensity >= 1
                    ? isDark
                      ? "#DDD"
                      : "#6B21A8"
                    : colors.textSecondary,
              fontWeight: isToday ? "800" : "600",
            },
          ]}
        >
          {item.day}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
          <SegmentedControl
            values={["Weekly", "Monthly", "Yearly"]}
            selectedIndex={activeTab === "weekly" ? 0 : activeTab === "monthly" ? 1 : 2}
            onChange={(index) => {
              const tabs: ("weekly" | "monthly" | "yearly")[] = ["weekly", "monthly", "yearly"];
              setActiveTab(tabs[index]);
            }}
          />
        </View>

        {/* ──────────── SPENDING HEATMAP (TOP) ──────────── */}
        <SpendingHeatmap
          heatmap={analyticsData.heatmap}
          monthName={analyticsData.monthName}
          txCount={analyticsData.txCount}
        />

        {/* ──────────── OVERVIEW CARDS ──────────── */}
        <View style={styles.overviewRow}>
          <LinearGradient
            colors={isDark ? ["#3B2EAF", "#5B3EC9"] : ["#8854ff", "#a78bfa"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.overviewCard}
          >
            <Ionicons
              name="trending-down"
              size={20}
              color="rgba(255,255,255,0.7)"
            />
            <Text style={styles.overviewLabel}>Spent</Text>
            <Text style={styles.overviewValue}>
              {user?.currency_symbol || "₹"}{" "}
              {analyticsData.totalSpent.toLocaleString()}
            </Text>
          </LinearGradient>
          <LinearGradient
            colors={isDark ? ["#0D6B4F", "#10916A"] : ["#00C896", "#34d399"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.overviewCard}
          >
            <Ionicons
              name="trending-up"
              size={20}
              color="rgba(255,255,255,0.7)"
            />
            <Text style={styles.overviewLabel}>Income</Text>
            <Text style={styles.overviewValue}>
              {user?.currency_symbol || "₹"}{" "}
              {analyticsData.totalIncome.toLocaleString()}
            </Text>
          </LinearGradient>
        </View>

        {/* ──────────── WEEKLY TREND BAR CHART ──────────── */}
        <TrendBarChart
          weeklyBars={analyticsData.weeklyBars}
          maxBar={analyticsData.maxBar}
          currencySymbol={user?.currency_symbol || "₹"}
        />

        {/* ──────────── CATEGORY PIE CHART ──────────── */}
        <CategoryPieChart
          data={analyticsData.breakdown}
          totalSpent={analyticsData.totalSpent}
          currencySymbol={user?.currency_symbol || "₹"}
        />

        {/* ──────────── CATEGORIES BREAKDOWN ──────────── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Top Categories
        </Text>
        <View
          style={[
            styles.categoriesCard,
            {
              backgroundColor: colors.card,
              shadowColor: isDark ? "#000" : "#7C5CFC",
            },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ padding: 20 }} />
          ) : analyticsData.breakdown.length > 0 ? (
            analyticsData.breakdown.slice(0, 6).map((item) => (
              <View key={item.name} style={styles.categoryRow}>
                <View style={styles.categoryLeft}>
                  <View
                    style={[styles.colorDot, { backgroundColor: item.color }]}
                  />
                  <View style={{ flex: 1 }}>
                    <View style={styles.categoryInfo}>
                      <Text
                        style={[styles.categoryName, { color: colors.text }]}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={[styles.categoryAmount, { color: colors.text }]}
                      >
                        {user?.currency_symbol || "₹"}
                        {item.amount.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.categoryBarRow}>
                      <View
                        style={[
                          styles.categoryProgressBg,
                          {
                            backgroundColor: isDark
                              ? "rgba(255,255,255,0.06)"
                              : colors.primarySurface,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.categoryProgressFill,
                            {
                              backgroundColor: item.color,
                              width: `${item.percent}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.categoryPercent,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {item.percent}%
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="pie-chart-outline"
                size={40}
                color={colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No spending data yet
              </Text>
            </View>
          )}
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
  header: {
    marginBottom: Theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: Theme.spacing.md,
  },
  tabBar: {
    flexDirection: "row",
    padding: 4,
    borderRadius: Theme.radius.md,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: Theme.radius.sm,
  },
  tabText: {
    fontSize: Theme.typography.size.sm,
    fontWeight: "700",
  },

  // ─── Heatmap ────────────────────────────────────────────────
  heatmapCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.xl,
    marginBottom: Theme.spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  heatmapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  heatmapTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  heatmapSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  heatmapBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heatmapBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  weekdayRow: {
    flexDirection: "row",
    gap: HEATMAP_GAP,
    marginBottom: 6,
  },
  weekdayLabel: {
    width: CELL_SIZE,
    textAlign: "center",
    fontSize: 10,
    fontWeight: "600",
  },
  heatmapGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: HEATMAP_GAP,
  },
  heatmapCell: {
    width: CELL_SIZE,
    aspectRatio: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  heatmapCellBlank: {
    width: CELL_SIZE,
    aspectRatio: 1,
  },
  heatmapDayText: {
    fontSize: 11,
  },
  heatmapLegend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: Theme.spacing.md,
    gap: 4,
  },
  legendText: {
    fontSize: 10,
    fontWeight: "600",
    marginHorizontal: 4,
  },
  legendBox: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },

  // ─── Overview Cards ─────────────────────────────────────────
  overviewRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: Theme.spacing.lg,
  },
  overviewCard: {
    flex: 1,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.lg,
    gap: 6,
  },
  overviewLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },
  overviewValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: -0.3,
  },

  // ─── Bar Chart ──────────────────────────────────────────────
  chartCard: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.xl,
    marginBottom: Theme.spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  barChartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 170,
    marginTop: Theme.spacing.md,
    paddingTop: 20,
  },
  barColumn: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  barAmountText: {
    fontSize: 9,
    fontWeight: "600",
    marginBottom: 4,
  },
  bar: {
    width: "60%",
    borderRadius: 6,
    minHeight: 6,
  },
  barLabel: {
    fontSize: 11,
    marginTop: 8,
  },

  // ─── Categories ─────────────────────────────────────────────
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Theme.spacing.md,
  },
  categoriesCard: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.xl,
    marginBottom: Theme.spacing.xl,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  categoryRow: {
    marginBottom: Theme.spacing.md,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  categoryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: "700",
  },
  categoryBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  categoryProgressBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  categoryProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  categoryPercent: {
    fontSize: 12,
    fontWeight: "700",
    minWidth: 32,
    textAlign: "right",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

import { AddTransactionModal } from "@/components/transaction/AddTransactionModal";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useDatabase } from "@/hooks/useDatabase";
import { getIoniconsName } from "@/lib/icons";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBudgetStore } from "@/stores/useBudgetStore";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { useTransactionStore } from "@/stores/useTransactionStore";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { useStreaks } from "@/hooks/useStreaks";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Modular Dashboard Components
import { SpendingSummaryCard } from "@/components/home/SpendingSummaryCard";
import { StatsRow } from "@/components/home/StatsRow";
import { BudgetProgressBar } from "@/components/home/BudgetProgressBar";
import { RecentTransactions } from "@/components/home/RecentTransactions";
import { NLPInput } from "@/components/transaction/NLPInput";

export default function HomeScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = React.useState(false);
  const { user } = useAuthStore();
  const { transactions, isLoading: isTxLoading } = useTransactionStore();
  const { budgets } = useBudgetStore();
  const { categories } = useCategoryStore();
  const { refreshAllData, addTransaction } = useDatabase();
  const { recordActivity } = useStreaks();

  const { colors } = useAppTheme();

  useEffect(() => {
    refreshAllData();
    recordActivity();
  }, [refreshAllData]);

  const currentMonthName = format(new Date(), "MMMM yyyy");

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning 🌅";
    if (hour >= 12 && hour < 17) return "Good Afternoon ☀️";
    if (hour >= 17 && hour < 21) return "Good Evening 🌆";
    return "Good Night 🌙";
  }, []);

  // Calculate totals for CURRENT MONTH only
  const totals = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthTx = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const income = monthTx
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTx
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
      txCount: monthTx.length,
    };
  }, [transactions]);

  // Calculate budget progress
  const budgetSummary = useMemo(() => {
    const totalBudget = budgets.reduce((acc, b) => acc + b.amount, 0) || 1250;
    const totalSpent = totals.expense;
    const percent =
      totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;
    return {
      total: totalBudget,
      percent: Math.round(percent),
    };
  }, [budgets, totals.expense]);

  // Days elapsed in current month (minimum 1 to avoid division by zero)
  const daysElapsed = useMemo(() => {
    return Math.max(1, new Date().getDate());
  }, []);

  const recentTransactions = transactions.slice(0, 5);

  const initials = useMemo(() => {
    const name = user?.fullName || "U";
    const parts = name.split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name[0].toUpperCase();
  }, [user?.fullName]);

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return getIoniconsName(category?.icon || "medical");
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Other";
  };

  const renderTransaction = (item: any) => (
    <View
      key={item.id}
      style={[styles.transactionItem, { backgroundColor: colors.card }]}
    >
      <View style={styles.transactionLeft}>
        <View
          style={[
            styles.transactionIconPlaceholder,
            { backgroundColor: colors.primarySurface },
          ]}
        >
          <Ionicons
            name={getCategoryIcon(item.categoryId) as any}
            size={20}
            color={colors.primary}
          />
        </View>
        <View>
          <Text style={[styles.transactionName, { color: colors.text }]}>
            {item.note || getCategoryName(item.categoryId)}
          </Text>
          <Text
            style={[styles.transactionDate, { color: colors.textSecondary }]}
          >
            {format(new Date(item.date), "do MMM yyyy")}
          </Text>
        </View>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text
          style={[
            styles.transactionAmount,
            { color: item.type === "income" ? colors.accent : colors.danger },
          ]}
        >
          {item.type === "income" ? "+" : "-"} {user?.currency_symbol || "$"}
          {Math.abs(item.amount).toLocaleString()}
        </Text>
        <Text
          style={[styles.transactionCategory, { color: colors.textSecondary }]}
        >
          {getCategoryName(item.categoryId).toLowerCase()}
        </Text>
      </View>
    </View>
  );

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
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {greeting}
            </Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.fullName || "Guest"}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.profileButton,
              { backgroundColor: colors.primarySurface },
            ]}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Text
              style={{
                color: colors.primary,
                fontWeight: "700",
                fontSize: 16,
              }}
            >
              {initials}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero Card: Total Spent */}
        <SpendingSummaryCard
          totalSpent={totals.expense}
          totalIncome={totals.income}
          totalBalance={totals.balance}
          currentMonthName={currentMonthName}
          currencySymbol={user?.currency_symbol || "$"}
          onPress={() => router.push("/(tabs)/analytics")}
        />

        {/* Budget Progress Card */}
        <BudgetProgressBar
          currentMonthName={currentMonthName}
          percent={budgetSummary.percent}
          onPress={() => router.push("/(tabs)/budgets")}
        />

        {/* Quick Stats Row */}
        <StatsRow
          dailyAvg={(totals.expense / daysElapsed).toFixed(0)}
          transactionCount={transactions.length}
          categoryCount={categories.length}
          currencySymbol={user?.currency_symbol || "$"}
        />

        {/* Quick NLP Input */}
        <NLPInput
          categories={categories}
          onAddTransaction={addTransaction}
        />

        {/* Recent Transactions List */}
        <RecentTransactions
          transactions={recentTransactions}
          isLoading={isTxLoading}
          categories={categories}
          currencySymbol={user?.currency_symbol || "$"}
          onViewAllPress={() => router.push("/(tabs)/transactions")}
          onTransactionPress={(item) => {
            router.push("/(tabs)/transactions");
          }}
        />
      </ScrollView>

      {/* Add Button FAB Overlay */}
      <LinearGradient colors={["#8e5dffff", "#96afebff"]} style={styles.fab}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
          style={styles.fabButton}
        >
          <Ionicons name="add" size={32} color={colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
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
    paddingBottom: 110, // Extra space for tab bar and FAB
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.lg,
  },
  greeting: {
    fontSize: 16,
    fontWeight: "600",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  profilePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  totalSpentCard: {
    padding: Theme.spacing.md,
    borderRadius: 15,
    marginBottom: Theme.spacing.lg,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.xs,
  },
  cardLabel: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  cardMonth: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  totalAmount: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: Theme.spacing.md,
  },
  incomeSaveRow: {
    flexDirection: "row",
    gap: Theme.spacing.md,
  },
  glassCard: {
    flex: 1,
    backgroundColor: "rgba(154, 213, 255, 0.7)",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  glassIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  glassLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1F2937",
  },
  glassValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
  budgetCard: {
    padding: Theme.spacing.md,
    borderRadius: 16,
    marginBottom: Theme.spacing.lg,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  budgetText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  budgetPercent: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#2E1CFF",
    borderRadius: 5,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: Theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(125, 145, 255, 1)",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  statCardValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
  },
  statCardLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFF",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  viewAll: {
    display: "flex",
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  transactionIconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionName: {
    fontSize: 16,
    fontWeight: "600",
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  transactionCategory: {
    fontSize: 12,
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 110 : 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    overflow: "hidden",
  },
  fabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

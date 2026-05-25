import { AddBudgetModal } from "@/components/budget/AddBudgetModal";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useDatabase } from "@/hooks/useDatabase";
import { getIoniconsName } from "@/lib/icons";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBudgetStore } from "@/stores/useBudgetStore";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { useTransactionStore } from "@/stores/useTransactionStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";

// Modular Budget Components
import { BudgetOverviewRing } from "@/components/budget/BudgetOverviewRing";
import { BudgetCategoryBar } from "@/components/budget/BudgetCategoryBar";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BudgetsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const { colors, isDark } = useAppTheme();

  const { user } = useAuthStore();
  const { budgets, isLoading } = useBudgetStore();
  const { transactions } = useTransactionStore();
  const { categories } = useCategoryStore();
  const { deleteBudget } = useDatabase();

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Budget",
      `Are you sure you want to delete the budget for ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteBudget(id),
        },
      ],
    );
  };

  const budgetItems = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return budgets.map((budget) => {
      const category = categories.find((c) => c.id === budget.categoryId);
      // Calculate spent for this category in current month
      const spent = transactions
        .filter((t) => {
          const d = new Date(t.date);
          return (
            t.categoryId === budget.categoryId &&
            t.type === "expense" &&
            d.getMonth() === currentMonth &&
            d.getFullYear() === currentYear
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        ...budget,
        name: category?.name || "Unknown",
        icon: getIoniconsName(category?.icon || "medical"),
        color: category?.color || colors.primary,
        spent,
      };
    });
  }, [budgets, transactions, categories, colors.primary]);

  const totalBudget = useMemo(
    () => budgetItems.reduce((acc, b) => acc + b.amount, 0),
    [budgetItems],
  );
  const totalSpent = useMemo(
    () => budgetItems.reduce((acc, b) => acc + b.spent, 0),
    [budgetItems],
  );

  const renderBudgetItem = ({ item, index }: { item: any; index: number }) => {
    const percent =
      item.amount > 0 ? Math.min(100, (item.spent / item.amount) * 100) : 0;
    const isOver = item.spent > item.amount;

    const renderRightActions = () => (
      <View style={styles.deleteActionContainer}>
        <TouchableOpacity
          style={styles.deleteActionButton}
          onPress={() => handleDelete(item.id, item.name)}
        >
          <Ionicons name="trash-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    );

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 100).springify()}
        layout={Layout.springify()}
      >
        <Swipeable
          renderRightActions={renderRightActions}
          containerStyle={styles.swipeContainer}
        >
          <TouchableOpacity
            style={[styles.budgetCard, { backgroundColor: colors.card }]}
            activeOpacity={0.7}
          >
            <View style={styles.cardTop}>
              <View style={styles.cardHeaderLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.06)"
                        : colors.primarySurface,
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={item.color}
                  />
                </View>
                <View>
                  <Text style={[styles.budgetName, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.budgetLimit,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Limit: {user?.currency_symbol || "₹"}
                    {item.amount.toLocaleString()}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.spentText,
                  { color: isOver ? colors.danger : colors.text },
                ]}
              >
                {user?.currency_symbol || "₹"}
                {item.spent.toLocaleString()}
              </Text>
            </View>

            <BudgetCategoryBar
              percent={percent}
              isOver={isOver}
              categoryColor={item.color}
            />

            <View style={styles.cardFooter}>
              <Text
                style={[styles.remainingText, { color: colors.textSecondary }]}
              >
                {isOver ? "Over budget by" : "Remaining"}
              </Text>
              <Text
                style={[
                  styles.remainingValue,
                  { color: isOver ? colors.danger : colors.text },
                ]}
              >
                {user?.currency_symbol || "₹"}
                {Math.abs(item.amount - item.spent).toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Budgets</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.card }]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Total Budget Summary Ring */}
        <BudgetOverviewRing
          totalBudget={totalBudget}
          totalSpent={totalSpent}
          currencySymbol={user?.currency_symbol || "₹"}
        />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Category Budgets
        </Text>

        <FlatList
          data={budgetItems}
          renderItem={renderBudgetItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator
                color={colors.primary}
                style={{ marginTop: 40 }}
              />
            ) : (
              <Text
                style={{
                  textAlign: "center",
                  color: colors.textSecondary,
                  marginTop: 40,
                }}
              >
                No budgets set for this month.
              </Text>
            )
          }
        />

        <AddBudgetModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.typography.size.xxl,
    fontWeight: "700",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryCard: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.xl,
    marginBottom: Theme.spacing.xl,
    elevation: 4,
    shadowColor: "#7C5CFC",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: Theme.typography.size.sm,
    fontWeight: "500",
    marginBottom: 4,
  },
  summaryValue: {
    color: "#FFF",
    fontSize: Theme.typography.size.h1 - 4,
    fontWeight: "700",
    marginBottom: Theme.spacing.lg,
  },
  summaryFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.xl,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  statLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  statValue: {
    color: "#FFF",
    fontSize: Theme.typography.size.md,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: Theme.typography.size.lg,
    fontWeight: "700",
    marginBottom: Theme.spacing.md,
  },
  listContent: {
    paddingBottom: 100,
  },
  swipeContainer: {
    marginBottom: Theme.spacing.md,
    borderRadius: Theme.radius.lg,
    overflow: "hidden",
  },
  deleteActionContainer: {
    backgroundColor: "#FF5C5C",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
  },
  deleteActionButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  budgetCard: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  budgetName: {
    fontSize: 15,
    fontWeight: "600",
  },
  budgetLimit: {
    fontSize: 12,
  },
  spentText: {
    fontSize: 16,
    fontWeight: "700",
  },
  progressBackground: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: Theme.spacing.sm,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  remainingText: {
    fontSize: 11,
    fontWeight: "600",
  },
  remainingValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  createButton: {
    marginVertical: Theme.spacing.md,
    marginBottom: 100,
  },
});

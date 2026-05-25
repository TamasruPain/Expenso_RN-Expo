import { AddTransactionModal } from "@/components/transaction/AddTransactionModal";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useDatabase } from "@/hooks/useDatabase";
import { getIoniconsName } from "@/lib/icons";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { useTransactionStore } from "@/stores/useTransactionStore";
import { TransactionItem } from "@/components/transaction/TransactionItem";
import { Transaction } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { format, isToday, isYesterday } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TransactionsScreen() {
  const [filter, setFilter] = useState<"all" | "expense" | "income">("all");
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const { colors } = useAppTheme();

  const { user } = useAuthStore();
  const { transactions, isLoading } = useTransactionStore();
  const { categories } = useCategoryStore();
  const { deleteTransaction } = useDatabase();

  // Current month totals
  const monthTotals = useMemo(() => {
    const now = new Date();
    const cm = now.getMonth();
    const cy = now.getFullYear();
    const monthTx = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === cm && d.getFullYear() === cy;
    });
    const income = monthTx
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expense = monthTx
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    return { income, expense, total: monthTx.length };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesFilter = filter === "all" || tx.type === filter;
      const category = categories.find((c) => c.id === tx.categoryId);
      const matchesSearch =
        !search ||
        tx.note?.toLowerCase().includes(search.toLowerCase()) ||
        category?.name.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [transactions, filter, search, categories]);

  const sections = useMemo(() => {
    const groups: { [key: string]: any[] } = {};

    filteredTransactions.forEach((tx) => {
      const date = new Date(tx.date);
      let title = format(date, "MMM dd, yyyy");
      if (isToday(date)) title = "Today";
      else if (isYesterday(date)) title = "Yesterday";

      if (!groups[title]) groups[title] = [];

      const category = categories.find((c) => c.id === tx.categoryId);
      groups[title].push({
        ...tx,
        categoryName: category?.name || "Other",
        icon: category?.icon || "ellipsis-horizontal",
      });
    });

    return Object.keys(groups).map((title) => ({
      title,
      data: groups[title],
    }));
  }, [filteredTransactions, categories]);

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Transaction",
      `Delete "${name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteTransaction(id);
          },
        },
      ],
    );
  };

  const handleEdit = (item: any) => {
    setEditingTx({
      id: item.id,
      type: item.type,
      amount: item.amount,
      categoryId: item.categoryId,
      note: item.note,
      date: item.date,
    } as Transaction);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingTx(null);
  };

  const getCurrencySymbol = () => user?.currency_symbol || "$";

  const renderItem = ({ item }: { item: any }) => (
    <TransactionItem
      item={item}
      categoryName={item.categoryName}
      categoryIcon={item.icon}
      currencySymbol={getCurrencySymbol()}
      onPress={() => handleEdit(item)}
      onEdit={() => handleEdit(item)}
      onDelete={() => handleDelete(item.id, item.note || item.categoryName)}
      showActions={true}
    />
  );

  const renderSectionHeader = ({
    section: { title },
  }: {
    section: { title: string };
  }) => (
    <View
      style={[styles.sectionHeader, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        {title}
      </Text>
    </View>
  );

  const FilterPill = ({
    label,
    value,
  }: {
    label: string;
    value: "all" | "expense" | "income";
  }) => (
    <TouchableOpacity
      style={[
        styles.filterPill,
        { borderColor: colors.border },
        filter === value && {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
      ]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[
          styles.filterText,
          {
            color: filter === value ? colors.white : colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Transactions
          </Text>
        </View>

        {/* Month Summary Card */}
        <LinearGradient
          colors={["#8854ffff", "#8fb0ffff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryCard}
        >
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={styles.summaryValue}>
                {getCurrencySymbol()} {monthTotals.income.toLocaleString()}
              </Text>
            </View>
            <View
              style={[
                styles.summaryDivider,
                { backgroundColor: "rgba(255,255,255,0.3)" },
              ]}
            />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Expense</Text>
              <Text style={styles.summaryValue}>
                {getCurrencySymbol()} {monthTotals.expense.toLocaleString()}
              </Text>
            </View>
            <View
              style={[
                styles.summaryDivider,
                { backgroundColor: "rgba(255,255,255,0.3)" },
              ]}
            />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Count</Text>
              <Text style={styles.summaryValue}>{monthTotals.total}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Search Bar */}
        <View
          style={[styles.searchContainer, { backgroundColor: colors.card }]}
        >
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            placeholder="Search transactions..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterContainer}>
          <FilterPill label="All" value="all" />
          <FilterPill label="Expenses" value="expense" />
          <FilterPill label="Income" value="income" />
        </View>

        {/* Transaction List */}
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator
                color={colors.primary}
                style={{ marginTop: 40 }}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="receipt-outline"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text
                  style={[styles.emptyText, { color: colors.textSecondary }]}
                >
                  No transactions found.
                </Text>
                <Text
                  style={[styles.emptySubtext, { color: colors.textSecondary }]}
                >
                  Tap + to add your first transaction
                </Text>
              </View>
            )
          }
        />

        {/* Gradient FAB */}
        <LinearGradient colors={["#8e5dffff", "#96afebff"]} style={styles.fab}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setEditingTx(null);
              setModalVisible(true);
            }}
            style={styles.fabButton}
          >
            <Ionicons name="add" size={32} color="#FFF" />
          </TouchableOpacity>
        </LinearGradient>

        <AddTransactionModal
          visible={modalVisible}
          onClose={handleCloseModal}
          editTransaction={
            editingTx
              ? {
                  id: editingTx.id,
                  type: editingTx.type,
                  amount: editingTx.amount,
                  categoryId: editingTx.categoryId,
                  note: editingTx.note,
                }
              : undefined
          }
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
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  summaryCard: {
    borderRadius: 15,
    padding: 16,
    marginBottom: Theme.spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  summaryValue: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  summaryDivider: {
    width: 1,
    height: 32,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: Theme.spacing.sm,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: Theme.spacing.md,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    paddingVertical: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  transactionItem: {
    borderRadius: 16,
    marginBottom: 10,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  transactionMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  transactionName: {
    fontSize: 15,
    fontWeight: "600",
  },
  transactionSub: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  transactionCategory: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 13,
  },
  fab: {
    position: "absolute",
    bottom: 84,
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

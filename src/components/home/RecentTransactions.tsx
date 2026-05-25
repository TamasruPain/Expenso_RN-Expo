import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { TransactionItem } from "../transaction/TransactionItem";

interface RecentTransactionsProps {
  transactions: any[];
  isLoading: boolean;
  categories: any[];
  currencySymbol?: string;
  onViewAllPress: () => void;
  onTransactionPress?: (item: any) => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  isLoading,
  categories,
  currencySymbol = "$",
  onViewAllPress,
  onTransactionPress,
}) => {
  const { colors } = useAppTheme();

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Other";
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.icon || "medical";
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Transactions
        </Text>
        <TouchableOpacity onPress={onViewAllPress}>
          <Text style={[styles.viewAll, { color: colors.primary }]}>View all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionsList}>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : transactions.length > 0 ? (
          transactions.map((item) => (
            <TransactionItem
              key={item.id}
              item={item}
              categoryName={getCategoryName(item.categoryId)}
              categoryIcon={getCategoryIcon(item.categoryId)}
              currencySymbol={currencySymbol}
              onPress={() => onTransactionPress?.(item)}
            />
          ))
        ) : (
          <Text
            style={[
              styles.emptyText,
              { color: colors.textSecondary },
            ]}
          >
            No transactions yet.
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Theme.spacing.sm,
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
    fontWeight: "600",
  },
  transactionsList: {
    gap: 12,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
});

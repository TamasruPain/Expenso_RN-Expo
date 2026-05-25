import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "@/constants/theme";

interface StatsRowProps {
  dailyAvg: number | string;
  transactionCount: number;
  categoryCount: number;
  currencySymbol?: string;
}

export const StatsRow: React.FC<StatsRowProps> = ({
  dailyAvg,
  transactionCount,
  categoryCount,
  currencySymbol = "$",
}) => {
  return (
    <View style={styles.statsRow}>
      <View style={styles.statCard}>
        <View style={styles.iconValueRow}>
          <Ionicons name="trending-down" size={16} color="#FFF" />
          <Text style={styles.statCardValue} numberOfLines={1}>
            {currencySymbol}{dailyAvg}
          </Text>
        </View>
        <Text style={styles.statCardLabel}>Daily Avg</Text>
      </View>
      <View style={styles.statCard}>
        <View style={styles.iconValueRow}>
          <Ionicons name="receipt" size={16} color="#FFF" />
          <Text style={styles.statCardValue} numberOfLines={1}>
            {transactionCount}
          </Text>
        </View>
        <Text style={styles.statCardLabel}>Transactions</Text>
      </View>
      <View style={styles.statCard}>
        <View style={styles.iconValueRow}>
          <Ionicons name="grid" size={16} color="#FFF" />
          <Text style={styles.statCardValue} numberOfLines={1}>
            {categoryCount}
          </Text>
        </View>
        <Text style={styles.statCardLabel}>Categories</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  iconValueRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  statCardValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
  statCardLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFF",
    marginTop: 2,
  },
});

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Theme } from "@/constants/theme";

interface SpendingSummaryCardProps {
  totalSpent: number;
  totalIncome: number;
  totalBalance: number;
  currentMonthName: string;
  currencySymbol?: string;
  onPress?: () => void;
}

export const SpendingSummaryCard: React.FC<SpendingSummaryCardProps> = ({
  totalSpent,
  totalIncome,
  totalBalance,
  currentMonthName,
  currencySymbol = "$",
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={!onPress}
      style={styles.container}
    >
      <LinearGradient
        colors={["#8854ffff", "#8fb0ffff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>Total spent</Text>
          <Text style={styles.cardMonth}>{currentMonthName}</Text>
        </View>
        <Text style={styles.totalAmount}>
          {currencySymbol} {totalSpent.toLocaleString()}
        </Text>

        <View style={styles.incomeSaveRow}>
          <View style={styles.glassCard}>
            <View
              style={[
                styles.glassIconContainer,
                { backgroundColor: "#b3ffdcff" },
              ]}
            >
              <Ionicons name="cash" size={15} color="#059669" />
            </View>
            <View style={styles.textWrapper}>
              <Text style={styles.glassLabel}>Income</Text>
              <Text style={styles.glassValue} numberOfLines={1}>
                {currencySymbol} {totalIncome.toLocaleString()}
              </Text>
            </View>
          </View>
          <View style={styles.glassCard}>
            <View
              style={[
                styles.glassIconContainer,
                { backgroundColor: "#DBEAFE" },
              ]}
            >
              <Ionicons name="wallet" size={18} color="#2563EB" />
            </View>
            <View style={styles.textWrapper}>
              <Text style={styles.glassLabel}>Save</Text>
              <Text style={styles.glassValue} numberOfLines={1}>
                {currencySymbol} {totalBalance.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.lg,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  gradient: {
    padding: Theme.spacing.md,
    borderRadius: 15,
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
  textWrapper: {
    flex: 1,
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
});

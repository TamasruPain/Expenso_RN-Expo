import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Theme } from "@/constants/theme";

interface BudgetProgressBarProps {
  currentMonthName: string;
  percent: number;
  onPress?: () => void;
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  currentMonthName,
  percent,
  onPress,
}) => {
  const displayPercent = Math.min(Math.max(0, percent), 100);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={!onPress}
      style={styles.container}
    >
      <LinearGradient
        colors={["#7f6effff", "#c6c1efff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.budgetHeader}>
          <Text style={styles.budgetText}>{currentMonthName}</Text>
          <Text style={styles.budgetPercent}>{percent}%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${displayPercent}%` },
            ]}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.lg,
  },
  gradient: {
    padding: Theme.spacing.md,
    borderRadius: 16,
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
});

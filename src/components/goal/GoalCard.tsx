import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { getIoniconsName } from "@/lib/icons";

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  icon?: string;
}

interface GoalCardProps {
  goal: Goal;
  currencySymbol?: string;
  onPress: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  currencySymbol = "₹",
  onPress,
}) => {
  const { colors } = useAppTheme();

  const current = goal.current_amount || 0;
  const target = goal.target_amount || 1;
  const percent = Math.min(100, (current / target) * 100);

  return (
    <TouchableOpacity
      style={[styles.goalCard, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.primarySurface },
          ]}
        >
          <Ionicons
            name={getIoniconsName(goal.icon || "flag")}
            size={24}
            color={colors.primary}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.goalName, { color: colors.text }]}>
            {goal.name}
          </Text>
          <Text style={[styles.goalTarget, { color: colors.textSecondary }]}>
            Target: {currencySymbol}{target.toLocaleString()}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.textSecondary}
        />
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressLabels}>
          <Text style={[styles.progressText, { color: colors.text }]}>
            {currencySymbol}{current.toLocaleString()}
          </Text>
          <Text style={[styles.percentText, { color: colors.primary }]}>
            {percent.toFixed(0)}%
          </Text>
        </View>
        <View
          style={[
            styles.progressBackground,
            { backgroundColor: colors.primarySurface },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.primary, width: `${percent}%` },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  goalCard: {
    padding: 12,
    borderRadius: 16,
    marginBottom: Theme.spacing.md,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Theme.spacing.md,
  },
  headerText: {
    flex: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  goalTarget: {
    fontSize: 12,
  },
  progressSection: {
    marginTop: Theme.spacing.xs,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 6,
  },
  progressText: {
    fontSize: 15,
    fontWeight: "700",
  },
  percentText: {
    fontSize: 13,
    fontWeight: "700",
  },
  progressBackground: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
});

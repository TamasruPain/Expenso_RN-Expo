import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

interface BudgetOverviewRingProps {
  totalBudget: number;
  totalSpent: number;
  currencySymbol?: string;
}

export const BudgetOverviewRing: React.FC<BudgetOverviewRingProps> = ({
  totalBudget,
  totalSpent,
  currencySymbol = "$",
}) => {
  const { colors, isDark } = useAppTheme();

  const radius = 64;
  const strokeWidth = 14;
  const size = (radius + strokeWidth) * 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const percent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const displayPercent = Math.min(100, percent);
  const isOver = totalSpent > totalBudget;

  const strokeLength = (displayPercent / 100) * circumference;
  const strokeOffset = circumference - strokeLength;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          shadowColor: isDark ? "#000" : "#7C5CFC",
        },
      ]}
    >
      <View style={styles.chartWrapper}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G rotation="-90" origin={`${center}, ${center}`}>
            {/* Background Ring */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6"}
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Progress Segment */}
            {totalBudget > 0 && (
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={isOver ? colors.danger : colors.primary}
                strokeWidth={strokeWidth}
                strokeDasharray={`${strokeLength} ${circumference}`}
                strokeDashoffset={0}
                fill="transparent"
                strokeLinecap="round"
              />
            )}
          </G>
        </Svg>

        {/* Center Content */}
        <View style={styles.centerTextContainer}>
          <Text style={[styles.percentText, { color: isOver ? colors.danger : colors.text }]}>
            {Math.round(percent)}%
          </Text>
          <Text style={[styles.labelText, { color: colors.textSecondary }]}>
            Spent
          </Text>
        </View>
      </View>

      {/* Info Details */}
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Text style={[styles.infoVal, { color: colors.text }]}>
            {currencySymbol}{totalSpent.toLocaleString()}
          </Text>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Spent</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.infoItem}>
          <Text style={[styles.infoVal, { color: colors.text }]}>
            {currencySymbol}{totalBudget.toLocaleString()}
          </Text>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Limit</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.xl,
    alignItems: "center",
    marginBottom: Theme.spacing.xl,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  chartWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: 160,
    height: 160,
  },
  centerTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  percentText: {
    fontSize: 28,
    fontWeight: "800",
  },
  labelText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginTop: 2,
  },
  infoContainer: {
    flexDirection: "row",
    marginTop: Theme.spacing.lg,
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
  },
  infoItem: {
    alignItems: "center",
  },
  infoVal: {
    fontSize: 16,
    fontWeight: "700",
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 30,
  },
});

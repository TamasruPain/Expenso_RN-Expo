import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

interface GoalProgressRingProps {
  currentAmount: number;
  targetAmount: number;
  currencySymbol?: string;
}

export const GoalProgressRing: React.FC<GoalProgressRingProps> = ({
  currentAmount,
  targetAmount,
  currencySymbol = "₹",
}) => {
  const { colors, isDark } = useAppTheme();

  const radius = 64;
  const strokeWidth = 12;
  const size = (radius + strokeWidth) * 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const percent = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  const displayPercent = Math.min(100, percent);
  const isCompleted = currentAmount >= targetAmount;

  const strokeLength = (displayPercent / 100) * circumference;

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
            {targetAmount > 0 && (
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={isCompleted ? colors.accent : colors.primary}
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
          <Text style={[styles.percentText, { color: isCompleted ? colors.accent : colors.primary }]}>
            {Math.round(percent)}%
          </Text>
          <Text style={[styles.labelText, { color: colors.textSecondary }]}>
            Reached
          </Text>
        </View>
      </View>

      {/* Detail Grid */}
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Text style={[styles.infoVal, { color: colors.text }]}>
            {currencySymbol}{currentAmount.toLocaleString()}
          </Text>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Saved</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.infoItem}>
          <Text style={[styles.infoVal, { color: colors.text }]}>
            {currencySymbol}{targetAmount.toLocaleString()}
          </Text>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Target</Text>
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
    elevation: 3,
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
    fontSize: 26,
    fontWeight: "800",
  },
  labelText: {
    fontSize: 11,
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
    fontSize: 15,
    fontWeight: "700",
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 24,
  },
});

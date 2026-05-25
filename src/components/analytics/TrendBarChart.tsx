import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

interface BarData {
  label: string;
  amount: number;
}

interface TrendBarChartProps {
  weeklyBars: BarData[];
  maxBar: number;
  currencySymbol?: string;
}

export const TrendBarChart: React.FC<TrendBarChartProps> = ({
  weeklyBars,
  maxBar,
  currencySymbol = "$",
}) => {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.chartCard,
        {
          backgroundColor: colors.card,
          shadowColor: isDark ? "#000" : "#7C5CFC",
        },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Last 7 Days
      </Text>
      <View style={styles.barChartContainer}>
        {weeklyBars.map((bar, i) => {
          const barHeight =
            maxBar > 0 ? Math.max(6, (bar.amount / maxBar) * 120) : 6;
          const isHighest = bar.amount === maxBar && bar.amount > 0;
          return (
            <View key={i} style={styles.barColumn}>
              <Text
                style={[
                  styles.barAmountText,
                  { color: colors.textSecondary },
                ]}
              >
                {bar.amount > 0
                  ? `${currencySymbol}${bar.amount >= 1000 ? `${(bar.amount / 1000).toFixed(1)}k` : bar.amount}`
                  : ""}
              </Text>
              <LinearGradient
                colors={
                  isHighest
                    ? ["#7C5CFC", "#A78BFA"]
                    : isDark
                      ? ["rgba(124,92,252,0.4)", "rgba(124,92,252,0.2)"]
                      : [colors.primarySurface, "#D8CCFF"]
                }
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                  },
                ]}
              />
              <Text
                style={[
                  styles.barLabel,
                  {
                    color: isHighest ? colors.primary : colors.textSecondary,
                    fontWeight: isHighest ? "700" : "500",
                  },
                ]}
              >
                {bar.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartCard: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.xl,
    marginBottom: Theme.spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: Theme.spacing.md,
  },
  barChartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 170,
    marginTop: Theme.spacing.md,
    paddingTop: 20,
  },
  barColumn: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  barAmountText: {
    fontSize: 9,
    fontWeight: "600",
    marginBottom: 4,
  },
  bar: {
    width: "60%",
    borderRadius: 6,
    minHeight: 6,
  },
  barLabel: {
    fontSize: 11,
    marginTop: 8,
  },
});

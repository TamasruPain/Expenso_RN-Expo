import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

interface CategoryData {
  name: string;
  amount: number;
  color: string;
  percent: number;
}

interface CategoryPieChartProps {
  data: CategoryData[];
  totalSpent: number;
  currencySymbol?: string;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  data,
  totalSpent,
  currencySymbol = "$",
}) => {
  const { colors, isDark } = useAppTheme();

  // Filter out items with 0 or very small percent
  const chartData = data.filter((item) => item.amount > 0);

  const radius = 60;
  const strokeWidth = 16;
  const size = (radius + strokeWidth) * 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

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
      <Text style={[styles.title, { color: colors.text }]}>Category Distribution</Text>

      {chartData.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ color: colors.textSecondary }}>No data to show</Text>
        </View>
      ) : (
        <View style={styles.chartContent}>
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

                {/* Segments */}
                {chartData.map((item, index) => {
                  const percentage = item.percent / 100;
                  const strokeLength = percentage * circumference;
                  const strokeOffset = circumference - strokeLength;
                  const rotationOffset = (accumulatedPercent / 100) * circumference;
                  
                  accumulatedPercent += item.percent;

                  return (
                    <Circle
                      key={`segment-${item.name}`}
                      cx={center}
                      cy={center}
                      r={radius}
                      stroke={item.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${strokeLength} ${circumference}`}
                      strokeDashoffset={-rotationOffset}
                      fill="transparent"
                      strokeLinecap="round"
                    />
                  );
                })}
              </G>
            </Svg>

            {/* Centered Total Text */}
            <View style={styles.centerTextContainer}>
              <Text style={[styles.centerLabel, { color: colors.textSecondary }]}>
                Spent
              </Text>
              <Text style={[styles.centerValue, { color: colors.text }]} numberOfLines={1}>
                {currencySymbol}{totalSpent >= 100000 ? `${(totalSpent / 1000).toFixed(0)}k` : totalSpent.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Side Legend */}
          <View style={styles.legendContainer}>
            {chartData.slice(0, 5).map((item) => (
              <View key={`legend-${item.name}`} style={styles.legendItem}>
                <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                <View style={styles.legendTextWrapper}>
                  <Text style={[styles.legendName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.legendPercent, { color: colors.textSecondary }]}>
                    {item.percent}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.xl,
    marginBottom: Theme.spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: Theme.spacing.md,
  },
  emptyState: {
    height: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  chartContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  chartWrapper: {
    position: "relative",
    width: 152,
    height: 152,
    alignItems: "center",
    justifyContent: "center",
  },
  centerTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 80,
  },
  centerLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  centerValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  legendContainer: {
    flex: 1,
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendTextWrapper: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  legendName: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    marginRight: 4,
  },
  legendPercent: {
    fontSize: 12,
    fontWeight: "700",
  },
});

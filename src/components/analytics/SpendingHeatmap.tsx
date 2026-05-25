import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

interface HeatmapItem {
  day: number;
  intensity: number;
  amount: number;
}

interface SpendingHeatmapProps {
  heatmap: HeatmapItem[];
  monthName: string;
  txCount: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HEATMAP_COLS = 7;
const HEATMAP_GAP = 6;
const HEATMAP_PADDING = Theme.spacing.lg * 2 + Theme.spacing.md * 2;
const CELL_SIZE =
  (SCREEN_WIDTH - HEATMAP_PADDING - HEATMAP_GAP * (HEATMAP_COLS - 1)) /
  HEATMAP_COLS;

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const SpendingHeatmap: React.FC<SpendingHeatmapProps> = ({
  heatmap,
  monthName,
  txCount,
}) => {
  const { colors, isDark } = useAppTheme();

  const renderHeatmapCell = (item: HeatmapItem, index: number) => {
    if (item.intensity < 0) {
      return <View key={`blank-${index}`} style={styles.heatmapCellBlank} />;
    }

    const intensityColors = isDark
      ? [
          "rgba(255,255,255,0.04)",
          "rgba(124,92,252,0.25)",
          "rgba(124,92,252,0.45)",
          "rgba(124,92,252,0.70)",
          "rgba(124,92,252,0.95)",
        ]
      : ["#EDE8FF", "#C9B8FF", "#A78BFA", "#8B5CF6", "#7C3AED"];

    const isToday = item.day === new Date().getDate();
    const bgColor = intensityColors[item.intensity];

    return (
      <View
        key={`cell-${item.day}`}
        style={[
          styles.heatmapCell,
          {
            backgroundColor: bgColor,
            borderWidth: isToday ? 2 : 0,
            borderColor: isToday ? colors.primary : "transparent",
          },
        ]}
      >
        <Text
          style={[
            styles.heatmapDayText,
            {
              color:
                item.intensity >= 3
                  ? "#FFF"
                  : item.intensity >= 1
                    ? isDark
                      ? "#DDD"
                      : "#6B21A8"
                    : colors.textSecondary,
              fontWeight: isToday ? "800" : "600",
            },
          ]}
        >
          {item.day}
        </Text>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.heatmapCard,
        {
          backgroundColor: colors.card,
          shadowColor: isDark ? "#000" : "#7C5CFC",
        },
      ]}
    >
      <View style={styles.heatmapHeader}>
        <View>
          <Text style={[styles.heatmapTitle, { color: colors.text }]}>
            Spending Heatmap
          </Text>
          <Text
            style={[
              styles.heatmapSubtitle,
              { color: colors.textSecondary },
            ]}
          >
            {monthName}
          </Text>
        </View>
        <View
          style={[
            styles.heatmapBadge,
            {
              backgroundColor: isDark
                ? "rgba(124,92,252,0.2)"
                : colors.primarySurface,
            },
          ]}
        >
          <Ionicons name="flame" size={14} color={colors.primary} />
          <Text style={[styles.heatmapBadgeText, { color: colors.primary }]}>
            {txCount} txns
          </Text>
        </View>
      </View>

      {/* Weekday labels */}
      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label) => (
          <Text
            key={label}
            style={[styles.weekdayLabel, { color: colors.textSecondary }]}
          >
            {label}
          </Text>
        ))}
      </View>

      {/* Grid */}
      <View style={styles.heatmapGrid}>
        {heatmap.map((item, index) => renderHeatmapCell(item, index))}
      </View>

      {/* Legend */}
      <View style={styles.heatmapLegend}>
        <Text style={[styles.legendText, { color: colors.textSecondary }]}>
          Less
        </Text>
        {[0, 1, 2, 3, 4].map((i) => {
          const legendColors = isDark
            ? [
                "rgba(255,255,255,0.04)",
                "rgba(124,92,252,0.25)",
                "rgba(124,92,252,0.45)",
                "rgba(124,92,252,0.70)",
                "rgba(124,92,252,0.95)",
              ]
            : ["#EDE8FF", "#C9B8FF", "#A78BFA", "#8B5CF6", "#7C3AED"];
          return (
            <View
              key={i}
              style={[
                styles.legendBox,
                { backgroundColor: legendColors[i] },
              ]}
            />
          );
        })}
        <Text style={[styles.legendText, { color: colors.textSecondary }]}>
          More
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heatmapCard: {
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.xl,
    marginBottom: Theme.spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  heatmapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  heatmapTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  heatmapSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  heatmapBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heatmapBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  weekdayRow: {
    flexDirection: "row",
    gap: HEATMAP_GAP,
    marginBottom: 6,
  },
  weekdayLabel: {
    width: CELL_SIZE,
    textAlign: "center",
    fontSize: 10,
    fontWeight: "600",
  },
  heatmapGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: HEATMAP_GAP,
  },
  heatmapCell: {
    width: CELL_SIZE,
    aspectRatio: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  heatmapCellBlank: {
    width: CELL_SIZE,
    aspectRatio: 1,
  },
  heatmapDayText: {
    fontSize: 11,
  },
  heatmapLegend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: Theme.spacing.md,
    gap: 4,
  },
  legendText: {
    fontSize: 10,
    fontWeight: "600",
    marginHorizontal: 4,
  },
  legendBox: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
});

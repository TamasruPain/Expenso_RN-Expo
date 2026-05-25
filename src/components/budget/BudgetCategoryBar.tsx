import React from "react";
import { StyleSheet, View } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";

interface BudgetCategoryBarProps {
  percent: number;
  isOver: boolean;
  categoryColor: string;
}

export const BudgetCategoryBar: React.FC<BudgetCategoryBarProps> = ({
  percent,
  isOver,
  categoryColor,
}) => {
  const { colors, isDark } = useAppTheme();
  const displayPercent = Math.min(100, Math.max(0, percent));

  return (
    <View
      style={[
        styles.progressBackground,
        {
          backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
        },
      ]}
    >
      <View
        style={[
          styles.progressFill,
          {
            width: `${displayPercent}%`,
            backgroundColor: isOver ? colors.danger : categoryColor,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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

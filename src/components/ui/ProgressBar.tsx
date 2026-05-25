import React from "react";
import { StyleSheet, View } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";

interface ProgressBarProps {
  progress: number; // Value between 0 and 1
  color?: string;
  height?: number;
  style?: any;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color,
  height = 8,
  style,
}) => {
  const { colors, isDark } = useAppTheme();
  const displayProgress = Math.min(1, Math.max(0, progress));

  return (
    <View
      style={[
        styles.background,
        {
          height,
          backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#E2E8F0",
        },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            height: "100%",
            width: `${displayProgress * 100}%`,
            backgroundColor: color || colors.primary,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    borderRadius: 4,
    overflow: "hidden",
    width: "100%",
  },
  fill: {
    borderRadius: 4,
  },
});

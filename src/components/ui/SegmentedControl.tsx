import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, LayoutChangeEvent } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

interface SegmentedControlProps {
  values: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  style?: any;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  values,
  selectedIndex,
  onChange,
  style,
}) => {
  const { colors, isDark } = useAppTheme();
  const [containerWidth, setContainerWidth] = useState(0);

  const tabWidth = containerWidth / values.length;

  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const animatedStyle = useAnimatedStyle(() => {
    if (containerWidth === 0) return { opacity: 0 };
    return {
      opacity: 1,
      width: tabWidth - 8,
      transform: [
        {
          translateX: withSpring(selectedIndex * tabWidth + 4, {
            damping: 15,
            stiffness: 100,
          }),
        },
      ],
    };
  }, [selectedIndex, tabWidth, containerWidth]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? "rgba(255,255,255,0.06)"
            : colors.primarySurface,
        },
        style,
      ]}
      onLayout={onLayout}
    >
      {containerWidth > 0 && (
        <Animated.View
          style={[
            styles.slider,
            { backgroundColor: colors.primary },
            animatedStyle,
          ]}
        />
      )}
      {values.map((value, index) => {
        const isSelected = selectedIndex === index;
        return (
          <TouchableOpacity
            key={value}
            style={styles.tab}
            onPress={() => onChange(index)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: isSelected ? "#FFF" : colors.textSecondary,
                  fontWeight: isSelected ? "700" : "500",
                },
              ]}
            >
              {value}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 4,
    borderRadius: Theme.radius.md,
    position: "relative",
    alignItems: "center",
  },
  slider: {
    position: "absolute",
    height: "85%",
    borderRadius: Theme.radius.sm,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  tabText: {
    fontSize: Theme.typography.size.sm,
  },
});

import React, { useEffect } from "react";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withDelay, withSequence } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

interface AchievementToastProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description: string;
  iconName?: string;
  iconColor?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const AchievementToast: React.FC<AchievementToastProps> = ({
  visible,
  onClose,
  title,
  description,
  iconName = "trophy",
  iconColor = "#FFD700",
}) => {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  
  const translateY = useSharedValue(-150);

  useEffect(() => {
    if (visible) {
      // Slide down, wait 3.5 seconds, then slide up and close
      translateY.value = withSequence(
        withSpring(insets.top + 10, { damping: 12 }),
        withDelay(
          3500,
          withSpring(-150, { damping: 12 }, (finished) => {
            if (finished) {
              // Call close callback on JS thread
              onClose();
            }
          })
        )
      );
    } else {
      translateY.value = withSpring(-150);
    }
  }, [visible, insets.top]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          backgroundColor: colors.card,
          shadowColor: isDark ? "#000" : "#7C5CFC",
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(124, 92, 252, 0.15)",
        },
        animatedStyle,
      ]}
    >
      <View style={[styles.iconWrapper, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(124, 92, 252, 0.08)" }]}>
        <Ionicons name={iconName as any} size={28} color={iconColor} />
      </View>
      <View style={styles.textWrapper}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    zIndex: 9999,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 14,
    marginTop: 2,
  },
});

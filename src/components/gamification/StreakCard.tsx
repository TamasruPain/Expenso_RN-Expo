import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

interface StreakCardProps {
  streakCount: number;
  weeklyProgress?: boolean[]; // Array of 7 booleans [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
}

export const StreakCard: React.FC<StreakCardProps> = ({
  streakCount,
  weeklyProgress = [false, false, false, false, false, false, false],
}) => {
  const { colors, isDark } = useAppTheme();
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

  // Get current day of week (0 = Sunday)
  const currentDayIndex = new Date().getDay();

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
      <View style={styles.cardHeader}>
        <View style={styles.leftSection}>
          <LinearGradient
            colors={["#FF5E36", "#FFAE34"]}
            style={styles.fireIconContainer}
          >
            <Ionicons name="flame" size={24} color="#FFF" />
          </LinearGradient>
          <View>
            <Text style={[styles.streakTitle, { color: colors.text }]}>
              {streakCount} Day Streak
            </Text>
            <Text style={[styles.streakSub, { color: colors.textSecondary }]}>
              {streakCount > 0
                ? "Keep logging daily to maintain your momentum!"
                : "Log a transaction today to start a streak!"}
            </Text>
          </View>
        </View>
      </View>

      {/* Week Progress Circles */}
      <View style={styles.weekRow}>
        {weekdays.map((day, index) => {
          const isActive = weeklyProgress[index];
          const isToday = index === currentDayIndex;

          return (
            <View key={index} style={styles.dayCol}>
              <View
                style={[
                  styles.dayBubble,
                  {
                    backgroundColor: isActive
                      ? "#FF5E36"
                      : isToday
                        ? colors.primarySurface
                        : isDark
                          ? "rgba(255,255,255,0.06)"
                          : "#F3F4F6",
                    borderColor: isToday ? "#FF5E36" : "transparent",
                    borderWidth: isToday ? 1.5 : 0,
                  },
                ]}
              >
                {isActive ? (
                  <Ionicons name="checkmark-sharp" size={14} color="#FFF" />
                ) : (
                  <Text
                    style={[
                      styles.dayText,
                      {
                        color: isToday
                          ? colors.primary
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    {day}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.bottomLabel,
                  {
                    color: isToday ? colors.text : colors.textSecondary,
                    fontWeight: isToday ? "700" : "500",
                  },
                ]}
              >
                {isToday ? "Today" : day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.xl,
    marginBottom: Theme.spacing.lg,
    elevation: 3,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  fireIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  streakSub: {
    fontSize: 11,
    marginTop: 2,
    paddingRight: 12,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  dayCol: {
    alignItems: "center",
    gap: 6,
  },
  dayBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 11,
    fontWeight: "600",
  },
  bottomLabel: {
    fontSize: 9,
  },
});

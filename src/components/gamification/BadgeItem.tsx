import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

interface BadgeItemProps {
  name: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
}

export const BadgeItem: React.FC<BadgeItemProps> = ({
  name,
  description,
  icon,
  color,
  earned,
}) => {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.badgeCard,
        { backgroundColor: colors.card, opacity: earned ? 1 : 0.6 },
      ]}
    >
      <View
        style={[
          styles.badgeIconContainer,
          { backgroundColor: earned ? color : colors.primarySurface },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={32}
          color={earned ? colors.white : colors.textSecondary}
        />
      </View>
      <Text style={[styles.badgeName, { color: colors.text }]}>
        {name}
      </Text>
      <Text style={[styles.badgeDesc, { color: colors.textSecondary }]}>
        {description}
      </Text>
      {!earned && (
        <View style={styles.lockedContainer}>
          <Ionicons name="lock-closed" size={14} color={colors.textSecondary} />
          <Text style={[styles.lockedText, { color: colors.textSecondary }]}>
            Locked
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badgeCard: {
    width: "47%",
    padding: 12,
    borderRadius: 16,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom: Theme.spacing.sm,
  },
  badgeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Theme.spacing.sm,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: 10,
    textAlign: "center",
    lineHeight: 14,
  },
  lockedContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  lockedText: {
    fontSize: 10,
    fontWeight: "600",
  },
});

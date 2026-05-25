import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { getIoniconsName } from "@/lib/icons";

interface TransactionItemProps {
  item: {
    id: string;
    type: "income" | "expense";
    amount: number;
    categoryId: string;
    note?: string;
    date: string | Date;
    categoryName?: string;
    icon?: string;
  };
  categoryName?: string;
  categoryIcon?: string;
  currencySymbol?: string;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  item,
  categoryName,
  categoryIcon,
  currencySymbol = "$",
  onPress,
  onEdit,
  onDelete,
  showActions = false,
}) => {
  const { colors } = useAppTheme();

  const name = item.note || categoryName || item.categoryName || "Other";
  const catName = categoryName || item.categoryName || "other";
  const icon = getIoniconsName(categoryIcon || item.icon || "medical");
  const formattedDate = format(new Date(item.date), "do MMM yyyy");
  const formattedTime = format(new Date(item.date), "hh:mm a");

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={styles.mainContent}
        activeOpacity={onPress ? 0.7 : 1}
        onPress={onPress}
      >
        <View style={styles.leftSection}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: colors.primarySurface },
            ]}
          >
            <Ionicons name={icon as any} size={20} color={colors.primary} />
          </View>
          <View style={styles.textWrapper}>
            <Text style={[styles.nameText, { color: colors.text }]} numberOfLines={1}>
              {name}
            </Text>
            <Text style={[styles.subText, { color: colors.textSecondary }]}>
              {catName} • {formattedTime}
            </Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <Text
            style={[
              styles.amountText,
              { color: item.type === "income" ? colors.accent : colors.danger },
            ]}
          >
            {item.type === "income" ? "+" : "-"} {currencySymbol}
            {Math.abs(item.amount).toLocaleString()}
          </Text>
          <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
            {catName.toLowerCase()}
          </Text>
        </View>
      </TouchableOpacity>

      {showActions && (onEdit || onDelete) && (
        <View style={[styles.actionRow, { borderTopColor: colors.border || "rgba(0,0,0,0.06)" }]}>
          {onEdit && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primarySurface }]}
              onPress={onEdit}
            >
              <Ionicons name="pencil" size={14} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>
                Edit
              </Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#FEE2E2" }]}
              onPress={onDelete}
            >
              <Ionicons name="trash" size={14} color="#DC2626" />
              <Text style={[styles.actionText, { color: "#DC2626" }]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    marginBottom: 10,
  },
  mainContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrapper: {
    flex: 1,
  },
  nameText: {
    fontSize: 15,
    fontWeight: "600",
  },
  subText: {
    fontSize: 12,
    marginTop: 2,
  },
  rightSection: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "700",
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useDatabase } from "@/hooks/useDatabase";
import { getIoniconsName } from "@/lib/icons";
import { useGoalStore } from "@/stores/useGoalStore";
import { GoalProgressRing } from "@/components/goal/GoalProgressRing";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GoalDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useAppTheme();
  const { updateGoal, deleteGoal } = useDatabase();
  const { goals } = useGoalStore();

  const goal = goals.find((g) => g.id === id);

  // Savings Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"add" | "withdraw">("add");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!goal) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Goal Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Goal not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const current = goal.current_amount || 0;
  const target = goal.target_amount || 1;
  const percent = Math.min(100, (current / target) * 100);

  const handleDelete = () => {
    Alert.alert(
      "Delete Goal",
      `Are you sure you want to delete the goal "${goal.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await deleteGoal(goal.id);
            if (success) {
              router.back();
            } else {
              Alert.alert("Error", "Failed to delete goal.");
            }
          },
        },
      ]
    );
  };

  const handleOpenSavingsModal = (type: "add" | "withdraw") => {
    setModalType(type);
    setAmount("");
    setModalVisible(true);
  };

  const handleSavingsAction = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    let newAmount = current;
    if (modalType === "add") {
      newAmount += numAmount;
    } else {
      newAmount = Math.max(0, current - numAmount);
    }

    try {
      const success = await updateGoal(goal.id, { current_amount: newAmount });
      if (success) {
        setModalVisible(false);
      } else {
        Alert.alert("Error", "Failed to update savings.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Goal Details
        </Text>
        <TouchableOpacity style={styles.editButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View
            style={[
              styles.iconLarge,
              { backgroundColor: colors.primarySurface },
            ]}
          >
            <Ionicons
              name={getIoniconsName(goal.icon || "flag")}
              size={48}
              color={colors.primary}
            />
          </View>
          <Text style={[styles.goalName, { color: colors.text }]}>
            {goal.name}
          </Text>
          <Text style={[styles.goalStatus, { color: percent >= 100 ? colors.accent : colors.primary }]}>
            {percent >= 100 ? "Completed! 🎉" : "Active Saving ✨"}
          </Text>
        </View>

        <GoalProgressRing
          currentAmount={current}
          targetAmount={target}
          currencySymbol="₹"
        />

        {percent < 100 && (
          <View style={styles.infoSection}>
            <View
              style={[
                styles.suggestionBox,
                { backgroundColor: colors.primarySurface },
              ]}
            >
              <Ionicons name="bulb-outline" size={20} color={colors.primary} />
              <Text style={[styles.suggestionText, { color: colors.text }]}>
                You are ₹{(target - current).toLocaleString()} away from your target. Keep going!
              </Text>
            </View>
          </View>
        )}

        <Button
          title="Add Savings"
          onPress={() => handleOpenSavingsModal("add")}
          style={styles.actionButton}
        />
        <Button
          title="Withdraw"
          variant="outline"
          onPress={() => handleOpenSavingsModal("withdraw")}
          style={styles.actionButton}
        />
      </ScrollView>

      {/* Savings Dialog Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {modalType === "add" ? "Add Savings" : "Withdraw Savings"}
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              {modalType === "add"
                ? "How much would you like to save today?"
                : "How much would you like to withdraw?"}
            </Text>

            <Input
              label="Amount (₹)"
              placeholder="0.00"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              containerStyle={styles.modalInput}
              autoFocus
            />

            <Button
              title={modalType === "add" ? "Confirm Add" : "Confirm Withdraw"}
              onPress={handleSavingsAction}
              loading={isSubmitting}
              style={styles.modalButton}
            />

            <TouchableOpacity onPress={() => setModalVisible(false)} disabled={isSubmitting}>
              <Text style={[styles.cancelText, { color: colors.danger }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: Theme.typography.size.lg,
    fontWeight: "700",
  },
  editButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: Theme.spacing.xxl,
  },
  iconLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Theme.spacing.md,
  },
  goalName: {
    fontSize: Theme.typography.size.xxl,
    fontWeight: "700",
    marginBottom: 4,
  },
  goalStatus: {
    fontSize: Theme.typography.size.sm,
    fontWeight: "600",
  },
  detailCard: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.xl,
    marginBottom: Theme.spacing.xl,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: Theme.spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  percentLarge: {
    fontSize: Theme.typography.size.xl,
    fontWeight: "700",
  },
  progressBg: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: Theme.spacing.lg,
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  infoSection: {
    marginBottom: Theme.spacing.xxl,
  },
  suggestionBox: {
    flexDirection: "row",
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.md,
    alignItems: "center",
    gap: Theme.spacing.md,
  },
  suggestionText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
  },
  actionButton: {
    width: "100%",
    marginBottom: Theme.spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    padding: Theme.spacing.xl,
    borderTopLeftRadius: Theme.radius.xl,
    borderTopRightRadius: Theme.radius.xl,
    minHeight: 320,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: Theme.typography.size.xxl,
    fontWeight: "700",
    marginBottom: Theme.spacing.sm,
  },
  modalSubtitle: {
    fontSize: Theme.typography.size.md,
    textAlign: "center",
    marginBottom: Theme.spacing.xl,
    lineHeight: 22,
  },
  modalInput: {
    marginBottom: Theme.spacing.xl,
    width: "100%",
  },
  modalButton: {
    width: "100%",
    marginBottom: Theme.spacing.lg,
  },
  cancelText: {
    fontSize: Theme.typography.size.md,
    fontWeight: "600",
    padding: Theme.spacing.md,
  },
});

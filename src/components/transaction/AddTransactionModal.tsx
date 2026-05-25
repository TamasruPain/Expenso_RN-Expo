import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useDatabase } from "@/hooks/useDatabase";
import { useAuthStore } from "@/stores/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CategoryGrid } from "./CategoryGrid";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  editTransaction?: {
    id: string;
    type: "income" | "expense";
    amount: number;
    categoryId: string;
    note?: string;
  };
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  visible,
  onClose,
  editTransaction,
}) => {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("1");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addTransaction, updateTransaction } = useDatabase();
  const { user } = useAuthStore();
  const { colors, isDark } = useAppTheme();

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
      backdropAnim.setValue(0);
    }
  }, [visible, slideAnim, backdropAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  // Pre-fill fields when editing
  React.useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(String(editTransaction.amount));
      setSelectedCategory(editTransaction.categoryId);
      setNote(editTransaction.note || "");
    } else {
      setType("expense");
      setAmount("");
      setSelectedCategory("1");
      setNote("");
    }
  }, [editTransaction, visible]);

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      let success;
      if (editTransaction) {
        success = await updateTransaction(editTransaction.id, {
          amount: parseFloat(amount),
          type,
          categoryId: selectedCategory,
          note,
        });
      } else {
        success = await addTransaction({
          amount: parseFloat(amount),
          type,
          categoryId: selectedCategory,
          note,
          date: new Date().toISOString(),
        });
      }

      if (success) {
        setAmount("");
        setNote("");
        onClose();
      } else {
        Alert.alert("Error", "Failed to save transaction. Please try again.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const expenseActive = type === "expense";
  const incomeActive = type === "income";

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        {/* Blur Backdrop */}
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: backdropAnim }]}
        >
          <BlurView
            intensity={40}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
          <Pressable
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.3)",
              },
            ]}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Sheet Content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardView}
        >
          <Animated.View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.card,
                transform: [{ translateY: slideAnim }],
                shadowColor: isDark ? "#000" : "#7C5CFC",
              },
            ]}
          >
            {/* Drag Handle */}
            <View style={styles.handleContainer}>
              <View
                style={[
                  styles.handle,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(0,0,0,0.12)",
                  },
                ]}
              />
            </View>

            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {editTransaction ? "Edit Transaction" : "New Transaction"}
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  {editTransaction
                    ? "Update the details below"
                    : "Track your spending & income"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                style={[
                  styles.closeButton,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.06)",
                  },
                ]}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              {/* Type Switcher */}
              <View
                style={[
                  styles.typeSwitcher,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.06)"
                      : colors.background,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    expenseActive && {
                      backgroundColor: isDark
                        ? "rgba(255, 92, 92, 0.2)"
                        : "#FFF0F0",
                    },
                  ]}
                  onPress={() => setType("expense")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="trending-down"
                    size={16}
                    color={expenseActive ? colors.danger : colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      {
                        color: expenseActive
                          ? colors.danger
                          : colors.textSecondary,
                        fontWeight: expenseActive ? "700" : "500",
                      },
                    ]}
                  >
                    Expense
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    incomeActive && {
                      backgroundColor: isDark
                        ? "rgba(0, 208, 158, 0.15)"
                        : "#E8FFF6",
                    },
                  ]}
                  onPress={() => setType("income")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="trending-up"
                    size={16}
                    color={incomeActive ? colors.accent : colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      {
                        color: incomeActive
                          ? colors.accent
                          : colors.textSecondary,
                        fontWeight: incomeActive ? "700" : "500",
                      },
                    ]}
                  >
                    Income
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Amount Input */}
              <View
                style={[
                  styles.amountContainer,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.06)"
                      : colors.background,
                    borderColor: isDark
                      ? "rgba(124,92,252,0.3)"
                      : "rgba(124,92,252,0.15)",
                  },
                ]}
              >
                <Text style={[styles.currencyLabel, { color: colors.primary }]}>
                  {user?.currency_symbol || "₹"}
                </Text>
                <TextInput
                  style={[styles.amountInput, { color: colors.text }]}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  autoFocus={false}
                />
              </View>

              {/* Category Selection */}
              <View style={styles.sectionContainer}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Category
                </Text>
                <View style={styles.categoryGridContainer}>
                  <CategoryGrid
                    type={type}
                    selectedId={selectedCategory}
                    onSelect={setSelectedCategory}
                    scrollEnabled={true}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>

              {/* Note Input */}
              <View style={styles.sectionContainer}>
                <Input
                  label="Note"
                  placeholder="What was this for?"
                  value={note}
                  onChangeText={setNote}
                  multiline
                  inputStyle={{
                    height: 80,
                    alignItems: "flex-start",
                    paddingTop: 8,
                    borderColor:"white",
                  }}
                />
              </View>

              {/* Submit Button */}
              <Button
                title={
                  isSubmitting
                    ? "Saving..."
                    : editTransaction
                      ? "Update Transaction"
                      : "Add Transaction"
                }
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={styles.submitButton}
              />
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "92%",
    // Shadow
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 24,
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Platform.OS === "ios" ? 40 : Theme.spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.sm,
    paddingBottom: Theme.spacing.md,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  typeSwitcher: {
    flexDirection: "row",
    padding: 4,
    borderRadius: Theme.radius.md,
    marginBottom: Theme.spacing.lg,
    gap: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Theme.radius.sm,
    flexDirection: "row",
  },
  typeText: {
    fontSize: Theme.typography.size.sm,
  },
  amountContainer: {
    height: 80,
    borderRadius: Theme.radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    borderWidth: 1.5,
  },
  currencyLabel: {
    fontSize: 28,
    fontWeight: "700",
    marginRight: 6,
  },
  amountInput: {
    fontSize: 36,
    fontWeight: "700",
    minWidth: 120,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  sectionContainer: {
    marginBottom: Theme.spacing.xs,
  },
  label: {
    fontSize: Theme.typography.size.sm,
    fontWeight: "700",
    marginBottom: Theme.spacing.sm,
  },
  categoryGridContainer: {
    height: 280, // Restrict height so it scrolls within the parent scroll container
  },
  submitButton: {
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    width: "100%",
  },
});

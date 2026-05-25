import { Button } from "@/components/ui/Button";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useDatabase } from "@/hooks/useDatabase";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBudgetStore } from "@/stores/useBudgetStore";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CategoryGrid } from "../transaction/CategoryGrid";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AddBudgetModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddBudgetModal: React.FC<AddBudgetModalProps> = ({
  visible,
  onClose,
}) => {
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { budgets } = useBudgetStore();
  const { upsertBudget } = useDatabase();
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
    ]).start(() => {
      setAmount("");
      setSelectedCategory("1");
      onClose();
    });
  };

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    // Check if budget for category already exists
    const existingBudget = budgets.find(
      (b) => b.categoryId === selectedCategory,
    );

    setIsSubmitting(true);
    const now = new Date();

    await upsertBudget({
      ...(existingBudget ? { id: existingBudget.id } : {}),
      categoryId: selectedCategory,
      amount: numAmount,
      month: now.getMonth(),
      year: now.getFullYear(),
    });

    setIsSubmitting(false);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
            <BlurView
              intensity={isDark ? 40 : 20}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: isDark
                    ? "rgba(0,0,0,0.6)"
                    : "rgba(0,0,0,0.3)",
                },
              ]}
            />
          </Pressable>
        </Animated.View>

        <Animated.View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.background,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandleContainer}>
            <View
              style={[styles.dragHandle, { backgroundColor: colors.border }]}
            />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>
                New Budget
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Set a monthly spending limit
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.card }]}
              onPress={handleClose}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View style={styles.amountContainer}>
            <View
              style={[
                styles.currencyBubble,
                { backgroundColor: colors.primarySurface },
              ]}
            >
              <Text style={[styles.currencySymbol, { color: colors.primary }]}>
                {user?.currency_symbol || "₹"}
              </Text>
            </View>
            <TextInput
              style={[styles.amountInput, { color: colors.text }]}
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>

          {/* Category Selector */}
          <View style={styles.categorySection}>
            <Text
              style={[styles.sectionLabel, { color: colors.textSecondary }]}
            >
              Select Category
            </Text>
            <View style={styles.categoryGridContainer}>
              <CategoryGrid
                type="expense"
                selectedId={selectedCategory}
                onSelect={setSelectedCategory}
                scrollEnabled={true}
                style={{ flex: 1 }}
              />
            </View>
          </View>

          <Button
            title={isSubmitting ? "Saving..." : "Set Budget"}
            onPress={handleSave}
            disabled={!amount || parseFloat(amount) <= 0 || isSubmitting}
            style={styles.saveButton}
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: Theme.spacing.xl,
    paddingTop: Theme.spacing.md,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  dragHandleContainer: {
    alignItems: "center",
    marginBottom: Theme.spacing.lg,
  },
  dragHandle: {
    width: 48,
    height: 5,
    borderRadius: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Theme.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
    paddingBottom: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150,150,150,0.1)",
  },
  currencyBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: "700",
  },
  amountInput: {
    flex: 1,
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: -1,
  },
  categorySection: {
    marginBottom: Theme.spacing.xl,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Theme.spacing.md,
  },
  categoryGridContainer: {
    height: 320, // Restrict height so it scrolls within the modal
  },
  saveButton: {
    marginTop: Theme.spacing.sm,
    marginBottom: Platform.OS === "ios" ? Theme.spacing.lg : 0,
  },
});

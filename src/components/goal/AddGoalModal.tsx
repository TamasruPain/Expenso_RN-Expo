import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useDatabase } from "@/hooks/useDatabase";
import { getIoniconsName } from "@/lib/icons";
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
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const ICONS = ["flag", "airplane", "car", "home", "gift", "trophy", "cafe", "cart", "laptop", "book"];
const COLORS = ["#7C5CFC", "#00D09E", "#FF6B6B", "#4ECDC4", "#FF9F43", "#AB47BC", "#54A0FF", "#1A1A2E"];

interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  visible,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("flag");
  const [selectedColor, setSelectedColor] = useState("#7C5CFC");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addGoal } = useDatabase();
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
      setName("");
      setTargetAmount("");
      setSelectedIcon("flag");
      setSelectedColor("#7C5CFC");
      onClose();
    });
  };

  const handleSave = async () => {
    const numAmount = parseFloat(targetAmount);
    if (!name || isNaN(numAmount) || numAmount <= 0) return;

    setIsSubmitting(true);
    try {
      await addGoal({
        name,
        target_amount: numAmount,
        current_amount: 0,
        icon: selectedIcon,
        color: selectedColor,
      });
      handleClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        {/* Backdrop */}
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: backdropAnim }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
            <BlurView
              intensity={40}
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
            <View style={styles.header}>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>
                  New Goal
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  What are you saving for?
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.06)",
                  },
                ]}
                onPress={handleClose}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              {/* Goal Name Input */}
              <Input
                label="Goal Name"
                placeholder="e.g. New Laptop, Vacation"
                value={name}
                onChangeText={setName}
              />

              {/* Target Amount Input */}
              <Input
                label="Target Amount (₹)"
                placeholder="0.00"
                keyboardType="numeric"
                value={targetAmount}
                onChangeText={setTargetAmount}
              />

              {/* Icon Selector */}
              <Text style={[styles.sectionLabel, { color: colors.text }]}>
                Select Icon
              </Text>
              <View style={styles.iconGrid}>
                {ICONS.map((iconName) => {
                  const isSelected = selectedIcon === iconName;
                  return (
                    <TouchableOpacity
                      key={iconName}
                      style={[
                        styles.iconBubble,
                        {
                          backgroundColor: isSelected
                            ? colors.primarySurface
                            : colors.card,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setSelectedIcon(iconName)}
                    >
                      <Ionicons
                        name={getIoniconsName(iconName)}
                        size={24}
                        color={isSelected ? colors.primary : colors.textSecondary}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Color Selector */}
              <Text style={[styles.sectionLabel, { color: colors.text }]}>
                Select Color
              </Text>
              <View style={styles.colorGrid}>
                {COLORS.map((colorHex) => {
                  const isSelected = selectedColor === colorHex;
                  return (
                    <TouchableOpacity
                      key={colorHex}
                      style={[
                        styles.colorBubble,
                        {
                          backgroundColor: colorHex,
                          borderColor: isSelected ? colors.text : "transparent",
                          borderWidth: isSelected ? 3 : 0,
                        },
                      ]}
                      onPress={() => setSelectedColor(colorHex)}
                    />
                  );
                })}
              </View>

              <Button
                title={isSubmitting ? "Creating..." : "Create Goal"}
                onPress={handleSave}
                disabled={!name || !targetAmount || parseFloat(targetAmount) <= 0 || isSubmitting}
                style={styles.saveButton}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.sm,
    paddingBottom: Theme.spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  subtitle: {
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
  scrollContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Platform.OS === "ios" ? 40 : Theme.spacing.xl,
  },
  sectionLabel: {
    fontSize: Theme.typography.size.sm,
    fontWeight: "700",
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: Theme.spacing.md,
  },
  iconBubble: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: Theme.spacing.xl,
  },
  colorBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  saveButton: {
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    width: "100%",
  },
});

import { AddGoalModal } from "@/components/goal/AddGoalModal";
import { Button } from "@/components/ui/Button";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useDatabase } from "@/hooks/useDatabase";
import { getIoniconsName } from "@/lib/icons";
import { useGoalStore } from "@/stores/useGoalStore";
import { GoalCard } from "@/components/goal/GoalCard";
import { Goal } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GoalsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { fetchGoals } = useDatabase();
  const { goals } = useGoalStore();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const totalSavings = goals.reduce((sum, g) => sum + (g.current_amount || 0), 0);

  const renderGoalItem = ({ item }: { item: Goal }) => (
    <GoalCard
      goal={item}
      currencySymbol="₹"
      onPress={() => router.push(`/goal/${item.id}`)}
    />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Savings Goals
          </Text>
        </View>

        <LinearGradient
          colors={["#8854ff", "#8fb0ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryCard}
        >
          <Text style={styles.summaryLabel}>Total Savings</Text>
          <Text style={styles.summaryValue}>₹ {totalSavings.toLocaleString()}</Text>
          <View style={styles.summaryFooter}>
            <Text style={styles.summaryStats}>
              Across {goals.length} active goals
            </Text>
          </View>
        </LinearGradient>

        <FlatList
          data={goals}
          renderItem={renderGoalItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Active Goals
            </Text>
          }
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: colors.textSecondary, marginTop: 40 }}>
              No active goals. Create one below!
            </Text>
          }
        />

        <Button
          title="Create New Goal"
          onPress={() => setModalVisible(true)}
          style={styles.createButton}
        />
      </View>

      <AddGoalModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  backButton: {
    padding: 8,
    marginRight: Theme.spacing.sm,
  },
  headerTitle: {
    fontSize: Theme.typography.size.lg,
    fontWeight: "700",
  },
  summaryCard: {
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.xl,
    marginBottom: Theme.spacing.xl,
    elevation: 4,
    shadowColor: "#7C5CFC",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: Theme.typography.size.sm,
    fontWeight: "500",
    marginBottom: 4,
  },
  summaryValue: {
    color: "#FFF",
    fontSize: Theme.typography.size.h1 - 4,
    fontWeight: "700",
    marginBottom: Theme.spacing.sm,
  },
  summaryFooter: {
    marginTop: 8,
  },
  summaryStats: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: Theme.typography.size.lg,
    fontWeight: "700",
    marginBottom: Theme.spacing.md,
  },
  listContent: {
    paddingBottom: 20,
  },
  goalCard: {
    padding: 12,
    borderRadius: 16,
    marginBottom: Theme.spacing.md,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Theme.spacing.md,
  },
  headerText: {
    flex: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  goalTarget: {
    fontSize: 12,
  },
  progressSection: {
    marginTop: Theme.spacing.xs,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 6,
  },
  progressText: {
    fontSize: 15,
    fontWeight: "700",
  },
  percentText: {
    fontSize: 13,
    fontWeight: "700",
  },
  progressBackground: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  createButton: {
    marginVertical: Theme.spacing.md,
  },
});

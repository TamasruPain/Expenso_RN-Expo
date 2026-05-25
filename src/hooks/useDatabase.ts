import { useAuthStore } from "@/stores/useAuthStore";
import { useBudgetStore } from "@/stores/useBudgetStore";
import { useCategoryStore } from "@/stores/useCategoryStore";
import { useGamificationStore } from "@/stores/useGamificationStore";
import { useGoalStore } from "@/stores/useGoalStore";
import { useTransactionStore } from "@/stores/useTransactionStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { sendImmediateNotification } from "@/lib/notifications";
import { Badge, Budget, Category, Goal, Transaction } from "@/types";
import { BADGES } from "@/constants/badges";
import { useCallback } from "react";
import { useSupabase } from "./useSupabase";

/**
 * Unified hook for all database interactions.
 * Connects Supabase data layer with Zustand stores.
 */
export function useDatabase() {
  const supabase = useSupabase();
  const { user } = useAuthStore();

  // Store Selectors (Stable Actions)
  const setTransactions = useTransactionStore((state) => state.setTransactions);
  const setTxLoading = useTransactionStore((state) => state.setLoading);
  const addTxToStore = useTransactionStore((state) => state.addTransaction);
  const removeTxFromStore = useTransactionStore(
    (state) => state.removeTransaction,
  );
  const isTxLoading = useTransactionStore((state) => state.isLoading);

  const setBudgets = useBudgetStore((state) => state.setBudgets);
  const setBudgetLoading = useBudgetStore((state) => state.setLoading);
  const isBudgetLoading = useBudgetStore((state) => state.isLoading);

  const setGoals = useGoalStore((state) => state.setGoals);
  const setGoalLoading = useGoalStore((state) => state.setLoading);
  const isGoalLoading = useGoalStore((state) => state.isLoading);

  const setCategories = useCategoryStore((state) => state.setCategories);
  const setCategoryLoading = useCategoryStore((state) => state.setLoading);
  const isCategoryLoading = useCategoryStore((state) => state.isLoading);

  const setBadges = useGamificationStore((state) => state.setBadges);
  const addBadgeToStore = useGamificationStore((state) => state.awardBadge);

  const checkBudgetAlert = useCallback(async (categoryId: string) => {
    const { isNotificationsEnabled } = useSettingsStore.getState();
    if (!isNotificationsEnabled) return;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const { transactions } = useTransactionStore.getState();
    const spent = transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return (
          t.type === "expense" &&
          t.categoryId === categoryId &&
          tDate.getMonth() === currentMonth &&
          tDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const { budgets } = useBudgetStore.getState();
    const budget = budgets.find(
      (b) =>
        b.categoryId === categoryId &&
        b.month === currentMonth &&
        b.year === currentYear
    );

    if (budget) {
      const percentage = (spent / budget.amount) * 100;
      const { categories } = useCategoryStore.getState();
      const category = categories.find((c) => c.id === categoryId);
      const categoryName = category ? category.name : "Category";

      const currencySymbol = useAuthStore.getState().user?.currency_symbol || "₹";

      if (percentage >= 100) {
        await sendImmediateNotification(
          "Budget Blown! 🛑",
          `You have spent ${currencySymbol}${spent.toLocaleString()} of your ${currencySymbol}${budget.amount.toLocaleString()} budget for ${categoryName}.`
        );
      } else if (percentage >= 80) {
        await sendImmediateNotification(
          "Budget Warning! ⚠️",
          `You've spent ${Math.round(percentage)}% (${currencySymbol}${spent.toLocaleString()} of ${currencySymbol}${budget.amount.toLocaleString()}) of your ${categoryName} budget.`
        );
      }
    }
  }, []);

  // --- Transactions ---

  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error.message || JSON.stringify(error));
    }

    if (!error && data) {
      // Map DB column names to FE field names
      const mapped = data.map((row: any) => ({
        ...row,
        categoryId: row.category_id || row.categoryId,
      }));
      setTransactions(mapped as Transaction[]);
    }
    setTxLoading(false);
  }, [supabase, setTransactions, setTxLoading]);

  const addTransaction = async (tx: Omit<Transaction, "id">) => {
    const dbTx = {
      ...tx,
      user_id: user?.clerk_id,
      category_id: tx.categoryId, // Ensure mapping for insert
    };
    delete (dbTx as any).categoryId;

    const { data, error } = await supabase
      .from("transactions")
      .insert([dbTx])
      .select()
      .single();

    if (error) {
      console.error("Error adding transaction:", error.message || JSON.stringify(error));
    }

    if (!error && data) {
      const mapped = {
        ...data,
        categoryId: (data as any).category_id || (data as any).categoryId,
      } as Transaction;
      addTxToStore(mapped);

      // Refresh budgets so spent amounts update immediately
      await fetchBudgets();

      // Trigger budget check if it's an expense
      if (mapped.type === "expense") {
        checkBudgetAlert(mapped.categoryId);
      }

      return data;
    }
    return null;
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (!error) {
      removeTxFromStore(id);
      // Refresh budgets so spent amounts update immediately
      fetchBudgets();
      return true;
    }
    return false;
  };

  const updateTransaction = async (
    id: string,
    updates: Partial<Omit<Transaction, "id">>,
  ) => {
    const dbUpdates: any = { ...updates };
    if (updates.categoryId) {
      dbUpdates.category_id = updates.categoryId;
      delete dbUpdates.categoryId;
    }
    const { data, error } = await supabase
      .from("transactions")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating transaction:", error.message || JSON.stringify(error));
    }

    if (!error && data) {
      // Refresh all transactions and budgets to get clean data
      await fetchTransactions();
      await fetchBudgets();

      const categoryId = updates.categoryId || data.category_id || data.categoryId;
      const type = updates.type || data.type;
      if (categoryId && type === "expense") {
        checkBudgetAlert(categoryId);
      }

      return data;
    }
    return null;
  };

  // --- Budgets ---

  const fetchBudgets = useCallback(async () => {
    setBudgetLoading(true);
    const { data, error } = await supabase.from("budgets").select("*");

    if (error) {
      console.error("Error fetching budgets:", error.message || JSON.stringify(error));
    }

    if (!error && data) {
      // Map DB column names to FE field names
      const mapped = data.map((row: any) => ({
        ...row,
        categoryId: row.category_id || row.categoryId,
      }));
      setBudgets(mapped as Budget[]);
    }
    setBudgetLoading(false);
  }, [supabase, setBudgets, setBudgetLoading]);

  const upsertBudget = async (budget: Omit<Budget, "id"> & { id?: string }) => {
    const dbBudget = {
      ...budget,
      user_id: user?.clerk_id,
      category_id: budget.categoryId,
    };
    delete (dbBudget as any).categoryId;

    let result;

    if (dbBudget.id) {
      // Update existing budget
      const updatePayload = { ...dbBudget };
      delete updatePayload.id;

      result = await supabase
        .from("budgets")
        .update(updatePayload)
        .eq("id", dbBudget.id)
        .select()
        .single();
    } else {
      // Insert new budget
      result = await supabase
        .from("budgets")
        .insert([dbBudget])
        .select()
        .single();
    }

    const { data, error } = result;

    if (error) {
      console.error("Error saving budget:", error.message || JSON.stringify(error));
    }

    if (!error && data) {
      fetchBudgets(); // Refresh all budgets to be safe
      return data;
    }
    return null;
  };

  const deleteBudget = async (id: string) => {
    const { error } = await supabase.from("budgets").delete().eq("id", id);
    if (!error) {
      // Could also update the local store manually, but fetching is safer
      fetchBudgets();
      return true;
    }
    return false;
  };

  // --- Goals ---

  const fetchGoals = useCallback(async () => {
    setGoalLoading(true);
    const { data, error } = await supabase.from("goals").select("*");

    if (error) {
      console.error("Error fetching goals:", error.message || JSON.stringify(error));
    }

    if (!error && data) {
      setGoals(data as Goal[]);
    }
    setGoalLoading(false);
  }, [supabase, setGoals, setGoalLoading]);

  const addGoal = async (goal: Omit<Goal, "id">) => {
    const dbGoal = {
      ...goal,
      user_id: user?.clerk_id,
    };
    const { data, error } = await supabase
      .from("goals")
      .insert([dbGoal])
      .select()
      .single();

    if (error) {
      console.error("Error adding goal:", error.message || JSON.stringify(error));
    }

    if (!error && data) {
      fetchGoals();
      return data;
    }
    return null;
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const { data, error } = await supabase
      .from("goals")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating goal:", error.message || JSON.stringify(error));
    }

    if (!error && data) {
      fetchGoals();
      return data;
    }
    return null;
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) {
      console.error("Error deleting goal:", error.message || JSON.stringify(error));
      return false;
    }
    fetchGoals();
    return true;
  };

  // --- Categories ---

  const fetchCategories = useCallback(async () => {
    setCategoryLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error.message || JSON.stringify(error));
    }

    if (!error && data) {
      setCategories(data as Category[]);
    }
    setCategoryLoading(false);
  }, [supabase, setCategories, setCategoryLoading]);

  // --- Gamification / Badges ---

  const fetchBadges = useCallback(async () => {
    const { data, error } = await supabase.from("badges").select("*");

    if (error) {
      console.error("Error fetching badges:", error.message || JSON.stringify(error));
    }

    if (!error && data) {
      setBadges(data as Badge[]);
    }
  }, [supabase, setBadges]);

  const awardBadge = useCallback(async (badgeType: string) => {
    const dbBadge = {
      badge_type: badgeType,
      user_id: user?.clerk_id,
      earned_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("badges")
      .insert([dbBadge])
      .select()
      .single();

    if (error) {
      console.error("Error awarding badge:", error.message || JSON.stringify(error));
      return null;
    }

    if (data) {
      addBadgeToStore(data as Badge);

      // Trigger badge unlock notification if enabled
      const { isNotificationsEnabled } = useSettingsStore.getState();
      if (isNotificationsEnabled) {
        const badgeDef = BADGES.find((b) => b.id === badgeType);
        if (badgeDef) {
          sendImmediateNotification(
            "New Badge Earned! 🏆",
            `Congratulations! You unlocked the '${badgeDef.name}' badge: ${badgeDef.description}`
          );
        } else {
          sendImmediateNotification(
            "New Badge Earned! 🏆",
            `Congratulations! You unlocked a new achievement!`
          );
        }
      }

      return data;
    }
    return null;
  }, [supabase, user?.clerk_id, addBadgeToStore]);

  // --- Initial Data Loader ---

  const refreshAllData = useCallback(async () => {
    await Promise.all([
      fetchTransactions(),
      fetchBudgets(),
      fetchGoals(),
      fetchCategories(),
      fetchBadges(),
    ]);
  }, [fetchTransactions, fetchBudgets, fetchGoals, fetchCategories, fetchBadges]);

  return {
    refreshAllData,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    fetchBudgets,
    upsertBudget,
    deleteBudget,
    fetchGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    fetchCategories,
    fetchBadges,
    awardBadge,
    isLoading:
      isTxLoading || isBudgetLoading || isGoalLoading || isCategoryLoading,
  };
}

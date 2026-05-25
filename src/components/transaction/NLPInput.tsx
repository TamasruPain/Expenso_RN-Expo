import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface ParsedTransaction {
  type: "income" | "expense";
  amount: number;
  categoryId: string;
  categoryName: string;
  note: string;
  date: string;
}

interface NLPInputProps {
  categories: Category[];
  onAddTransaction: (tx: {
    type: "income" | "expense";
    amount: number;
    categoryId: string;
    note: string;
    date: string;
  }) => Promise<void>;
}

export const NLPInput: React.FC<NLPInputProps> = ({
  categories,
  onAddTransaction,
}) => {
  const { colors, isDark } = useAppTheme();
  const [inputText, setInputText] = useState("");
  const [parsedTx, setParsedTx] = useState<ParsedTransaction | null>(null);

  const handleParse = () => {
    if (!inputText.trim()) return;

    const lowercaseText = inputText.toLowerCase();
    
    // 1. Parse amount: look for numbers
    const amountMatch = inputText.match(/\b\d+(?:\.\d{1,2})?\b/);
    const amount = amountMatch ? parseFloat(amountMatch[0]) : 0;
    
    // 2. Parse type: income vs expense
    const incomeKeywords = [
      "salary", "bonus", "earned", "refund", "deposit", 
      "received", "income", "gift", "dividend", "got"
    ];
    const isIncome = incomeKeywords.some(keyword => lowercaseText.includes(keyword));
    const type = isIncome ? "income" : "expense";
    
    // 3. Parse date
    const date = new Date();
    if (lowercaseText.includes("yesterday")) {
      date.setDate(date.getDate() - 1);
    }
    
    // 4. Parse category
    let categoryId = "";
    let matchedCategoryName = "";
    
    for (const cat of categories) {
      const catNameLower = cat.name.toLowerCase();
      if (lowercaseText.includes(catNameLower)) {
        categoryId = cat.id;
        matchedCategoryName = cat.name;
        break;
      }
    }
    
    if (!categoryId && categories.length > 0) {
      // Default fallback
      const defaultCat = categories.find(c => c.name.toLowerCase() === "other") || categories[0];
      categoryId = defaultCat.id;
      matchedCategoryName = defaultCat.name;
    }
    
    // 5. Parse note
    let note = inputText
      .replace(/\b\d+(?:\.\d{1,2})?\b/g, "")
      .replace(/\b(yesterday|today|spent|spent on|on|for|received|earned|got|added|logged)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
      
    if (note) {
      note = note.charAt(0).toUpperCase() + note.slice(1);
    } else {
      note = matchedCategoryName;
    }

    setParsedTx({
      type,
      amount,
      categoryId,
      categoryName: matchedCategoryName,
      note,
      date: date.toISOString(),
    });
  };

  const handleConfirm = async () => {
    if (!parsedTx || parsedTx.amount <= 0) return;
    await onAddTransaction({
      type: parsedTx.type,
      amount: parsedTx.amount,
      categoryId: parsedTx.categoryId,
      note: parsedTx.note,
      date: parsedTx.date,
    });
    setInputText("");
    setParsedTx(null);
  };

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
      <Text style={[styles.title, { color: colors.text }]}>Quick Log (AI Parser) ✨</Text>
      
      <View style={[styles.inputRow, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6" }]}>
        <TextInput
          placeholder="e.g. Spent 120 on Coffee yesterday"
          placeholderTextColor={colors.textSecondary}
          value={inputText}
          onChangeText={(text) => {
            setInputText(text);
            if (parsedTx) setParsedTx(null); // Clear preview when typing
          }}
          style={[styles.input, { color: colors.text }]}
          onSubmitEditing={handleParse}
          returnKeyType="done"
        />
        <TouchableOpacity
          onPress={handleParse}
          disabled={!inputText.trim()}
          style={[
            styles.parseBtn,
            { backgroundColor: inputText.trim() ? colors.primary : colors.textSecondary + "22" },
          ]}
        >
          <Ionicons name="sparkles" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Parser Preview Overlay */}
      {parsedTx && (
        <View style={[styles.previewContainer, { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(124, 92, 252, 0.05)" }]}>
          <View style={styles.previewHeader}>
            <Text style={[styles.previewTitle, { color: colors.primary }]}>Parsed Transaction Details</Text>
            <TouchableOpacity onPress={() => setParsedTx(null)}>
              <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.previewDetails}>
            <View style={styles.previewRow}>
              <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Type:</Text>
              <Text style={[styles.previewValue, { color: parsedTx.type === "income" ? colors.accent : colors.danger, fontWeight: "700" }]}>
                {parsedTx.type.toUpperCase()}
              </Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Amount:</Text>
              <Text style={[styles.previewValue, { color: colors.text, fontWeight: "700" }]}>
                ${parsedTx.amount}
              </Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Category:</Text>
              <Text style={[styles.previewValue, { color: colors.text }]}>{parsedTx.categoryName}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>Note:</Text>
              <Text style={[styles.previewValue, { color: colors.text }]} numberOfLines={1}>{parsedTx.note}</Text>
            </View>
          </View>

          {parsedTx.amount <= 0 ? (
            <Text style={styles.errorText}>Could not find an amount in text.</Text>
          ) : (
            <TouchableOpacity
              onPress={handleConfirm}
              style={[styles.confirmBtn, { backgroundColor: colors.accent }]}
            >
              <Text style={styles.confirmBtnText}>Log Transaction</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
  title: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: Theme.spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
  },
  parseBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  previewContainer: {
    marginTop: Theme.spacing.md,
    borderRadius: 12,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(124, 92, 252, 0.15)",
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Theme.spacing.xs,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  previewDetails: {
    gap: 4,
    marginBottom: Theme.spacing.md,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  previewValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  confirmBtn: {
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 13,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
});

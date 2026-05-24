import { Badge } from "@/types";

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const BADGES: BadgeDefinition[] = [
  {
    id: "1",
    name: "Early Bird",
    description: "Added first transaction before 8 AM",
    icon: "sunny",
    color: "#FFB800",
  },
  {
    id: "2",
    name: "Budget Master",
    description: "Stayed under budget for 3 consecutive months",
    icon: "trophy",
    color: "#7C5CFC",
  },
  {
    id: "3",
    name: "Super Saver",
    description: "Saved 30% of monthly income",
    icon: "wallet",
    color: "#00D09E",
  },
  {
    id: "4",
    name: "Night Owl",
    description: "Recorded an expense after midnight",
    icon: "moon",
    color: "#3F51B5",
  },
  {
    id: "5",
    name: "Analyst",
    description: "Checked analytics 7 days in a row",
    icon: "trending-up",
    color: "#E91E63",
  },
  {
    id: "6",
    name: "Planner",
    description: "Set 5 different category budgets",
    icon: "calendar",
    color: "#FF5722",
  },
];

export const getBadgeById = (id: string) => BADGES.find((b) => b.id === id);


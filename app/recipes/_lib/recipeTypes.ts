"use client";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type RecipeStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type Ingredient = {
  name: string;
  amount: string;
  unit: string;
};

export type Instruction = {
  step: number;
  description: string;
};

export type Nutrition = {
  calories: number;
  fat: number;
  protein: number;
  carbs: number;
  fiber: number;
  sugar?: number;
  sodium?: number;
};

export type RecipeAuthor = {
  id: string;
  name: string;
  email: string;
};

export type RecipeSummary = {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string | null;
  prepTime: number;
  cookTime: number;
  difficulty: Difficulty;
  servings: number;
  views: number;
  status: RecipeStatus;
  nutrition: Nutrition;
  isFavorited: boolean;
  favoritesCount: number;
  author: RecipeAuthor;
};

export type RecipeDetail = RecipeSummary & {
  ingredients: Ingredient[];
  instructions: Instruction[];
  tags: string[];
  source?: string | null;
};

export const recipeCategoryOptions = ["Soup", "Main Course", "Dessert", "Salad", "Appetizer"] as const;

export const recipeDifficultyOptions: { value: Difficulty; label: string }[] = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
];

export const recipeStatusOptions: { value: RecipeStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];


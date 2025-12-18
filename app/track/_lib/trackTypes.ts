"use client";

export type Gender = "MALE" | "FEMALE";
export type MealDuration = "LESS_THAN_10" | "TEN_TO_TWENTY" | "TWENTY_TO_THIRTY" | "MORE_THAN_30";
export type TexturePreference = "PUREED" | "SOFT_MASHED" | "SEMI_CHUNKY" | "SOLID_FINGER_FOOD";
export type EatingPatternChange = "NO" | "SLIGHTLY" | "MODERATELY" | "SIGNIFICANTLY";
export type WeightEnergyLevel = "NORMAL_WEIGHT" | "WEIGHT_STAGNANT" | "WEIGHT_DECREASING";
export type MealTime = "BREAKFAST" | "LUNCH" | "DINNER";
export type ChildResponse = "FINISHED" | "PARTIALLY" | "REFUSED";

export type Child = {
  id: string;
  name: string;
  photo: string | null;
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  favoriteFood?: string | null;
  hatedFood?: string | null;
  foodAllergies: string[];
  refusalBehaviors: string[];
  mealDuration: MealDuration;
  texturePreference: TexturePreference;
  eatingPatternChange: EatingPatternChange;
  weightEnergyLevel: WeightEnergyLevel;
};

export type MealLog = {
  id: string;
  photo: string | null;
  foodName: string;
  mealTime: MealTime;
  childResponse: ChildResponse;
  notes?: string | null;
  loggedAt: string;
};

export type ChildPayload = Omit<
  Child,
  | "id"
  | "photo"
> & {
  photo?: string | null;
};

export type MealLogPayload = {
  childId: string;
  photo?: string | null;
  foodName: string;
  mealTime: MealTime;
  childResponse: ChildResponse;
  notes?: string | null;
};

export const refusalOptions = [
  { value: "close_mouth", label: "Close mouth" },
  { value: "turn_away", label: "Turn away" },
  { value: "push_spoon", label: "Push the spoon" },
];

export const mealDurationOptions: { value: MealDuration; label: string }[] = [
  { value: "LESS_THAN_10", label: "Under 10 minutes" },
  { value: "TEN_TO_TWENTY", label: "10-20 minutes" },
  { value: "TWENTY_TO_THIRTY", label: "20-30 minutes" },
  { value: "MORE_THAN_30", label: "More than 30 minutes" },
];

export const textureOptions: { value: TexturePreference; label: string }[] = [
  { value: "PUREED", label: "Pureed / very soft" },
  { value: "SOFT_MASHED", label: "Soft / mashed" },
  { value: "SEMI_CHUNKY", label: "Semi chunky" },
  { value: "SOLID_FINGER_FOOD", label: "Solid / finger food" },
];

export const eatingPatternOptions: { value: EatingPatternChange; label: string }[] = [
  { value: "NO", label: "No change" },
  { value: "SLIGHTLY", label: "Slightly decreased" },
  { value: "MODERATELY", label: "Moderately decreased" },
  { value: "SIGNIFICANTLY", label: "Significantly decreased" },
];

export const weightEnergyOptions: { value: WeightEnergyLevel; label: string }[] = [
  { value: "NORMAL_WEIGHT", label: "Normal weight / energy" },
  { value: "WEIGHT_STAGNANT", label: "Weight stagnant" },
  { value: "WEIGHT_DECREASING", label: "Weight decreasing" },
];

export const mealTimeOptions: { value: MealTime; label: string }[] = [
  { value: "BREAKFAST", label: "Breakfast" },
  { value: "LUNCH", label: "Lunch" },
  { value: "DINNER", label: "Dinner" },
];

export const responseOptions: { value: ChildResponse; label: string }[] = [
  { value: "FINISHED", label: "Finished" },
  { value: "PARTIALLY", label: "Partially" },
  { value: "REFUSED", label: "Refused" },
];


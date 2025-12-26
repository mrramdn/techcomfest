import type { ArticleCategory, ArticleStatus } from "./articleTypes";

export const articleCategoryOptions: { value: ArticleCategory; label: string }[] = [
  { value: "FEEDING", label: "Feeding" },
  { value: "NUTRITION", label: "Nutrition" },
  { value: "HEALTH", label: "Health" },
  { value: "DEVELOPMENT", label: "Development" },
  { value: "TIPS", label: "Tips" },
];

export const articleStatusOptions: { value: ArticleStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

export function articleCategoryMeta(category: ArticleCategory): {
  label: string;
  icon: string;
  badgeClass: string;
} {
  switch (category) {
    case "FEEDING":
      return { label: "Feeding & Nutrition", icon: "restaurant", badgeClass: "bg-blue-100 text-blue-700 outline-blue-500" };
    case "NUTRITION":
      return { label: "Nutrition", icon: "local_dining", badgeClass: "bg-green-100 text-green-700 outline-green-500" };
    case "HEALTH":
      return { label: "Health", icon: "health_and_safety", badgeClass: "bg-red-100 text-red-700 outline-red-500" };
    case "DEVELOPMENT":
      return { label: "Development", icon: "child_care", badgeClass: "bg-purple-100 text-purple-700 outline-purple-500" };
    case "TIPS":
      return { label: "Tips", icon: "lightbulb", badgeClass: "bg-yellow-100 text-yellow-800 outline-yellow-500" };
    default:
      return { label: category, icon: "auto_stories", badgeClass: "bg-gray-100 text-gray-700 outline-gray-300" };
  }
}

export function articleCategoryBadgeClass(category: ArticleCategory): string {
  return articleCategoryMeta(category).badgeClass;
}

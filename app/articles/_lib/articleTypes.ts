export type ArticleCategory = "FEEDING" | "NUTRITION" | "HEALTH" | "DEVELOPMENT" | "TIPS";
export type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type ArticleSummary = {
  id: string;
  title: string;
  content: string;
  category: ArticleCategory;
  thumbnailImage: string | null;
  heroImage: string | null;
  views: number;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string; email: string };
  favoritesCount: number;
  isFavorited: boolean;
};


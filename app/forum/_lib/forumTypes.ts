export type ForumPostSummary = {
  id: string;
  content: string;
  author: { id: string; name: string; email: string; profilePicture?: string | null };
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
  likesCount: number;
  score: number;
  isLiked: boolean;
  userVote: number; // -1, 0, 1
  todayComments?: number;
};

export type ForumComment = {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string };
};

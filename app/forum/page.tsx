"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AppLayout, { useUser } from "../_components/AppLayout";
import type { ForumPostSummary } from "./_lib/forumTypes";

function formatCount(value: number) {
  return value > 1000 ? `${(value / 1000).toFixed(1)}K` : String(value);
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "2-digit" });
  } catch {
    return iso;
  }
}

function excerpt(text: string, maxLen: number) {
  const s = text.replace(/\s+/g, " ").trim();
  return s.length > maxLen ? `${s.slice(0, maxLen)}…` : s;
}

export default function ForumPage() {
  return (
    <AppLayout>
      <ForumContent />
    </AppLayout>
  );
}

function ForumContent() {
  const user = useUser();
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const [posts, setPosts] = useState<ForumPostSummary[]>([]);
  const [trending, setTrending] = useState<ForumPostSummary[]>([]);
  const [view, setView] = useState<"all" | "mine">("all");
  const [content, setContent] = useState("");

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch(view === "mine" ? "/api/forum?mine=true" : "/api/forum");
      if (!res.ok) return;
      const data = await res.json();
      setPosts(data.posts ?? []);
    } catch (error) {
      console.error("Error fetching forum posts:", error);
    }
  }, [view]);

  const fetchTrending = useCallback(async () => {
    try {
      const res = await fetch("/api/forum/trending");
      if (!res.ok) return;
      const data = await res.json();
      setTrending(data.posts ?? []);
    } catch (error) {
      console.error("Error fetching trending posts:", error);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchPosts(), fetchTrending()]);
    } finally {
      setLoading(false);
    }
  }, [fetchPosts, fetchTrending]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const vote = async (postId: string, value: 1 | -1) => {
    try {
      const res = await fetch(`/api/forum/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, userVote: data.userVote, score: data.score } : p)),
      );
      setTrending((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, userVote: data.userVote, score: data.score } : p)),
      );
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/forum/${postId}/like`, { method: "POST" });
      if (!res.ok) return;
      const data = await res.json();
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, isLiked: data.isLiked, likesCount: data.likesCount } : p,
        ),
      );
      setTrending((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, isLiked: data.isLiked, likesCount: data.likesCount } : p,
        ),
      );
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const submitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setPosting(true);
    try {
      const res = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      if (!res.ok) return;
      setContent("");
      await refreshAll();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setPosting(false);
    }
  };

  const hasTrending = trending.length > 0;

  if (loading) {
    return (
      <div className="p-16 pt-8 pb-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading forum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-13 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Create post */}
            <div className="bg-white rounded-2xl outline outline-offset-1 outline-gray-300 p-4">
              <form onSubmit={submitPost} className="flex items-center gap-4">
                <div className="flex-1 bg-gray-100 rounded-xl px-4 py-3">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={1}
                    placeholder="Share your journey..."
                    className="w-full bg-transparent outline-none resize-none text-gray-700 text-sm leading-5"
                  />
                </div>
                <button
                  type="submit"
                  disabled={posting || !content.trim()}
                  className="px-4 py-3.5 bg-blue-500 rounded-xl text-slate-50 text-sm font-medium leading-5 disabled:opacity-50"
                >
                  {posting ? "Creating..." : "Create Post"}
                </button>
              </form>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl outline outline-offset-1 outline-gray-200">
                  <button
                    type="button"
                    onClick={() => setView("all")}
                    className={`h-9 px-3 rounded-lg text-sm ${
                      view === "all" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("mine")}
                    className={`h-9 px-3 rounded-lg text-sm ${
                      view === "mine" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    My posts
                  </button>
                </div>

                <button
                  type="button"
                  onClick={fetchPosts}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Posts */}
            {posts.length === 0 ? (
              <div className="bg-white rounded-2xl outline outline-offset-1 outline-gray-300 p-6">
                <p className="text-gray-600">No posts yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <ForumPostCard
                    key={post.id}
                    post={post}
                    canManage={post.author.id === user?.id || user?.role === "ADMIN"}
                    onUpvote={() => vote(post.id, 1)}
                    onDownvote={() => vote(post.id, -1)}
                    onToggleLike={() => toggleLike(post.id)}
                    onDeleted={async () => {
                      await fetchPosts();
                      await fetchTrending();
                    }}
                    onUpdated={async () => {
                      await fetchPosts();
                      await fetchTrending();
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white rounded-2xl outline outline-offset-1 outline-gray-300 p-5">
              <div className="flex items-center justify-between">
                <div className="text-gray-900 text-xl font-semibold leading-8">Today’s Trending</div>
                <button
                  type="button"
                  onClick={fetchTrending}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Refresh
                </button>
              </div>

              <div className="mt-4">
                {!hasTrending ? (
                  <div className="text-sm text-gray-600">No trending posts yet.</div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {trending.map((t, idx) => (
                      <div key={t.id} className="flex flex-col gap-2.5">
                        <Link href={`/forum/${t.id}`} className="flex flex-col">
                          <div className="text-gray-900 text-sm font-medium leading-5 line-clamp-2">
                            {excerpt(t.content, 90)}
                          </div>
                          <div className="text-gray-500 text-xs font-medium leading-4">
                            {formatCount(t.todayComments ?? t.commentsCount)} reply
                            {((t.todayComments ?? t.commentsCount) || 0) === 1 ? "" : "ies"}
                          </div>
                        </Link>
                        {idx !== trending.length - 1 && (
                          <div className="h-0 outline outline-offset-1 outline-gray-200" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ForumPostCard({
  post,
  canManage,
  onUpvote,
  onDownvote,
  onToggleLike,
  onDeleted,
  onUpdated,
}: {
  post: ForumPostSummary;
  canManage: boolean;
  onUpvote: () => void;
  onDownvote: () => void;
  onToggleLike: () => void;
  onDeleted: () => void;
  onUpdated: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.content);

  const submitEdit = async () => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    try {
      const res = await fetch(`/api/forum/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      if (!res.ok) return;
      setEditing(false);
      await onUpdated();
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const deletePost = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch(`/api/forum/${post.id}`, { method: "DELETE" });
      if (!res.ok) return;
      await onDeleted();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const userInitial = post.author?.name?.trim()?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="bg-white rounded-2xl outline outline-offset-1 outline-gray-300 overflow-hidden">
      <div className="p-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="inline-flex justify-start items-center gap-5">
            <div className="size-14 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
              <span className="text-gray-700 font-semibold">{userInitial}</span>
            </div>
            <div className="inline-flex flex-col justify-start items-start gap-0.5">
              <div className="text-gray-900 text-sm font-semibold leading-5">{post.author.name}</div>
              <div className="text-gray-500 text-xs font-medium leading-4">{formatDate(post.createdAt)}</div>
            </div>
          </div>

          {canManage && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="size-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-xl text-gray-600">more_horiz</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(true);
                      setMenuOpen(false);
                      setEditText(post.content);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      deletePost();
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="mt-4">
          {editing ? (
            <div className="space-y-3">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-gray-100 rounded-xl outline-none text-gray-900 text-sm leading-5"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitEdit}
                  disabled={!editText.trim()}
                  className="px-3 py-2 rounded-xl bg-blue-500 text-slate-50 text-sm font-medium disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <Link href={`/forum/${post.id}`} className="block text-justify text-gray-900 text-sm font-medium leading-5">
              {excerpt(post.content, 420)}
            </Link>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <Link href={`/forum/${post.id}`} className="inline-flex items-center gap-1 hover:text-gray-800">
              <span className="material-symbols-outlined text-base text-gray-500" style={{ fontVariationSettings: "'FILL' 0" }}>
                chat_bubble
              </span>
              <span>{formatCount(post.commentsCount)}</span>
            </Link>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleLike();
              }}
              className="inline-flex items-center gap-1 hover:text-gray-800"
              title="Like"
            >
              <span
                className={`material-symbols-outlined text-base ${post.isLiked ? "text-red-500" : "text-gray-500"}`}
                style={{ fontVariationSettings: post.isLiked ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
              <span>{formatCount(post.likesCount)}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onUpvote();
              }}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1 ${
                post.userVote === 1
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 0" }}>
                thumb_up
              </span>
              <span>{formatCount(post.score)}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDownvote();
              }}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium inline-flex items-center ${
                post.userVote === -1
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 0" }}>
                thumb_down
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

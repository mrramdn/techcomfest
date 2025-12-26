"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppLayout, { useUser } from "@/app/_components/AppLayout";
import BackLink from "@/app/_components/BackLink";
import type { ForumComment, ForumPostSummary } from "../_lib/forumTypes";

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatCount(value: number) {
  return value > 1000 ? `${(value / 1000).toFixed(1)}K` : String(value);
}

export default function ForumPostDetailPage() {
  return (
    <AppLayout>
      <ForumPostDetailContent />
    </AppLayout>
  );
}

function ForumPostDetailContent() {
  const user = useUser();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<ForumPostSummary | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");

  const fetchPost = useCallback(async () => {
    const res = await fetch(`/api/forum/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return (data.post ?? null) as ForumPostSummary | null;
  }, [id]);

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/forum/${id}/comments`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.comments ?? []) as ForumComment[];
  }, [id]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([fetchPost(), fetchComments()]);
      setPost(p);
      setComments(c);
    } finally {
      setLoading(false);
    }
  }, [fetchComments, fetchPost]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!post) return;
    setEditText(post.content);
  }, [post]);

  const vote = async (value: 1 | -1) => {
    try {
      const res = await fetch(`/api/forum/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setPost((prev) =>
        prev ? { ...prev, userVote: data.userVote, score: data.score } : prev
      );
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const toggleLike = async () => {
    try {
      const res = await fetch(`/api/forum/${id}/like`, { method: "POST" });
      if (!res.ok) return;
      const data = await res.json();
      setPost((prev) =>
        prev
          ? { ...prev, isLiked: data.isLiked, likesCount: data.likesCount }
          : prev
      );
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) return;

    setPostingComment(true);
    try {
      const res = await fetch(`/api/forum/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      if (!res.ok) return;
      setCommentText("");
      await refresh();
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setPostingComment(false);
    }
  };

  const commentsCount = useMemo(
    () => post?.commentsCount ?? comments.length,
    [comments.length, post?.commentsCount]
  );
  const canManage =
    !!post && !!user && (user.role === "ADMIN" || post.author.id === user.id);

  if (loading) {
    return (
      <div className="p-16 pt-8 pb-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full px-5 py-4">
          <BackLink href="/forum" label="Forum" />
        </div>
        <div className="max-w-3xl mx-auto px-5 pb-16">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-gray-600">Post not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-5 py-4">
        <BackLink href="/forum" label="Forum" />
      </div>
      <div className="max-w-3xl mx-auto px-5 pb-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6 mb-6">
          <div className="space-y-4">
            <div className="text-xs text-gray-500">
              {post.author.name} · {formatDateTime(post.createdAt)}
            </div>
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
                    onClick={() => {
                      setEditing(false);
                      setEditText(post.content);
                    }}
                    className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const trimmed = editText.trim();
                      if (!trimmed) return;
                      const res = await fetch(`/api/forum/${id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ content: trimmed }),
                      });
                      if (res.ok) {
                        setEditing(false);
                        await refresh();
                      }
                    }}
                    disabled={!editText.trim()}
                    className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-900 text-base md:text-lg leading-7 whitespace-pre-wrap">
                {post.content}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <button
                  type="button"
                  onClick={toggleLike}
                  className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                >
                  <span
                    className={`material-symbols-outlined text-base ${
                      post.isLiked ? "text-red-500" : "text-gray-500"
                    }`}
                    style={{
                      fontVariationSettings: post.isLiked
                        ? "'FILL' 1"
                        : "'FILL' 0",
                    }}
                  >
                    favorite
                  </span>
                  <span>{formatCount(post.likesCount)}</span>
                </button>

                <div className="flex items-center gap-1">
                  <span
                    className="material-symbols-outlined text-base text-gray-500"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    chat_bubble
                  </span>
                  <span>{formatCount(commentsCount)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => vote(1)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1 ${
                    post.userVote === 1
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-base"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    thumb_up
                  </span>
                  <span>{formatCount(post.score)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => vote(-1)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium inline-flex items-center ${
                    post.userVote === -1
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-base"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    thumb_down
                  </span>
                </button>

                {/* Manage menu */}
                {canManage && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMenuOpen((v) => !v)}
                      className="size-9 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                      title="More"
                    >
                      <span className="material-symbols-outlined text-xl text-gray-600">
                        more_horiz
                      </span>
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(true);
                            setMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            setMenuOpen(false);
                            if (!confirm("Delete this post?")) return;
                            const res = await fetch(`/api/forum/${id}`, {
                              method: "DELETE",
                            });
                            if (res.ok) router.push("/forum");
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
            </div>
          </div>

          <div className="pt-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Comments
            </h2>
            <form onSubmit={submitComment} className="space-y-3 mb-6">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                placeholder="Write a comment..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={postingComment || !commentText.trim()}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {postingComment ? "Posting..." : "Comment"}
                </button>
              </div>
            </form>

            {comments.length === 0 ? (
              <div className="text-sm text-gray-600">No comments yet.</div>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4"
                  >
                    <div className="text-xs text-gray-500 mb-2">
                      {c.user.name} · {formatDateTime(c.createdAt)}
                    </div>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap">
                      {c.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

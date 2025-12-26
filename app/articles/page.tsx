"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AppLayout, { useUser } from "../_components/AppLayout";
import type { ArticleSummary } from "./_lib/articleTypes";
import { articleCategoryMeta, articleCategoryOptions } from "./_lib/articleOptions";

function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function formatCount(value: number) {
  return value > 1000 ? `${(value / 1000).toFixed(1)}K` : String(value);
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

function ArticlesContent() {
  const user = useUser();
  if (user?.role === "ADMIN") {
    return <AdminArticles />;
  }

  return <UserArticles />;
}

function AdminArticles() {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const didMountRef = useRef(false);
  const [category, setCategory] = useState<string>("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchArticles = useCallback(async (args: { search: string; category: string; from: string; to: string }) => {
    try {
      const params = new URLSearchParams();
      const trimmedSearch = args.search.trim();
      if (trimmedSearch) params.set("search", trimmedSearch);
      if (args.category) params.set("category", args.category);
      if (args.from) params.set("from", args.from);
      if (args.to) params.set("to", args.to);
      const url = params.toString() ? `/api/articles?${params.toString()}` : "/api/articles";
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setArticles(data.articles ?? []);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    try {
      setDeletingId(id);
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        alert(err?.error || "Failed to delete article");
        return;
      }
      await fetchArticles({ search, category, from, to });
    } catch (error) {
      console.error("Error deleting article:", error);
      alert("Failed to delete article");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchArticles({ search: "", category: "", from: "", to: "" });
  }, [fetchArticles]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    const t = setTimeout(() => {
      fetchArticles({ search, category, from, to });
    }, 250);
    return () => clearTimeout(t);
  }, [fetchArticles, search, category, from, to]);

  if (loading) {
    return (
      <div className="p-16 pt-8 pb-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Articles</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">Create, edit, and manage all articles</p>
          </div>
          <Link
            href="/articles/create"
            className="bg-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 text-sm md:text-base whitespace-nowrap"
          >
            <span className="text-xl">+</span>
            Create New Article
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm md:text-base md:col-span-2"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm md:text-base"
            >
              <option value="">All categories</option>
              {articleCategoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm md:text-base"
              />
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm md:text-base"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-160">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {articles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 md:px-6 py-8 md:py-12 text-center text-gray-500 text-sm md:text-base">
                      No articles found
                    </td>
                    </tr>
                  ) : (
                    articles.map((article) => (
                      <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={article.thumbnailImage || article.heroImage || "/images/icon/logo.png"}
                              alt={article.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-72">
                              {article.title}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-72">
                              {new Date(article.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        {(() => {
                          const meta = articleCategoryMeta(article.category);
                          return (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium outline -outline-offset-1 ${meta.badgeClass}`}
                        >
                          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>
                            {meta.icon}
                          </span>
                          {meta.label}
                        </span>
                          );
                        })()}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <span className="text-sm text-gray-700">{article.status}</span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <span className="text-sm text-gray-700">{article.views}</span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4">
                        <span className="text-sm text-gray-700">{article.author?.name ?? "—"}</span>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/articles/${article.id}`}
                            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            View
                          </Link>
                          <Link
                            href={`/articles/edit/${article.id}`}
                            className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            disabled={deletingId === article.id}
                            onClick={() => handleDelete(article.id)}
                            className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            {deletingId === article.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserArticles() {
  const user = useUser();
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [favoriteArticles, setFavoriteArticles] = useState<ArticleSummary[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [expanded, setExpanded] = useState({ category: false, date: false });

  const recentDays = useMemo(() => {
    const days: string[] = [];
    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }, []);

  const fetchArticles = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategories.length > 0) params.set("category", selectedCategories.join(","));
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const url = params.toString() ? `/api/articles?${params.toString()}` : "/api/articles";
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      setArticles(data.articles ?? []);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  }, [from, selectedCategories, to]);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await fetch("/api/articles?favorites=true");
      if (!res.ok) return;
      const data = await res.json();
      setFavoriteArticles(data.articles ?? []);
    } catch (error) {
      console.error("Error fetching favorite articles:", error);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArticles();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchArticles]);

  useEffect(() => {
    if (user) fetchFavorites();
  }, [fetchFavorites, user]);

  const toggleFavorite = async (articleId: string) => {
    try {
      const response = await fetch(`/api/articles/${articleId}/favorite`, { method: "POST" });
      if (!response.ok) return;
      await fetchArticles();
      if (user) await fetchFavorites();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const byId = useMemo(() => new Map(articles.map((a) => [a.id, a])), [articles]);
  const mergedFavorites = useMemo(() => favoriteArticles.map((fav) => byId.get(fav.id) ?? fav), [byId, favoriteArticles]);

  const clearFilters = () => {
    setSelectedCategories([]);
    setFrom("");
    setTo("");
    setExpanded({ category: false, date: false });
  };

  if (loading) {
    return (
      <div className="p-16 pt-8 pb-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Sidebar Filter */}
      <div className="w-full lg:w-64 lg:min-h-screen border-b lg:border-b-0 lg:border-r border-gray-200 pr-0 bg-white">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <div className="p-6 pb-0 pt-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-500">Filter</h2>
            <button onClick={clearFilters} className="text-sm text-blue-500 hover:text-blue-600">
              Clear all
            </button>
          </div>
        </div>

        <div className="space-y-2 px-5 pb-6">
          {/* Category */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setExpanded((p) => ({ ...p, category: !p.category }))}
              className="h-10 px-3 py-2 rounded-lg flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-gray-700">auto_stories</span>
                <span className="text-sm text-gray-700">Category</span>
              </div>
              <span className="material-symbols-outlined text-base text-gray-700">
                {expanded.category ? "expand_less" : "expand_more"}
              </span>
            </button>
            {expanded.category && (
              <div className="flex flex-col gap-2 pl-3">
                {articleCategoryOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(opt.value)}
                      onChange={() => {
                        setSelectedCategories((prev) =>
                          prev.includes(opt.value) ? prev.filter((c) => c !== opt.value) : [...prev, opt.value],
                        );
                      }}
                      className="w-4 h-4 rounded border-gray-300 accent-primary-500"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Date */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setExpanded((p) => ({ ...p, date: !p.date }))}
              className="h-10 px-3 py-2 rounded-lg flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-gray-700">calendar_month</span>
                <span className="text-sm text-gray-700">Date</span>
              </div>
              <span className="material-symbols-outlined text-base text-gray-700">
                {expanded.date ? "expand_less" : "expand_more"}
              </span>
            </button>
            {expanded.date && (
              <div className="flex flex-col gap-3 pl-3">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {recentDays.map((d) => {
                    const active = from === d && to === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setFrom(d);
                          setTo(d);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200"
                        }`}
                      >
                        {d.slice(5)}
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                  />
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 bg-gray-50">
        <div className="w-full">
          {user && mergedFavorites.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-5">My Favorite Articles</h2>
              <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {mergedFavorites.map((article) => (
                  <ArticleCard key={article.id} article={article} onToggleFavorite={() => toggleFavorite(article.id)} />
                ))}
              </div>
            </div>
          )}

          {articles.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600">No articles found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} onToggleFavorite={() => toggleFavorite(article.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ArticleCard({
  article,
  onToggleFavorite,
}: {
  article: ArticleSummary;
  onToggleFavorite: () => void;
}) {
  const imageSrc = article.thumbnailImage || article.heroImage || "/images/icon/logo.png";
  const excerpt = stripHtml(article.content).slice(0, 140);
  const categoryMeta = articleCategoryMeta(article.category);

  return (
    <div className="w-full h-96 p-5 bg-white rounded-3xl outline -outline-offset-1 outline-gray-200 flex justify-start items-center gap-2.5 hover:shadow-md transition-shadow">
      <div className="flex-1 self-stretch flex flex-col gap-3">
        <Link
          href={`/articles/${article.id}`}
          className="self-stretch flex-1 relative rounded-lg overflow-hidden bg-slate-100"
        >
          <Image src={imageSrc} alt={article.title} fill className="object-cover" />
        </Link>

        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          <div
            className={`px-2 py-0 rounded-md outline outline-offset-1 inline-flex items-center gap-1.5 ${categoryMeta.badgeClass}`}
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>
              {categoryMeta.icon}
            </span>
            <div className="justify-start text-xs font-medium leading-4">{categoryMeta.label}</div>
          </div>

          <Link href={`/articles/${article.id}`} className="self-stretch flex flex-col justify-start items-start gap-1">
            <div className="self-stretch justify-start text-gray-700 text-lg font-medium leading-7 line-clamp-2">
              {article.title}
            </div>
            <div className="self-stretch justify-start text-gray-400 text-xs font-normal leading-4 line-clamp-2">
              {excerpt}
            </div>
          </Link>

          <div className="self-stretch inline-flex items-center gap-2 text-xs text-gray-500">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="relative z-10 pointer-events-auto inline-flex items-center gap-1 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <span
                className={`material-symbols-outlined text-base ${article.isFavorited ? "text-red-500" : "text-gray-500"}`}
                style={{ fontVariationSettings: article.isFavorited ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
              <span>{formatCount(article.favoritesCount)}</span>
            </button>

            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base text-gray-500" style={{ fontVariationSettings: "'FILL' 0" }}>
                visibility
              </span>
              <span>{formatCount(article.views)}</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-base text-gray-500" style={{ fontVariationSettings: "'FILL' 0" }}>
                calendar_today
              </span>
              <span>{formatDate(article.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ArticlesPage() {
  return (
    <AppLayout>
      <ArticlesContent />
    </AppLayout>
  );
}

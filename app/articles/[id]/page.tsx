"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import AppLayout from "@/app/_components/AppLayout";
import type { ArticleSummary } from "../_lib/articleTypes";
import { articleCategoryMeta } from "../_lib/articleOptions";
import BackLink from "@/app/_components/BackLink";

function formatCount(value: number) {
  return value > 1000 ? `${(value / 1000).toFixed(1)}K` : String(value);
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

function isLikelyHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export default function ArticleDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [article, setArticle] = useState<ArticleSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/articles/${id}`);
      if (!response.ok) {
        setArticle(null);
        return;
      }
      const data = await response.json();
      setArticle(data.article ?? null);
    } catch (error) {
      console.error("Error fetching article:", error);
      setArticle(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const toggleFavorite = async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/articles/${id}/favorite`, { method: "POST" });
      if (!response.ok) return;
      await fetchDetail();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const heroSrc = article?.heroImage || article?.thumbnailImage || "/images/landing/bg.png";
  const categoryMeta = article ? articleCategoryMeta(article.category) : null;
  const categoryClass = categoryMeta?.badgeClass ?? "bg-gray-100 text-gray-700 outline-gray-300";

  if (loading) {
    return (
      <AppLayout>
        <div className="p-16 pt-8 pb-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading article...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!article) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-slate-50">
          <div className="w-full max-w-7xl mx-auto px-5 py-4">
            <BackLink href="/articles" label="Articles" />
          </div>
          <div className="max-w-3xl mx-auto px-5 pb-16">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600">Article not found.</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50 overflow-hidden">
        <div className="w-full mx-auto inline-flex flex-col justify-start items-center">
          <div className="w-full max-w-7xl self-stretch px-5 py-4 inline-flex justify-start items-center gap-4">
            <BackLink href="/articles" label="Articles" className="max-w-72" />
          </div>

          <div className="w-full max-w-7xl px-5 pb-16 flex flex-col justify-start items-center">
            <div className="w-full max-w-7x flex flex-col justify-start items-center gap-20">
              <div className="w-full max-w-186 flex flex-col justify-start items-center gap-8">
                <div
                  className={`px-2 py-1 rounded-md outline -outline-offset-1 inline-flex justify-center items-center gap-2.5 ${categoryClass}`}
                >
                  <div className="flex justify-start items-center gap-1">
                    <span
                      className="material-symbols-outlined text-xl"
                      style={{ fontVariationSettings: "'FILL' 0" }}
                    >
                      {categoryMeta?.icon ?? "auto_stories"}
                    </span>
                    <div className="justify-start text-base font-medium leading-6">
                      {categoryMeta?.label ?? article.category}
                    </div>
                  </div>
                </div>

                <div className="self-stretch text-center justify-start text-gray-900 text-4xl font-semibold leading-10">
                  {article.title}
                </div>

                <div className="self-stretch text-center justify-start text-gray-500 text-lg font-medium leading-7">
                  {formatDate(article.createdAt)}
                </div>

                <div className="flex justify-center items-center gap-4">
                  <button
                    type="button"
                    onClick={toggleFavorite}
                    className="flex justify-start items-center gap-1.5 hover:opacity-70 transition-opacity"
                  >
                    <span
                      className={`material-symbols-outlined text-base ${
                        article.isFavorited ? "text-red-500" : "text-gray-500"
                      }`}
                      style={{ fontVariationSettings: article.isFavorited ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      favorite
                    </span>
                    <div className="justify-start text-gray-500 text-sm font-medium leading-5">
                      {formatCount(article.favoritesCount)}
                    </div>
                  </button>

                  <div className="flex justify-start items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-gray-500" style={{ fontVariationSettings: "'FILL' 0" }}>
                      visibility
                    </span>
                    <div className="justify-start text-gray-500 text-sm font-medium leading-5">
                      {formatCount(article.views)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="self-stretch w-full max-w-7xl h-116 relative rounded-lg overflow-hidden bg-slate-100">
                <Image src={heroSrc} alt={article.title} fill className="object-cover" />
              </div>

              <div className="w-full max-w-190 text-justify justify-start text-gray-500 text-base font-medium leading-6">
                {isLikelyHtml(article.content) ? (
                  <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
                ) : (
                  <div className="whitespace-pre-wrap">{article.content}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

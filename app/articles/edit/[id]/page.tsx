"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AppLayout, { useUser } from "@/app/_components/AppLayout";
import BackLink from "@/app/_components/BackLink";
import { articleCategoryOptions, articleStatusOptions } from "../../_lib/articleOptions";
import type { ArticleCategory, ArticleStatus, ArticleSummary } from "../../_lib/articleTypes";
import RichTextTextarea from "../../_components/RichTextTextarea";

const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900";

export default function EditArticlePage() {
  return (
    <AppLayout>
      <EditArticleContent />
    </AppLayout>
  );
}

function EditArticleContent() {
  const user = useUser();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(true);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ArticleCategory>("FEEDING");
  const [status, setStatus] = useState<ArticleStatus>("DRAFT");
  const [content, setContent] = useState("");
  const [thumbnailImage, setThumbnailImage] = useState("");
  const [heroImage, setHeroImage] = useState("");

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);

  const validateImage = (file: File): string | null => {
    const max = 5 * 1024 * 1024;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (file.size > max) return "Image too large (max 5MB)";
    if (file.type && !allowed.includes(file.type) && !file.type.startsWith("image/")) {
      return "Invalid file type. Please choose an image.";
    }
    return null;
  };

  useEffect(() => {
    if (!thumbnailFile) return setThumbnailPreview(null);
    const url = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnailFile]);

  useEffect(() => {
    if (!heroFile) return setHeroPreview(null);
    const url = URL.createObjectURL(heroFile);
    setHeroPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [heroFile]);

  const fetchArticle = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/articles/${id}?noView=true`);
      if (!res.ok) {
        setMessage("Article not found");
        return;
      }
      const data = await res.json();
      const article = data.article as ArticleSummary;
      setTitle(article.title);
      setCategory(article.category);
      setStatus(article.status);
      setContent(article.content);
      setThumbnailImage(article.thumbnailImage || "");
      setHeroImage(article.heroImage || "");
    } catch (error) {
      console.error("Error fetching article:", error);
      setMessage("Failed to load article");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    fetchArticle();
  }, [fetchArticle, user]);

  const onChangeThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage("");
    const file = e.target.files?.[0] || null;
    if (!file) return setThumbnailFile(null);
    const err = validateImage(file);
    if (err) {
      setMessage(err);
      e.currentTarget.value = "";
      return;
    }
    setThumbnailFile(file);
  };

  const onChangeHero = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage("");
    const file = e.target.files?.[0] || null;
    if (!file) return setHeroFile(null);
    const err = validateImage(file);
    if (err) {
      setMessage(err);
      e.currentTarget.value = "";
      return;
    }
    setHeroFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const form = new FormData();
      form.append("title", title);
      form.append("category", category);
      form.append("status", status);
      form.append("content", content);

      if (thumbnailFile) form.append("thumbnail", thumbnailFile);
      else form.append("thumbnailImage", thumbnailImage);

      if (heroFile) form.append("hero", heroFile);
      else form.append("heroImage", heroImage);

      const res = await fetch(`/api/articles/${id}`, {
        method: "PUT",
        body: form,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setMessage(err?.error || "Failed to update article");
        return;
      }

      router.push("/articles");
    } catch (error) {
      console.error("Error updating article:", error);
      setMessage("Failed to update article");
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="p-8">
        <p className="text-gray-600">This page is only available for admin role.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-16 pt-8 pb-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading article...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-[1280px] mx-auto px-5 py-4">
        <BackLink href="/articles" label="Articles" />
      </div>

      <div className="max-w-4xl mx-auto px-5 pb-16">

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Edit Article</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              {message && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {message}
                </div>
              )}

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">Category *</label>
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ArticleCategory)}
                    className={inputClass}
                  >
                    {articleCategoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">Status *</label>
                  <select
                    required
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                    className={inputClass}
                  >
                    {articleStatusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-900 mb-1">
                  Content *
                </label>
                <RichTextTextarea
                  value={content}
                  onChange={setContent}
                  rows={12}
                  className={inputClass}
                  placeholder="Write your article content (HTML tags will be rendered)."
                />
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900">Preview</div>
                    <button
                      type="button"
                      onClick={() => setShowPreview((v) => !v)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      {showPreview ? "Hide" : "Show"}
                    </button>
                  </div>
                  {showPreview && (
                    <div className="mt-2 p-4 rounded-lg border border-gray-200 bg-white">
                      {/<\/?[a-z][\s\S]*>/i.test(content) ? (
                        <div className="article-content" dangerouslySetInnerHTML={{ __html: content }} />
                      ) : (
                        <div className="text-gray-700 whitespace-pre-wrap">{content}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Images</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-900">Thumbnail</div>
                <div className="relative w-full h-40 rounded-lg overflow-hidden bg-slate-100">
                  <Image
                    src={thumbnailPreview || thumbnailImage || "/images/icon/logo.png"}
                    alt="Thumbnail preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <input type="file" accept="image/*" onChange={onChangeThumbnail} />
                <div className="text-xs text-gray-500">Or use URL:</div>
                <input
                  type="url"
                  value={thumbnailImage}
                  onChange={(e) => setThumbnailImage(e.target.value)}
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-900">Hero Image</div>
                <div className="relative w-full h-40 rounded-lg overflow-hidden bg-slate-100">
                  <Image
                    src={heroPreview || heroImage || "/images/landing/bg.png"}
                    alt="Hero preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <input type="file" accept="image/*" onChange={onChangeHero} />
                <div className="text-xs text-gray-500">Or use URL:</div>
                <input
                  type="url"
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/articles"
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

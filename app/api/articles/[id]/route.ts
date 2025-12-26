import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { ArticleCategory, ArticleStatus } from "@prisma/client";
import fs from "fs";
import path from "path";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key");

async function getUserFromToken(request: NextRequest) {
  try {
    const token = request.cookies.get("session-token")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { sub: string; email: string; role: string };
  } catch {
    return null;
  }
}

function parseCategory(value: unknown): ArticleCategory | undefined {
  if (typeof value !== "string") return undefined;
  const upper = value.toUpperCase();
  return upper === "FEEDING" ||
    upper === "NUTRITION" ||
    upper === "HEALTH" ||
    upper === "DEVELOPMENT" ||
    upper === "TIPS"
    ? (upper as ArticleCategory)
    : undefined;
}

function parseStatus(value: unknown): ArticleStatus | undefined {
  if (typeof value !== "string") return undefined;
  const upper = value.toUpperCase();
  return upper === "DRAFT" || upper === "PUBLISHED" || upper === "ARCHIVED"
    ? (upper as ArticleStatus)
    : undefined;
}

type ArticleUpdatePayload = Partial<{
  title: string;
  content: string;
  category: string;
  status: string;
  thumbnailImage: string | null;
  heroImage: string | null;
}>;

// GET /api/articles/[id] - Get article detail; increments views
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUserFromToken(request);
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const noView = searchParams.get("noView") === "true";

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { favoritedBy: true } },
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (article.status !== "PUBLISHED" && user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const shouldIncrementViews = !(noView && user?.role === "ADMIN");
    if (shouldIncrementViews) {
      await prisma.article.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
    }

    let isFavorited = false;
    if (user) {
      const favorite = await prisma.favoriteArticle.findUnique({
        where: {
          userId_articleId: {
            userId: user.sub,
            articleId: id,
          },
        },
      });
      isFavorited = !!favorite;
    }

    return NextResponse.json({
      article: {
        ...article,
        views: shouldIncrementViews ? article.views + 1 : article.views,
        isFavorited,
        favoritesCount: article._count.favoritedBy,
      },
    });
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json({ error: "Failed to fetch article" }, { status: 500 });
  }
}

// PUT /api/articles/[id] - Update article (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    let body: ArticleUpdatePayload | null = null;
    let thumbnailUrl: string | null = null;
    let heroUrl: string | null = null;

    try {
      const form = await request.formData();
      if (form.has("title") || form.has("content") || form.has("category") || form.has("status")) {
        body = {
          title: form.get("title") ? String(form.get("title") || "") : undefined,
          content: form.get("content") ? String(form.get("content") || "") : undefined,
          category: form.get("category") ? String(form.get("category") || "") : undefined,
          status: form.get("status") ? String(form.get("status") || "") : undefined,
          thumbnailImage: form.has("thumbnailImage")
            ? (form.get("thumbnailImage") ? String(form.get("thumbnailImage")) : null)
            : undefined,
          heroImage: form.has("heroImage")
            ? (form.get("heroImage") ? String(form.get("heroImage")) : null)
            : undefined,
        };

        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

        const thumbnail = form.get("thumbnail") as File | null;
        if (thumbnail && typeof thumbnail.arrayBuffer === "function") {
          const buffer = Buffer.from(await thumbnail.arrayBuffer());
          const safeName = `${Date.now()}-${thumbnail.name || "thumbnail"}`.replace(/[^a-zA-Z0-9_.-]/g, "-");
          const filePath = path.join(uploadsDir, safeName);
          await fs.promises.writeFile(filePath, buffer);
          thumbnailUrl = `/uploads/${safeName}`;
        }

        const hero = form.get("hero") as File | null;
        if (hero && typeof hero.arrayBuffer === "function") {
          const buffer = Buffer.from(await hero.arrayBuffer());
          const safeName = `${Date.now()}-${hero.name || "hero"}`.replace(/[^a-zA-Z0-9_.-]/g, "-");
          const filePath = path.join(uploadsDir, safeName);
          await fs.promises.writeFile(filePath, buffer);
          heroUrl = `/uploads/${safeName}`;
        }
      }
    } catch {
      // ignore
    }

    if (!body) body = (await request.json()) as ArticleUpdatePayload;

    if (body.category !== undefined && parseCategory(body.category) === undefined) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    if (body.status !== undefined && parseStatus(body.status) === undefined) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const data: {
      title?: string;
      content?: string;
      category?: ArticleCategory;
      status?: ArticleStatus;
      thumbnailImage?: string | null;
      heroImage?: string | null;
    } = {};

    if (body.title !== undefined) data.title = body.title;
    if (body.content !== undefined) data.content = body.content;
    if (body.category !== undefined) data.category = parseCategory(body.category);
    if (body.status !== undefined) data.status = parseStatus(body.status);
    if (body.thumbnailImage !== undefined) data.thumbnailImage = body.thumbnailImage;
    if (body.heroImage !== undefined) data.heroImage = body.heroImage;
    if (thumbnailUrl) data.thumbnailImage = thumbnailUrl;
    if (heroUrl) data.heroImage = heroUrl;

    const updated = await prisma.article.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { favoritedBy: true } },
      },
    });

    return NextResponse.json({
      article: {
        ...updated,
        isFavorited: false,
        favoritesCount: updated._count.favoritedBy,
      },
    });
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}

// DELETE /api/articles/[id] - Delete article (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { ArticleCategory, ArticleStatus, Prisma } from "@prisma/client";
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

function parseCategory(value: unknown): ArticleCategory | null {
  if (typeof value !== "string") return null;
  const upper = value.toUpperCase();
  return upper === "FEEDING" ||
    upper === "NUTRITION" ||
    upper === "HEALTH" ||
    upper === "DEVELOPMENT" ||
    upper === "TIPS"
    ? (upper as ArticleCategory)
    : null;
}

function parseStatus(value: unknown): ArticleStatus | null {
  if (typeof value !== "string") return null;
  const upper = value.toUpperCase();
  return upper === "DRAFT" || upper === "PUBLISHED" || upper === "ARCHIVED"
    ? (upper as ArticleStatus)
    : null;
}

function parseDateOnly(value: string | null): Date | null {
  if (!value) return null;
  // Expect YYYY-MM-DD (browser date input format)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

type ArticleCreatePayload = {
  title: string;
  content: string;
  category: string;
  status?: string;
  thumbnailImage?: string | null;
  heroImage?: string | null;
};

function toArticleListWhere(opts: {
  userRole?: string | null;
  categoryParam?: string | null;
  searchParam?: string | null;
  fromParam?: string | null;
  toParam?: string | null;
}): Prisma.ArticleWhereInput {
  const where: Prisma.ArticleWhereInput = {};

  if (opts.userRole !== "ADMIN") {
    where.status = "PUBLISHED";
  }

  if (opts.categoryParam) {
    const categories = opts.categoryParam
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => parseCategory(c))
      .filter((c): c is ArticleCategory => c !== null);
    if (categories.length > 0) {
      where.category = { in: categories };
    }
  }

  if (opts.searchParam) {
    where.OR = [
      { title: { contains: opts.searchParam, mode: "insensitive" } },
      { content: { contains: opts.searchParam, mode: "insensitive" } },
    ];
  }

  const from = parseDateOnly(opts.fromParam ?? null);
  const to = parseDateOnly(opts.toParam ?? null);
  if (from || to) {
    const gte = from ?? undefined;
    const lt = to ? addDays(to, 1) : undefined; // inclusive end date
    if (gte && lt && gte > lt) {
      where.createdAt = { gte: lt, lt: addDays(gte, 1) };
    } else {
      where.createdAt = { ...(gte ? { gte } : {}), ...(lt ? { lt } : {}) };
    }
  }

  return where;
}

// GET /api/articles - List articles (public; only PUBLISHED for non-admin)
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const favorites = searchParams.get("favorites") === "true";

    const articleWhere = toArticleListWhere({
      userRole: user?.role ?? null,
      categoryParam: category,
      searchParam: search,
      fromParam: from,
      toParam: to,
    });

    if (favorites && user) {
      const favorited = await prisma.favoriteArticle.findMany({
        where: { userId: user.sub, article: articleWhere },
        include: {
          article: {
            include: {
              author: { select: { id: true, name: true, email: true } },
              _count: { select: { favoritedBy: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const articles = favorited
        .map((fav) => fav.article)
        .filter((a) => (user?.role === "ADMIN" ? true : a.status === "PUBLISHED"))
        .map((article) => ({
          ...article,
          isFavorited: true,
          favoritesCount: article._count.favoritedBy,
        }));

      return NextResponse.json({ articles });
    }

    const articles = await prisma.article.findMany({
      where: articleWhere,
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { favoritedBy: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    let favoritedIds: string[] = [];
    if (user) {
      const userFavorites = await prisma.favoriteArticle.findMany({
        where: { userId: user.sub },
        select: { articleId: true },
      });
      favoritedIds = userFavorites.map((f) => f.articleId);
    }

    const articlesWithFavorites = articles.map((article) => ({
      ...article,
      isFavorited: favoritedIds.includes(article.id),
      favoritesCount: article._count.favoritedBy,
    }));

    return NextResponse.json({ articles: articlesWithFavorites });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}

// POST /api/articles - Create article (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    let title: string | null = null;
    let content: string | null = null;
    let category: string | null = null;
    let status: string | null = null;
    let thumbnailImage: string | null = null;
    let heroImage: string | null = null;
    let thumbnailUrl: string | null = null;
    let heroUrl: string | null = null;

    try {
      const form = await request.formData();
      if (form.has("title")) {
        title = String(form.get("title") || "");
        content = String(form.get("content") || "");
        category = String(form.get("category") || "");
        status = String(form.get("status") || "DRAFT");
        thumbnailImage = form.get("thumbnailImage") ? String(form.get("thumbnailImage")) : null;
        heroImage = form.get("heroImage") ? String(form.get("heroImage")) : null;

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
      // not form-data; fallback to json
    }

    if (!title) {
      const body = (await request.json()) as ArticleCreatePayload;
      title = body.title;
      content = body.content;
      category = body.category;
      status = body.status ?? "DRAFT";
      thumbnailImage = body.thumbnailImage ?? null;
      heroImage = body.heroImage ?? null;
    }

    const parsedCategory = parseCategory(category);
    const parsedStatus = parseStatus(status) || "DRAFT";

    if (!title || !content || !parsedCategory) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (status && parseStatus(status) === null) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        category: parsedCategory,
        status: parsedStatus,
        thumbnailImage: thumbnailUrl || thumbnailImage || null,
        heroImage: heroUrl || heroImage || null,
        authorId: user.sub,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { favoritedBy: true } },
      },
    });

    return NextResponse.json(
      {
        article: {
          ...article,
          isFavorited: false,
          favoritesCount: article._count.favoritedBy,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}

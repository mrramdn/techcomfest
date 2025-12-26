import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

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

function parseLimit(value: string | null) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 5;
  return Math.min(10, Math.max(1, Math.floor(n)));
}

function excerpt(text: string, maxLen: number) {
  const s = text.replace(/\s+/g, " ").trim();
  return s.length > maxLen ? `${s.slice(0, maxLen)}…` : s;
}

type Scope = "all" | "recipes" | "articles" | "forum";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const scope = (searchParams.get("scope") || "all") as Scope;
    const limit = parseLimit(searchParams.get("limit"));

    if (q.length < 2) {
      return NextResponse.json({ recipes: [], articles: [], forum: [] });
    }

    const isAdmin = user.role === "ADMIN";

    const doRecipes = scope === "all" || scope === "recipes";
    const doArticles = scope === "all" || scope === "articles";
    const doForum = scope === "all" || scope === "forum";

    const [recipes, articles, forum] = await Promise.all([
      doRecipes
        ? prisma.recipe.findMany({
            where: {
              ...(isAdmin ? {} : { status: "PUBLISHED" }),
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { category: { contains: q, mode: "insensitive" } },
              ],
            },
            select: { id: true, name: true, category: true, image: true },
            orderBy: { createdAt: "desc" },
            take: limit,
          })
        : Promise.resolve([]),
      doArticles
        ? prisma.article.findMany({
            where: {
              ...(isAdmin ? {} : { status: "PUBLISHED" }),
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { content: { contains: q, mode: "insensitive" } },
              ],
            },
            select: { id: true, title: true, category: true, thumbnailImage: true },
            orderBy: { createdAt: "desc" },
            take: limit,
          })
        : Promise.resolve([]),
      doForum
        ? prisma.forumPost.findMany({
            where: { content: { contains: q, mode: "insensitive" } },
            select: { id: true, content: true, author: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
            take: limit,
          })
        : Promise.resolve([]),
    ]);

    return NextResponse.json({
      recipes: recipes.map((r) => ({
        id: r.id,
        title: r.name,
        subtitle: r.category,
        image: r.image,
        href: `/recipes/${r.id}`,
      })),
      articles: articles.map((a) => ({
        id: a.id,
        title: a.title,
        subtitle: a.category,
        image: a.thumbnailImage,
        href: `/articles/${a.id}`,
      })),
      forum: forum.map((p) => ({
        id: p.id,
        title: excerpt(p.content, 80),
        subtitle: p.author?.name ? `by ${p.author.name}` : "Forum post",
        image: null,
        href: `/forum/${p.id}`,
      })),
    });
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json({ error: "Failed to search" }, { status: 500 });
  }
}


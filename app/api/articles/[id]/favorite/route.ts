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

// POST /api/articles/[id]/favorite - Toggle favorite (authenticated users)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    if (article.status !== "PUBLISHED" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const existing = await prisma.favoriteArticle.findUnique({
      where: {
        userId_articleId: {
          userId: user.sub,
          articleId: id,
        },
      },
    });

    if (existing) {
      await prisma.favoriteArticle.delete({
        where: {
          userId_articleId: {
            userId: user.sub,
            articleId: id,
          },
        },
      });
      return NextResponse.json({ message: "Article unfavorited", isFavorited: false });
    }

    await prisma.favoriteArticle.create({
      data: {
        userId: user.sub,
        articleId: id,
      },
    });

    return NextResponse.json({ message: "Article favorited", isFavorited: true });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 });
  }
}


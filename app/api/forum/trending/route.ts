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

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

function parseLimit(value: string | null, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 && n <= 50 ? Math.floor(n) : fallback;
}

// GET /api/forum/trending - Most commented posts today
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get("limit"), 5);
    const { start, end } = getTodayRange();

    const grouped = await prisma.forumComment.groupBy({
      by: ["postId"],
      where: { createdAt: { gte: start, lt: end } },
      _count: { postId: true },
      orderBy: { _count: { postId: "desc" } },
      take: limit,
    });

    const postIds = grouped.map((g) => g.postId);
    if (postIds.length === 0) return NextResponse.json({ posts: [] });

    const posts = await prisma.forumPost.findMany({
      where: { id: { in: postIds } },
      include: {
        author: { select: { id: true, name: true, email: true, profilePicture: true } },
        _count: { select: { comments: true, likedBy: true } },
      },
    });

    const byId = new Map(posts.map((p) => [p.id, p]));
    const todayCommentCount = new Map(grouped.map((g) => [g.postId, g._count.postId]));

    const voteAgg = await prisma.forumPostVote.groupBy({
      by: ["postId"],
      where: { postId: { in: postIds } },
      _sum: { value: true },
    });
    const scoreByPostId = new Map(voteAgg.map((v) => [v.postId, v._sum.value ?? 0]));

    const likes = await prisma.forumPostLike.findMany({
      where: { userId: user.sub, postId: { in: postIds } },
      select: { postId: true },
    });
    const likedPostIds = new Set(likes.map((l) => l.postId));

    const votes = await prisma.forumPostVote.findMany({
      where: { userId: user.sub, postId: { in: postIds } },
      select: { postId: true, value: true },
    });
    const voteByPostId = new Map(votes.map((v) => [v.postId, v.value]));

    const trending = postIds
      .map((id) => {
        const p = byId.get(id);
        if (!p) return null;
        return {
          id: p.id,
          content: p.content,
          author: p.author,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          commentsCount: p._count.comments,
          likesCount: p._count.likedBy,
          score: scoreByPostId.get(p.id) ?? 0,
          isLiked: likedPostIds.has(p.id),
          userVote: voteByPostId.get(p.id) ?? 0,
          todayComments: todayCommentCount.get(p.id) ?? 0,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ posts: trending });
  } catch (error) {
    console.error("Error fetching trending posts:", error);
    return NextResponse.json({ error: "Failed to fetch trending posts" }, { status: 500 });
  }
}

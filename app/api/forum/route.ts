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

function toKebab(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

function parseLimit(value: string | null, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 && n <= 100 ? Math.floor(n) : fallback;
}

// GET /api/forum - List forum posts (requires auth via AppLayout)
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get("limit"), 50);
    const mine = searchParams.get("mine") === "true";

    if (mine && !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await prisma.forumPost.findMany({
      take: limit,
      where: mine && user ? { authorId: user.sub } : undefined,
      include: {
        author: { select: { id: true, name: true, email: true, profilePicture: true } },
        _count: {
          select: {
            comments: true,
            likedBy: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const postIds = posts.map((p) => p.id);

    const voteAgg = await prisma.forumPostVote.groupBy({
      by: ["postId"],
      where: { postId: { in: postIds } },
      _sum: { value: true },
    });
    const scoreByPostId = new Map(voteAgg.map((v) => [v.postId, v._sum.value ?? 0]));

    let likedPostIds = new Set<string>();
    let voteByPostId = new Map<string, number>();
    if (user && postIds.length > 0) {
      const likes = await prisma.forumPostLike.findMany({
        where: { userId: user.sub, postId: { in: postIds } },
        select: { postId: true },
      });
      likedPostIds = new Set(likes.map((l) => l.postId));

      const votes = await prisma.forumPostVote.findMany({
        where: { userId: user.sub, postId: { in: postIds } },
        select: { postId: true, value: true },
      });
      voteByPostId = new Map(votes.map((v) => [v.postId, v.value]));
    }

    const forumPosts = posts.map((p) => ({
      id: p.id,
      content: toKebab(p.content),
      author: p.author,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      commentsCount: p._count.comments,
      likesCount: p._count.likedBy,
      score: scoreByPostId.get(p.id) ?? 0,
      isLiked: likedPostIds.has(p.id),
      userVote: voteByPostId.get(p.id) ?? 0,
    }));

    return NextResponse.json({ posts: forumPosts });
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    return NextResponse.json({ error: "Failed to fetch forum posts" }, { status: 500 });
  }
}

// POST /api/forum - Create post (authenticated users)
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await request.json()) as { content?: string };
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!content) return NextResponse.json({ error: "Content is required" }, { status: 400 });

    const post = await prisma.forumPost.create({
      data: {
        content,
        authorId: user.sub,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { comments: true, likedBy: true } },
      },
    });

    return NextResponse.json(
      {
        post: {
          id: post.id,
          content: post.content,
          author: post.author,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          commentsCount: post._count.comments,
          likesCount: post._count.likedBy,
          score: 0,
          isLiked: false,
          userVote: 0,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating forum post:", error);
    return NextResponse.json({ error: "Failed to create forum post" }, { status: 500 });
  }
}

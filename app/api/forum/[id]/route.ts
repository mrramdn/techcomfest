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

// GET /api/forum/[id] - Get post detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const post = await prisma.forumPost.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true, profilePicture: true } },
        _count: { select: { comments: true, likedBy: true } },
      },
    });

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const scoreAgg = await prisma.forumPostVote.aggregate({
      where: { postId: id },
      _sum: { value: true },
    });
    const score = scoreAgg._sum.value ?? 0;

    const like = await prisma.forumPostLike.findUnique({
      where: { userId_postId: { userId: user.sub, postId: id } },
      select: { id: true },
    });
    const vote = await prisma.forumPostVote.findUnique({
      where: { userId_postId: { userId: user.sub, postId: id } },
      select: { value: true },
    });

    return NextResponse.json({
      post: {
        id: post.id,
        content: post.content,
        author: post.author,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        commentsCount: post._count.comments,
        likesCount: post._count.likedBy,
        score,
        isLiked: !!like,
        userVote: vote?.value ?? 0,
      },
    });
  } catch (error) {
    console.error("Error fetching forum post:", error);
    return NextResponse.json({ error: "Failed to fetch forum post" }, { status: 500 });
  }
}

// PUT /api/forum/[id] - Update post (author or admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = (await request.json()) as { content?: string };
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!content) return NextResponse.json({ error: "Content is required" }, { status: 400 });

    const post = await prisma.forumPost.findUnique({ where: { id }, select: { id: true, authorId: true } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (post.authorId !== user.sub && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.forumPost.update({
      where: { id },
      data: { content },
      include: {
        author: { select: { id: true, name: true, email: true, profilePicture: true } },
        _count: { select: { comments: true, likedBy: true } },
      },
    });

    const scoreAgg = await prisma.forumPostVote.aggregate({
      where: { postId: id },
      _sum: { value: true },
    });

    return NextResponse.json({
      post: {
        id: updated.id,
        content: updated.content,
        author: updated.author,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        commentsCount: updated._count.comments,
        likesCount: updated._count.likedBy,
        score: scoreAgg._sum.value ?? 0,
      },
    });
  } catch (error) {
    console.error("Error updating forum post:", error);
    return NextResponse.json({ error: "Failed to update forum post" }, { status: 500 });
  }
}

// DELETE /api/forum/[id] - Delete post (author or admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const post = await prisma.forumPost.findUnique({ where: { id }, select: { id: true, authorId: true } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (post.authorId !== user.sub && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.forumPost.delete({ where: { id } });
    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting forum post:", error);
    return NextResponse.json({ error: "Failed to delete forum post" }, { status: 500 });
  }
}

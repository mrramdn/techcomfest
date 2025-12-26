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

// POST /api/forum/[id]/like - Toggle like
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const post = await prisma.forumPost.findUnique({ where: { id }, select: { id: true } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const existing = await prisma.forumPostLike.findUnique({
      where: { userId_postId: { userId: user.sub, postId: id } },
      select: { id: true },
    });

    let isLiked = false;
    if (existing) {
      await prisma.forumPostLike.delete({
        where: { userId_postId: { userId: user.sub, postId: id } },
      });
      isLiked = false;
    } else {
      await prisma.forumPostLike.create({
        data: { userId: user.sub, postId: id },
      });
      isLiked = true;
    }

    const likesCount = await prisma.forumPostLike.count({ where: { postId: id } });
    return NextResponse.json({ isLiked, likesCount });
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}


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

// GET /api/forum/[id]/comments - List comments for post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const post = await prisma.forumPost.findUnique({ where: { id }, select: { id: true } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const comments = await prisma.forumComment.findMany({
      where: { postId: id },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// POST /api/forum/[id]/comments - Create comment
export async function POST(
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

    const post = await prisma.forumPost.findUnique({ where: { id }, select: { id: true } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const comment = await prisma.forumComment.create({
      data: {
        postId: id,
        userId: user.sub,
        content,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}


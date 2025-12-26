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

function parseVote(value: unknown): 1 | -1 | 0 {
  if (value === 1 || value === -1 || value === 0) return value;
  if (typeof value === "string") {
    const n = Number(value);
    if (n === 1 || n === -1 || n === 0) return n as 1 | -1 | 0;
  }
  return 0;
}

// POST /api/forum/[id]/vote - Set/toggle vote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = (await request.json()) as { value?: unknown };
    const value = parseVote(body.value);

    const post = await prisma.forumPost.findUnique({ where: { id }, select: { id: true } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const existing = await prisma.forumPostVote.findUnique({
      where: { userId_postId: { userId: user.sub, postId: id } },
      select: { value: true },
    });

    let userVote = 0;
    if (!existing) {
      if (value !== 0) {
        await prisma.forumPostVote.create({
          data: { userId: user.sub, postId: id, value },
        });
        userVote = value;
      }
    } else {
      if (value === 0 || existing.value === value) {
        await prisma.forumPostVote.delete({
          where: { userId_postId: { userId: user.sub, postId: id } },
        });
        userVote = 0;
      } else {
        await prisma.forumPostVote.update({
          where: { userId_postId: { userId: user.sub, postId: id } },
          data: { value },
        });
        userVote = value;
      }
    }

    const scoreAgg = await prisma.forumPostVote.aggregate({
      where: { postId: id },
      _sum: { value: true },
    });

    return NextResponse.json({ userVote, score: scoreAgg._sum.value ?? 0 });
  } catch (error) {
    console.error("Error voting:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionEdge } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("session-token")?.value;
    
    console.log('Token from cookies:', token ? 'Found' : 'Not found');

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const session = await verifySessionEdge(token);
    console.log('Session verified for user:', session.sub);

    const user = await prisma.user.findUnique({
      where: { id: String(session.sub) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePicture: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("auth/me error", error);
    return NextResponse.json(
      { success: false, message: "Unable to fetch user" },
      { status: 500 },
    );
  }
}

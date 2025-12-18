import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionEdge } from "@/lib/jwt";

type Body = {
  oldPassword?: string;
  newPassword?: string;
};

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("session-token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const session = await verifySessionEdge(token);
    const userId = String(session.sub);

    const body = (await request.json()) as Body;
    const oldPassword = String(body.oldPassword || "");
    const newPassword = String(body.newPassword || "");

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Old password and new password are required." },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, hashedPassword: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const valid = await bcrypt.compare(oldPassword, user.hashedPassword);
    if (!valid) {
      return NextResponse.json({ success: false, message: "Old password is incorrect." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { hashedPassword: hashed },
    });

    return NextResponse.json({ success: true, message: "Password updated." });
  } catch (err) {
    console.error("/api/profile/change-password error", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}


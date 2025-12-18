import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const body = (await request.json()) as { password?: string };
    const password = body.password;
    if (!token || !password) {
      return NextResponse.json({ success: false, message: "Token and password are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, message: "Password must be at least 8 characters." }, { status: 400 });
    }

    const reset = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!reset) {
      return NextResponse.json({ success: false, message: "Invalid or expired token." }, { status: 400 });
    }

    if (reset.used) {
      return NextResponse.json({ success: false, message: "This token has already been used." }, { status: 400 });
    }

    if (reset.expires < new Date()) {
      return NextResponse.json({ success: false, message: "Token expired." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.update({ where: { id: reset.userId }, data: { hashedPassword: hashed } });

    // mark token used and delete sessions for user
    await prisma.passwordResetToken.update({ where: { id: reset.id }, data: { used: true } });
    await prisma.session.deleteMany({ where: { userId: reset.userId } });

    return NextResponse.json({ success: true, message: "Password has been reset." });
  } catch (err) {
    console.error("reset token error", err);
    return NextResponse.json({ success: false, message: "Unable to reset password." }, { status: 500 });
  }
}

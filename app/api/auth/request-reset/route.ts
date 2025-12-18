import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomInt } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "No account found for that email." },
        { status: 404 }
      );
    }

    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    const generateCode = () => String(randomInt(0, 1_000_000)).padStart(6, "0");

    // Since we don't email yet, use a 6-digit code and return it to the client.
    // Retry a few times to avoid unique collisions on `token`.
    let token: string | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateCode();
      try {
        await prisma.passwordResetToken.create({
          data: {
            token: candidate,
            userId: user.id,
            expires,
          },
        });
        token = candidate;
        break;
      } catch (err) {
        const code = typeof err === "object" && err !== null ? (err as { code?: string }).code : undefined;
        if (code === "P2002") continue;
        throw err;
      }
    }

    if (!token) {
      return NextResponse.json({ success: false, message: "Unable to generate reset code. Try again." }, { status: 500 });
    }

    // In production you would send email here. For local/dev return reset link.
    const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const resetUrl = new URL(`/auth/reset/${token}`, origin).toString();

    return NextResponse.json({ success: true, message: "Reset code generated.", token, resetUrl });
  } catch (err) {
    console.error("request-reset error", err);
    return NextResponse.json({ success: false, message: "Unable to create reset link." }, { status: 500 });
  }
}

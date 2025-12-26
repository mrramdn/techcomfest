import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessionCookieOptions, signSession } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const { email, password, rememberMe } = (await request.json()) as {
      email?: string;
      password?: string;
      rememberMe?: boolean;
    };

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true,
        role: true,
        hashedPassword: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials." },
        { status: 401 },
      );
    }

    const valid = await bcrypt.compare(password, user.hashedPassword);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials." },
        { status: 401 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword, ...safeUser } = user;

    const remember = rememberMe !== false;

    const token = signSession({
      sub: safeUser.id,
      email: safeUser.email,
      role: safeUser.role,
      name: safeUser.name,
      profilePicture: safeUser.profilePicture ?? undefined,
    }, remember ? "30d" : "1d");

    const response = NextResponse.json(
      {
        success: true,
        message: "Sign in successful.",
        user: safeUser,
        redirectUrl: "/",
      },
      { status: 200 },
    );

    response.cookies.set("session-token", token, sessionCookieOptions({ rememberMe: remember }));

    return response;
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json(
      { success: false, message: "Unable to login right now." },
      { status: 500 },
    );
  }
}

import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessionCookieOptions, signSession } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const { name, email, password, profilePicture } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required." },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Email is already registered." },
        { status: 409 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        profilePicture: profilePicture || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true,
        role: true,
        createdAt: true,
      },
    });

    const token = signSession({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      profilePicture: user.profilePicture ?? undefined,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created.",
        user,
        redirectUrl: "/home",
      },
      { status: 201 },
    );
    response.cookies.set("session-token", token, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("Register error", error);
    return NextResponse.json(
      { success: false, message: "Unable to register right now." },
      { status: 500 },
    );
  }
}

import { NextResponse, NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { verifySessionEdge, signSession, sessionCookieOptions } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("session-token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const session = await verifySessionEdge(token);
    const userId = String(session.sub);

    const form = await request.formData();
    const name = String(form.get("name") || "").trim();
    const photo = form.get("photo") as File | null;

    if (!name) {
      return NextResponse.json({ success: false, message: "Name is required" }, { status: 400 });
    }

    let photoUrl: string | null = null;

    // Validate file size/type (if provided)
    if (photo) {
      const size = Number(photo.size ?? 0);
      const type = String(photo.type ?? "");
      const max = 5 * 1024 * 1024; // 5MB
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (size > max) {
        return NextResponse.json({ success: false, message: "Image too large (max 5MB)" }, { status: 400 });
      }
      if (type && !allowed.includes(type)) {
        return NextResponse.json({ success: false, message: "Invalid image type" }, { status: 400 });
      }
    }

    if (photo && typeof photo.arrayBuffer === "function") {
      const buffer = Buffer.from(await photo.arrayBuffer());

      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      const safeName = `${Date.now()}-${photo.name || "photo"}`.replace(/[^a-zA-Z0-9_.-]/g, "-");
      const filePath = path.join(uploadsDir, safeName);
      await fs.promises.writeFile(filePath, buffer);
      photoUrl = `/uploads/${safeName}`;
    }

    // Update user record with name and profile picture
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        profilePicture: photoUrl || undefined,
      },
      select: { id: true, name: true, email: true, profilePicture: true, role: true },
    });

    // Issue a refreshed session token with updated profile info
    const newToken = signSession({
      sub: updated.id,
      email: updated.email,
      role: updated.role,
      name: updated.name,
      profilePicture: updated.profilePicture ?? undefined,
    });

    const response = NextResponse.json({ success: true, redirect: "/", user: updated, photoUrl });
    response.cookies.set("session-token", newToken, sessionCookieOptions());
    return response;
  } catch (err) {
    console.error("/api/auth/complete error", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

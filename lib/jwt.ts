import jwt from "jsonwebtoken";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn("JWT_SECRET is not set. Set it in .env for secure sessions.");
}

type SessionPayload = {
  sub: string;
  email: string;
  role: string;
  name?: string | null;
  profilePicture?: string | null;
};

export function signSession(payload: SessionPayload, expiresIn: string | number = "7d") {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is required to sign tokens.");
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifySession(token: string) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is required to verify tokens.");
  return jwt.verify(token, JWT_SECRET) as SessionPayload & { exp: number; iat: number };
}

// Edge-safe verification using jose (for middleware).
export async function verifySessionEdge(token: string) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is required to verify tokens.");
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload as SessionPayload & { exp?: number; iat?: number };
}

export function sessionCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const redirectUrl = "/auth?mode=signin";

  const clearCookie = (res: NextResponse) => {
    res.cookies.set("session-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return res;
  };

  const acceptsHtml =
    request.headers.get("accept")?.includes("text/html") ||
    request.headers.get("sec-fetch-mode") === "navigate";

  if (acceptsHtml) {
    return clearCookie(NextResponse.redirect(new URL(redirectUrl, request.url)));
  }

  return clearCookie(
    NextResponse.json({ success: true, message: "Logged out." }),
  );
}

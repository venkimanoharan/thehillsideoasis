import { createSessionToken, getSessionCookieName, getSessionMaxAge } from "@/lib/admin-auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { username, password } = (await request.json()) as {
    username?: string;
    password?: string;
  };

  const expectedUsername = process.env.ADMIN_USERNAME ?? "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "change-me";

  if (username !== expectedUsername || password !== expectedPassword) {
    return NextResponse.json({ ok: false, error: "Invalid credentials." }, { status: 401 });
  }

  const token = createSessionToken(username);
  const response = NextResponse.json({ ok: true }, { status: 200 });

  response.cookies.set(getSessionCookieName(), token, {
    httpOnly: true,
    maxAge: getSessionMaxAge(),
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

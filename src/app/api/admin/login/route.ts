import bcrypt from "bcryptjs";
import { createSessionToken, getSessionCookieName, getSessionMaxAge } from "@/lib/admin-auth";
import { checkRateLimit, clearAttempts, recordFailedAttempt } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const isProduction = process.env.NODE_ENV === "production";

// Dev-only convenience so `npm run dev` works out of the box without secrets
// configured. Never used when NODE_ENV === "production".
const DEV_FALLBACK_USERNAME = "admin";
const DEV_FALLBACK_PASSWORD_HASH = isProduction ? null : bcrypt.hashSync("change-me", 10);

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]!.trim();
  }
  return "unknown";
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  const rateLimit = await checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many login attempts. Please try again later." },
      {
        status: 429,
        headers: rateLimit.retryAfterSeconds
          ? { "Retry-After": String(rateLimit.retryAfterSeconds) }
          : undefined,
      },
    );
  }

  const { username, password } = (await request.json()) as {
    username?: string;
    password?: string;
  };

  const configuredUsername = process.env.ADMIN_USERNAME;
  const configuredPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  const sessionSecretConfigured = Boolean(process.env.ADMIN_SESSION_SECRET);

  if (isProduction && (!configuredUsername || !configuredPasswordHash || !sessionSecretConfigured)) {
    // Fail closed: never fall back to shared default credentials in production.
    return NextResponse.json(
      { ok: false, error: "Admin login is not configured." },
      { status: 503 },
    );
  }

  const expectedUsername = configuredUsername ?? DEV_FALLBACK_USERNAME;
  const expectedPasswordHash = configuredPasswordHash ?? DEV_FALLBACK_PASSWORD_HASH;

  const usernameMatches = username === expectedUsername;
  const passwordMatches =
    typeof password === "string" &&
    Boolean(expectedPasswordHash) &&
    bcrypt.compareSync(password, expectedPasswordHash!);

  if (!usernameMatches || !passwordMatches) {
    await recordFailedAttempt(ip);
    return NextResponse.json({ ok: false, error: "Invalid credentials." }, { status: 401 });
  }

  let token: string;
  try {
    token = createSessionToken(expectedUsername);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Admin login is not configured." },
      { status: 503 },
    );
  }

  await clearAttempts(ip);

  const response = NextResponse.json({ ok: true }, { status: 200 });

  response.cookies.set(getSessionCookieName(), token, {
    httpOnly: true,
    maxAge: getSessionMaxAge(),
    path: "/",
    sameSite: "lax",
    secure: isProduction,
  });

  return response;
}

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "hso_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "dev-only-secret-change-me";
}

function signPayload(username: string, issuedAt: number) {
  return createHmac("sha256", getSecret()).update(`${username}.${issuedAt}`).digest("hex");
}

export function createSessionToken(username: string) {
  const issuedAt = Date.now();
  const signature = signPayload(username, issuedAt);
  return `${username}.${issuedAt}.${signature}`;
}

export function verifySessionToken(token?: string | null) {
  if (!token) {
    return false;
  }

  const [username, issuedAtString, signature] = token.split(".");
  if (!username || !issuedAtString || !signature) {
    return false;
  }

  const issuedAt = Number(issuedAtString);
  if (!Number.isFinite(issuedAt)) {
    return false;
  }

  if (Date.now() - issuedAt > SESSION_MAX_AGE_SECONDS * 1000) {
    return false;
  }

  const expected = signPayload(username, issuedAt);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, signatureBuffer);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export function getSessionMaxAge() {
  return SESSION_MAX_AGE_SECONDS;
}

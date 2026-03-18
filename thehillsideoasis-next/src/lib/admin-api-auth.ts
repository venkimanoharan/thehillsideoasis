import { getSessionCookieName, verifySessionToken } from "@/lib/admin-auth";

export function isAdminRequestAuthorized(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieName = getSessionCookieName();

  const tokenPart = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`));

  if (!tokenPart) {
    return false;
  }

  const token = decodeURIComponent(tokenPart.slice(cookieName.length + 1));
  return verifySessionToken(token);
}

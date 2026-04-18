import { isAdminRequestAuthorized } from "@/lib/admin-api-auth";
import { getSiteSettings, SITE_SETTINGS_CACHE_TAG, updateSiteSettings } from "@/lib/site-settings";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getSiteSettings();
  return NextResponse.json({ ok: true, settings });
}

export async function PUT(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    contactPhoneDisplay?: string;
    contactWhatsappDisplay?: string;
    contactEmailDisplay?: string;
    contactAddressDisplay?: string;
    facebookUrl?: string;
    instagramUrl?: string;
  };

  if (!body.contactPhoneDisplay?.trim()) {
    return NextResponse.json({ ok: false, error: "Contact phone is required." }, { status: 400 });
  }

  if (!body.contactWhatsappDisplay?.trim()) {
    return NextResponse.json({ ok: false, error: "WhatsApp number is required." }, { status: 400 });
  }

  if (!body.contactEmailDisplay?.trim()) {
    return NextResponse.json({ ok: false, error: "Contact email is required." }, { status: 400 });
  }

  if (!body.contactAddressDisplay?.trim()) {
    return NextResponse.json({ ok: false, error: "Contact address is required." }, { status: 400 });
  }

  const settings = await updateSiteSettings(body);
  revalidateTag(SITE_SETTINGS_CACHE_TAG);
  return NextResponse.json({ ok: true, settings });
}
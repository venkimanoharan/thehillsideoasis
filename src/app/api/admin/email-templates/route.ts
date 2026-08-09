import { isAdminRequestAuthorized } from "@/lib/admin-api-auth";
import {
  EMAIL_TEMPLATE_KEYS,
  getEmailTemplates,
  updateEmailTemplate,
  type EmailTemplateKey,
} from "@/lib/email-templates";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const templates = await getEmailTemplates();
  return NextResponse.json({ ok: true, templates });
}

export async function PUT(request: Request) {
  if (!isAdminRequestAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    key: EmailTemplateKey;
    subject: string;
    heading: string;
    message: string;
  };

  if (!EMAIL_TEMPLATE_KEYS.includes(body.key)) {
    return NextResponse.json({ ok: false, error: "Unknown template key." }, { status: 400 });
  }

  if (!body.subject?.trim() || !body.heading?.trim() || !body.message?.trim()) {
    return NextResponse.json(
      { ok: false, error: "Subject, heading, and message are required." },
      { status: 400 },
    );
  }

  await updateEmailTemplate(body.key, {
    subject: body.subject,
    heading: body.heading,
    message: body.message,
  });

  const templates = await getEmailTemplates();
  return NextResponse.json({ ok: true, templates });
}

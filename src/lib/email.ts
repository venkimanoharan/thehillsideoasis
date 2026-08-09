import nodemailer from "nodemailer";
import { getSiteSettings } from "@/lib/site-settings";
import { getEmailTemplates, renderTemplateString } from "@/lib/email-templates";

export type BookingEmailData = {
  traceId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkin: string;
  checkout: string;
  roomName: string;
  guests: number;
  totalAmount: number;
  requests?: string;
};

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function formatCurrency(amount: number): string {
  return `INR ${amount.toLocaleString("en-IN")}`;
}

function templateVars(data: BookingEmailData): Record<string, string> {
  return {
    guestName: data.guestName,
    roomName: data.roomName,
    checkin: data.checkin,
    checkout: data.checkout,
    guests: String(data.guests),
    totalAmount: formatCurrency(data.totalAmount),
    traceId: data.traceId.toUpperCase().slice(0, 8),
    requests: data.requests ?? "",
  };
}

function guestEmailHtml(
  data: BookingEmailData,
  rendered: { heading: string; message: string },
  settings: {
    contactPhoneDisplay: string;
    contactPhoneHref: string;
    contactEmailDisplay: string;
    contactAddressDisplay: string;
  },
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${rendered.heading}</title>
</head>
<body style="margin:0;padding:0;background:#f6f2ea;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f2ea;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#084c3c,#0b6b53);padding:40px 40px 32px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">The HillSide Oasis</h1>
              <p style="margin:8px 0 0;font-size:12px;font-weight:600;color:#a7d9c9;letter-spacing:0.2em;text-transform:uppercase;">Pollachi · Tamil Nadu</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">

              <h2 style="margin:0 0 8px;font-size:22px;color:#0b6b53;">${rendered.heading}</h2>
              <p style="margin:0 0 24px;color:#4b5563;line-height:1.7;">
                ${rendered.message}
              </p>

              <!-- Booking details card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f2ea;border-radius:12px;padding:24px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 16px;font-size:11px;font-weight:700;color:#6b7280;letter-spacing:0.2em;text-transform:uppercase;">Booking Summary</p>

                    <table width="100%" cellpadding="6" cellspacing="0">
                      <tr>
                        <td style="color:#6b7280;font-size:14px;width:45%;">Reference ID</td>
                        <td style="color:#111827;font-size:14px;font-weight:600;">${data.traceId.toUpperCase().slice(0, 8)}</td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:14px;">Room</td>
                        <td style="color:#111827;font-size:14px;font-weight:600;">${data.roomName}</td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:14px;">Check-in</td>
                        <td style="color:#111827;font-size:14px;font-weight:600;">${data.checkin}</td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:14px;">Check-out</td>
                        <td style="color:#111827;font-size:14px;font-weight:600;">${data.checkout}</td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:14px;">Guests</td>
                        <td style="color:#111827;font-size:14px;font-weight:600;">${data.guests}</td>
                      </tr>
                      ${data.requests ? `<tr><td style="color:#6b7280;font-size:14px;">Special Requests</td><td style="color:#111827;font-size:14px;">${data.requests}</td></tr>` : ""}
                      <tr>
                        <td colspan="2" style="padding-top:12px;border-top:1px solid #d1d5db;"></td>
                      </tr>
                      <tr>
                        <td style="color:#0b6b53;font-size:15px;font-weight:700;">Total Amount</td>
                        <td style="color:#0b6b53;font-size:15px;font-weight:700;">${formatCurrency(data.totalAmount)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;color:#4b5563;line-height:1.7;font-size:14px;">
                Our team will reach out to you at <strong>${data.guestEmail}</strong> or <strong>${data.guestPhone}</strong> if we need any further details.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background:#0b6b53;border-radius:8px;padding:12px 24px;">
                    <a href="${settings.contactPhoneHref}" style="color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">Call us: ${settings.contactPhoneDisplay}</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                The HillSide Oasis · ${settings.contactAddressDisplay} · ${settings.contactEmailDisplay}
              </p>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function adminNotificationHtml(data: BookingEmailData, headline: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>${headline}</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:24px;">
  <div style="background:#fff;border-radius:8px;padding:24px;max-width:520px;">
    <h2 style="color:#084c3c;margin:0 0 16px;">${headline}</h2>
    <table cellpadding="6" cellspacing="0" width="100%">
      <tr><td style="color:#666;">Reference</td><td><strong>${data.traceId}</strong></td></tr>
      <tr><td style="color:#666;">Guest</td><td><strong>${data.guestName}</strong></td></tr>
      <tr><td style="color:#666;">Email</td><td>${data.guestEmail}</td></tr>
      <tr><td style="color:#666;">Phone</td><td>${data.guestPhone}</td></tr>
      <tr><td style="color:#666;">Room</td><td>${data.roomName}</td></tr>
      <tr><td style="color:#666;">Check-in</td><td>${data.checkin}</td></tr>
      <tr><td style="color:#666;">Check-out</td><td>${data.checkout}</td></tr>
      <tr><td style="color:#666;">Guests</td><td>${data.guests}</td></tr>
      <tr><td style="color:#666;">Total</td><td><strong>${formatCurrency(data.totalAmount)}</strong></td></tr>
      ${data.requests ? `<tr><td style="color:#666;">Requests</td><td>${data.requests}</td></tr>` : ""}
    </table>
  </div>
</body>
</html>
  `.trim();
}

export async function sendBookingEmails(data: BookingEmailData): Promise<void> {
  const transporter = createTransporter();
  if (!transporter) {
    // SMTP not configured — skip silently; booking is already saved to DB
    return;
  }

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "noreply@thehillsideoasis.com";
  const notifyEmail = process.env.NOTIFY_EMAIL;
  const [settings, templates] = await Promise.all([getSiteSettings(), getEmailTemplates()]);
  const vars = templateVars(data);
  const template = templates.booking_received;
  const rendered = {
    subject: renderTemplateString(template.subject, vars),
    heading: renderTemplateString(template.heading, vars),
    message: renderTemplateString(template.message, vars),
  };

  const sends: Promise<unknown>[] = [
    transporter.sendMail({
      from: `"The HillSide Oasis" <${from}>`,
      to: data.guestEmail,
      subject: rendered.subject,
      html: guestEmailHtml(data, rendered, settings),
    }),
  ];

  if (notifyEmail) {
    sends.push(
      transporter.sendMail({
        from: `"HillSide Oasis Bookings" <${from}>`,
        to: notifyEmail,
        subject: `New Booking: ${data.guestName} · ${data.checkin} to ${data.checkout}`,
        html: adminNotificationHtml(data, "New Booking Request"),
      }),
    );
  }

  await Promise.allSettled(sends);
}

/** Sends the guest-facing confirmation/cancellation email when admin changes a booking's status. */
export async function sendBookingStatusEmail(
  data: BookingEmailData,
  status: "confirmed" | "cancelled",
): Promise<void> {
  const transporter = createTransporter();
  if (!transporter) {
    return;
  }

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "noreply@thehillsideoasis.com";
  const [settings, templates] = await Promise.all([getSiteSettings(), getEmailTemplates()]);
  const vars = templateVars(data);
  const template = status === "confirmed" ? templates.booking_confirmed : templates.booking_cancelled;
  const rendered = {
    subject: renderTemplateString(template.subject, vars),
    heading: renderTemplateString(template.heading, vars),
    message: renderTemplateString(template.message, vars),
  };

  await transporter.sendMail({
    from: `"The HillSide Oasis" <${from}>`,
    to: data.guestEmail,
    subject: rendered.subject,
    html: guestEmailHtml(data, rendered, settings),
  });
}

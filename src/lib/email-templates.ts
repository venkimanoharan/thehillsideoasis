import { COLLECTIONS, getDb } from "@/lib/firestore";

export type EmailTemplateKey = "booking_received" | "booking_confirmed" | "booking_cancelled";

export type EmailTemplate = {
  subject: string;
  heading: string;
  message: string;
};

export const EMAIL_TEMPLATE_KEYS: EmailTemplateKey[] = [
  "booking_received",
  "booking_confirmed",
  "booking_cancelled",
];

/** Placeholders available for substitution in each template's subject/heading/message. */
export const EMAIL_TEMPLATE_PLACEHOLDERS = [
  "guestName",
  "roomName",
  "checkin",
  "checkout",
  "guests",
  "totalAmount",
  "traceId",
  "requests",
] as const;

export const DEFAULT_EMAIL_TEMPLATES: Record<EmailTemplateKey, EmailTemplate> = {
  booking_received: {
    subject: "Booking Request Received – {{roomName}} | The HillSide Oasis",
    heading: "Booking Request Received",
    message:
      "Dear {{guestName}}, thank you for choosing The HillSide Oasis. We have received your booking request and will confirm your stay within 24 hours.",
  },
  booking_confirmed: {
    subject: "Booking Confirmed – {{roomName}} | The HillSide Oasis",
    heading: "Your Booking is Confirmed",
    message:
      "Dear {{guestName}}, wonderful news — your stay at The HillSide Oasis is confirmed. We look forward to welcoming you on {{checkin}}.",
  },
  booking_cancelled: {
    subject: "Booking Cancelled | The HillSide Oasis",
    heading: "Your Booking Has Been Cancelled",
    message:
      "Dear {{guestName}}, your booking with The HillSide Oasis for {{checkin}} to {{checkout}} has been cancelled. If this wasn't expected, please contact us and we'll be happy to help.",
  },
};

const TEMPLATES_DOC_ID = "guest_emails";
const PLACEHOLDER_PATTERN = /\{\{(\w+)\}\}/g;

export function renderTemplateString(template: string, vars: Record<string, string>): string {
  return template.replace(PLACEHOLDER_PATTERN, (match, key: string) => vars[key] ?? match);
}

function templatesDocRef() {
  return getDb().collection(COLLECTIONS.emailTemplates).doc(TEMPLATES_DOC_ID);
}

export async function getEmailTemplates(): Promise<Record<EmailTemplateKey, EmailTemplate>> {
  const snapshot = await templatesDocRef().get();
  const stored = (snapshot.data() as Partial<Record<EmailTemplateKey, EmailTemplate>> | undefined) ?? {};

  return {
    booking_received: { ...DEFAULT_EMAIL_TEMPLATES.booking_received, ...stored.booking_received },
    booking_confirmed: { ...DEFAULT_EMAIL_TEMPLATES.booking_confirmed, ...stored.booking_confirmed },
    booking_cancelled: { ...DEFAULT_EMAIL_TEMPLATES.booking_cancelled, ...stored.booking_cancelled },
  };
}

export async function updateEmailTemplate(key: EmailTemplateKey, template: EmailTemplate): Promise<void> {
  await templatesDocRef().set({ [key]: template }, { merge: true });
}

import { unstable_cache } from "next/cache";
import { COLLECTIONS, getDb, SITE_SETTINGS_DOC_ID } from "@/lib/firestore";

const CONTACT_PHONE_KEY = "contact_phone";
const CONTACT_WHATSAPP_KEY = "contact_whatsapp";
const CONTACT_EMAIL_KEY = "contact_email";
const CONTACT_ADDRESS_KEY = "contact_address";
const FACEBOOK_URL_KEY = "facebook_url";
const INSTAGRAM_URL_KEY = "instagram_url";
const DEFAULT_CONTACT_PHONE = process.env.PHONE_NUMBER || process.env.NEXT_PUBLIC_PHONE_NUMBER || "+1-949-282-8611";
const DEFAULT_CONTACT_WHATSAPP = "+1-949-282-8611";
const DEFAULT_CONTACT_EMAIL = "info@thehillsideoasis.com";
const DEFAULT_CONTACT_ADDRESS = "Arthanaripalayam, Pollachi, Tamil Nadu 642007";
const DEFAULT_FACEBOOK_URL = "https://facebook.com/thehillsideoasis";
const DEFAULT_INSTAGRAM_URL = "https://instagram.com/thehillsideoasis";
export const SITE_SETTINGS_CACHE_TAG = "site-settings";

const DEFAULT_SETTINGS = {
  [CONTACT_PHONE_KEY]: DEFAULT_CONTACT_PHONE,
  [CONTACT_WHATSAPP_KEY]: DEFAULT_CONTACT_WHATSAPP,
  [CONTACT_EMAIL_KEY]: DEFAULT_CONTACT_EMAIL,
  [CONTACT_ADDRESS_KEY]: DEFAULT_CONTACT_ADDRESS,
  [FACEBOOK_URL_KEY]: DEFAULT_FACEBOOK_URL,
  [INSTAGRAM_URL_KEY]: DEFAULT_INSTAGRAM_URL,
} as const;

type SiteSettingKey = keyof typeof DEFAULT_SETTINGS;

export type SiteSettings = {
  contactPhoneDisplay: string;
  contactPhoneHref: string;
  contactWhatsappDisplay: string;
  contactWhatsappHref: string;
  contactEmailDisplay: string;
  contactEmailHref: string;
  contactAddressDisplay: string;
  facebookUrl: string;
  instagramUrl: string;
};

export type SiteSettingsUpdateInput = {
  contactPhoneDisplay?: string;
  contactWhatsappDisplay?: string;
  contactEmailDisplay?: string;
  contactAddressDisplay?: string;
  facebookUrl?: string;
  instagramUrl?: string;
};

function normalizePhoneForTel(phone: string) {
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

function normalizePhoneForWhatsApp(phone: string) {
  return phone.replace(/\D/g, "");
}

function normalizeEmailForMailto(email: string) {
  return `mailto:${email.trim()}`;
}

function settingsDocRef() {
  return getDb().collection(COLLECTIONS.siteSettings).doc(SITE_SETTINGS_DOC_ID);
}

function toSiteSettings(settingsRaw: Record<string, string>): SiteSettings {
  const contactPhoneDisplay = settingsRaw[CONTACT_PHONE_KEY] || DEFAULT_CONTACT_PHONE;
  const contactWhatsappDisplay = settingsRaw[CONTACT_WHATSAPP_KEY] || DEFAULT_CONTACT_WHATSAPP;
  const contactEmailDisplay = settingsRaw[CONTACT_EMAIL_KEY] || DEFAULT_CONTACT_EMAIL;
  const contactAddressDisplay = settingsRaw[CONTACT_ADDRESS_KEY] || DEFAULT_CONTACT_ADDRESS;
  const facebookUrl = settingsRaw[FACEBOOK_URL_KEY] || DEFAULT_FACEBOOK_URL;
  const instagramUrl = settingsRaw[INSTAGRAM_URL_KEY] || DEFAULT_INSTAGRAM_URL;

  return {
    contactPhoneDisplay,
    contactPhoneHref: `tel:${normalizePhoneForTel(contactPhoneDisplay)}`,
    contactWhatsappDisplay,
    contactWhatsappHref: `https://wa.me/${normalizePhoneForWhatsApp(contactWhatsappDisplay)}`,
    contactEmailDisplay,
    contactEmailHref: normalizeEmailForMailto(contactEmailDisplay),
    contactAddressDisplay,
    facebookUrl,
    instagramUrl,
  };
}

async function readSiteSettings(): Promise<SiteSettings> {
  const snapshot = await settingsDocRef().get();
  const settingsRaw = (snapshot.data() as Record<string, string> | undefined) ?? { ...DEFAULT_SETTINGS };
  return toSiteSettings(settingsRaw);
}

const getCachedSiteSettingsInternal = unstable_cache(readSiteSettings, [SITE_SETTINGS_CACHE_TAG], {
  tags: [SITE_SETTINGS_CACHE_TAG],
  revalidate: 3600,
});

export async function getSiteSettings(): Promise<SiteSettings> {
  return readSiteSettings();
}

export async function getCachedSiteSettings(): Promise<SiteSettings> {
  return getCachedSiteSettingsInternal();
}

export async function updateSiteSettings(input: SiteSettingsUpdateInput): Promise<SiteSettings> {
  const nextValues: Record<SiteSettingKey, string> = {
    [CONTACT_PHONE_KEY]: input.contactPhoneDisplay?.trim() || DEFAULT_CONTACT_PHONE,
    [CONTACT_WHATSAPP_KEY]: input.contactWhatsappDisplay?.trim() || DEFAULT_CONTACT_WHATSAPP,
    [CONTACT_EMAIL_KEY]: input.contactEmailDisplay?.trim() || DEFAULT_CONTACT_EMAIL,
    [CONTACT_ADDRESS_KEY]: input.contactAddressDisplay?.trim() || DEFAULT_CONTACT_ADDRESS,
    [FACEBOOK_URL_KEY]: input.facebookUrl?.trim() || DEFAULT_FACEBOOK_URL,
    [INSTAGRAM_URL_KEY]: input.instagramUrl?.trim() || DEFAULT_INSTAGRAM_URL,
  };
  await settingsDocRef().set(nextValues, { merge: true });
  return readSiteSettings();
}

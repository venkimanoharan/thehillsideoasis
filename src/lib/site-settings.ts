
import fs from "fs/promises";
import path from "path";
import { unstable_cache } from "next/cache";

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

type SiteSettingRow = {
  setting_key: SiteSettingKey;
  setting_value: string;
};

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


const SETTINGS_PATH = path.join(process.cwd(), "data", "site-settings.json");

async function ensureSiteSettingsFile() {
  try {
    await fs.access(SETTINGS_PATH);
  } catch {
    await fs.writeFile(SETTINGS_PATH, JSON.stringify(DEFAULT_SETTINGS, null, 2));
  }
}


async function readSiteSettings(): Promise<SiteSettings> {
  await ensureSiteSettingsFile();
  let settingsRaw: Record<string, string> = {};
  try {
    const data = await fs.readFile(SETTINGS_PATH, "utf-8");
    settingsRaw = JSON.parse(data);
  } catch {
    settingsRaw = { ...DEFAULT_SETTINGS };
  }
  const contactPhoneDisplay = settingsRaw[CONTACT_PHONE_KEY] || DEFAULT_CONTACT_PHONE;
  const contactWhatsappDisplay = settingsRaw[CONTACT_WHATSAPP_KEY] || DEFAULT_CONTACT_WHATSAPP;
  const contactEmailDisplay = settingsRaw[CONTACT_EMAIL_KEY] || DEFAULT_CONTACT_EMAIL;
  const contactAddressDisplay = settingsRaw[CONTACT_ADDRESS_KEY] || DEFAULT_CONTACT_ADDRESS;
  const facebookUrl = settingsRaw[FACEBOOK_URL_KEY] || DEFAULT_FACEBOOK_URL;
  const instagramUrl = settingsRaw[INSTAGRAM_URL_KEY] || DEFAULT_INSTAGRAM_URL;
  const contactPhoneHref = `tel:${normalizePhoneForTel(contactPhoneDisplay)}`;
  const contactWhatsappHref = `https://wa.me/${normalizePhoneForWhatsApp(contactWhatsappDisplay)}`;
  const contactEmailHref = normalizeEmailForMailto(contactEmailDisplay);
  return {
    contactPhoneDisplay,
    contactPhoneHref,
    contactWhatsappDisplay,
    contactWhatsappHref,
    contactEmailDisplay,
    contactEmailHref,
    contactAddressDisplay,
    facebookUrl,
    instagramUrl,
  };
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
  await ensureSiteSettingsFile();
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(nextValues, null, 2));
  return readSiteSettings();
}
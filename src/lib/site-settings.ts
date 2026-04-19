import { dbQuery } from "@/lib/db";
import { unstable_cache } from "next/cache";

const CONTACT_PHONE_KEY = "contact_phone";
const CONTACT_WHATSAPP_KEY = "contact_whatsapp";
const CONTACT_EMAIL_KEY = "contact_email";
const CONTACT_ADDRESS_KEY = "contact_address";
const FACEBOOK_URL_KEY = "facebook_url";
const INSTAGRAM_URL_KEY = "instagram_url";
const DEFAULT_CONTACT_PHONE = process.env.NEXT_PUBLIC_PHONE_NUMBER || "+1-949-282-8611";
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

async function ensureSiteSettingsTable() {
  await dbQuery(
    `CREATE TABLE IF NOT EXISTS site_settings (
       setting_key TEXT PRIMARY KEY,
       setting_value TEXT NOT NULL,
       updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
     )`,
  );

  await Promise.all(
    Object.entries(DEFAULT_SETTINGS).map(([settingKey, settingValue]) =>
      dbQuery(
        `INSERT INTO site_settings (setting_key, setting_value)
         VALUES ($1, $2)
         ON CONFLICT (setting_key) DO NOTHING`,
        [settingKey, settingValue],
      ),
    ),
  );
}

async function readSiteSettings(): Promise<SiteSettings> {
  await ensureSiteSettingsTable();

  const result = await dbQuery<SiteSettingRow>(
    `SELECT setting_key, setting_value
     FROM site_settings
     WHERE setting_key = ANY($1::text[])`,
    [Object.keys(DEFAULT_SETTINGS)],
  );

  const values = new Map<SiteSettingKey, string>();
  for (const row of result.rows) {
    values.set(row.setting_key, row.setting_value.trim());
  }

  const contactPhoneDisplay = values.get(CONTACT_PHONE_KEY) || DEFAULT_CONTACT_PHONE;
  const contactWhatsappDisplay = values.get(CONTACT_WHATSAPP_KEY) || DEFAULT_CONTACT_WHATSAPP;
  const contactEmailDisplay = values.get(CONTACT_EMAIL_KEY) || DEFAULT_CONTACT_EMAIL;
  const contactAddressDisplay = values.get(CONTACT_ADDRESS_KEY) || DEFAULT_CONTACT_ADDRESS;
  const facebookUrl = values.get(FACEBOOK_URL_KEY) || DEFAULT_FACEBOOK_URL;
  const instagramUrl = values.get(INSTAGRAM_URL_KEY) || DEFAULT_INSTAGRAM_URL;
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

  await ensureSiteSettingsTable();
  await Promise.all(
    Object.entries(nextValues).map(([settingKey, settingValue]) =>
      dbQuery(
        `INSERT INTO site_settings (setting_key, setting_value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (setting_key)
         DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()`,
        [settingKey, settingValue],
      ),
    ),
  );

  return readSiteSettings();
}
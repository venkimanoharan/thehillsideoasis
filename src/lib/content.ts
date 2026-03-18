import { dbQuery } from "@/lib/db";

export type RoomRecord = {
  id: number;
  slug: string;
  name: string;
  capacity: string;
  bed: string;
  view_label: string;
  description: string;
  amenities: string[];
  price_per_night: number;
  image_url: string;
};

export type ActivityRecord = {
  id: number;
  category: "on_property" | "local_attraction";
  title: string;
  description: string;
  duration_label: string | null;
  price_label: string | null;
  distance_label: string | null;
};

export type GalleryItemRecord = {
  id: number;
  image_url: string;
  alt_text: string;
};

export type SectionRecord = {
  section_key: string;
  title: string;
  subtitle: string | null;
  body: string;
};

export async function getRooms(): Promise<RoomRecord[]> {
  const result = await dbQuery<RoomRecord>(
    `SELECT id, slug, name, capacity, bed, view_label, description, amenities, price_per_night, image_url
     FROM rooms
     WHERE is_active = TRUE
     ORDER BY sort_order ASC, id ASC`,
  );

  return result.rows;
}

export async function getActivities(
  category?: "on_property" | "local_attraction",
): Promise<ActivityRecord[]> {
  if (category) {
    const result = await dbQuery<ActivityRecord>(
      `SELECT id, category, title, description, duration_label, price_label, distance_label
       FROM activities
       WHERE is_active = TRUE AND category = $1
       ORDER BY sort_order ASC, id ASC`,
      [category],
    );

    return result.rows;
  }

  const result = await dbQuery<ActivityRecord>(
    `SELECT id, category, title, description, duration_label, price_label, distance_label
     FROM activities
     WHERE is_active = TRUE
     ORDER BY sort_order ASC, id ASC`,
  );

  return result.rows;
}

export async function getGalleryItems(): Promise<GalleryItemRecord[]> {
  const result = await dbQuery<GalleryItemRecord>(
    `SELECT id, image_url, alt_text
     FROM gallery_items
     WHERE is_active = TRUE
     ORDER BY sort_order ASC, id ASC`,
  );

  return result.rows;
}

export async function getSection(sectionKey: string): Promise<SectionRecord | null> {
  const result = await dbQuery<SectionRecord>(
    `SELECT section_key, title, subtitle, body
     FROM site_sections
     WHERE section_key = $1
     LIMIT 1`,
    [sectionKey],
  );

  return result.rows[0] ?? null;
}

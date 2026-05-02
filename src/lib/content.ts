import fs from "fs/promises";
import path from "path";

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
  try {
    const data = await fs.readFile(path.join(process.cwd(), "data", "rooms.json"), "utf-8");
    const items = JSON.parse(data).filter((r: any) => r.is_active !== false);
    items.sort((a: any, b: any) => a.sort_order - b.sort_order || a.id - b.id);
    return items;
  } catch {
    return [];
  }
}
export async function getActivities(
  category?: "on_property" | "local_attraction",
): Promise<ActivityRecord[]> {
  try {
    const data = await fs.readFile(path.join(process.cwd(), "data", "activities.json"), "utf-8");
    let items = JSON.parse(data).filter((a: any) => a.is_active !== false);
    if (category) {
      items = items.filter((a: any) => a.category === category);
    }
    items.sort((a: any, b: any) => a.sort_order - b.sort_order || a.id - b.id);
    return items;
  } catch {
    return [];
  }
}

export async function getGalleryItems(): Promise<GalleryItemRecord[]> {
  try {
    const data = await fs.readFile(path.join(process.cwd(), "data", "gallery.json"), "utf-8");
    const items = JSON.parse(data).filter((g: any) => g.is_active !== false);
    items.sort((a: any, b: any) => a.sort_order - b.sort_order || a.id - b.id);
    return items;
  } catch {
    return [];
  }
}

// Section support not implemented in file-based mode
export async function getSection(sectionKey: string): Promise<SectionRecord | null> {
  return null;
}

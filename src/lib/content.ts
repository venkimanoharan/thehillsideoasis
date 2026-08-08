import { getDb, COLLECTIONS } from "@/lib/firestore";

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

function sortByOrder<T extends { sort_order?: number; id: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id);
}

export async function getRooms(): Promise<RoomRecord[]> {
  const snapshot = await getDb().collection(COLLECTIONS.rooms).get();
  const items = snapshot.docs
    .map((doc) => doc.data() as RoomRecord & { sort_order?: number; is_active?: boolean })
    .filter((room) => room.is_active !== false);
  return sortByOrder(items);
}

export async function getActivities(
  category?: "on_property" | "local_attraction",
): Promise<ActivityRecord[]> {
  const snapshot = await getDb().collection(COLLECTIONS.activities).get();
  let items = snapshot.docs
    .map((doc) => doc.data() as ActivityRecord & { sort_order?: number; is_active?: boolean })
    .filter((activity) => activity.is_active !== false);

  if (category) {
    items = items.filter((activity) => activity.category === category);
  }

  return sortByOrder(items);
}

export async function getGalleryItems(): Promise<GalleryItemRecord[]> {
  const snapshot = await getDb().collection(COLLECTIONS.gallery).get();
  const items = snapshot.docs
    .map((doc) => doc.data() as GalleryItemRecord & { sort_order?: number; is_active?: boolean })
    .filter((item) => item.is_active !== false);
  return sortByOrder(items);
}

// Section support not implemented (no admin UI or seed data manages CMS sections yet).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getSection(sectionKey: string): Promise<SectionRecord | null> {
  return null;
}

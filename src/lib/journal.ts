import { COLLECTIONS, getDb } from "@/lib/firestore";

export type JournalPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url: string;
  body: string;
  seo_description: string;
  published_at: string;
  is_published: boolean;
};

export type JournalBlock = { type: "heading" | "paragraph"; text: string };

/** Blank-line-separated paragraphs; a block starting with "## " becomes a heading. */
export function parseJournalBody(raw: string): JournalBlock[] {
  return raw
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) =>
      block.startsWith("## ")
        ? { type: "heading" as const, text: block.slice(3).trim() }
        : { type: "paragraph" as const, text: block },
    );
}

export async function getJournalPosts(): Promise<JournalPost[]> {
  const snapshot = await getDb().collection(COLLECTIONS.journalPosts).get();
  return snapshot.docs
    .map((doc) => doc.data() as JournalPost)
    .filter((post) => post.is_published !== false)
    .sort((a, b) => (a.published_at < b.published_at ? 1 : -1));
}

export async function getJournalPostBySlug(slug: string): Promise<JournalPost | null> {
  const snapshot = await getDb()
    .collection(COLLECTIONS.journalPosts)
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const post = snapshot.docs[0]!.data() as JournalPost;
  return post.is_published === false ? null : post;
}

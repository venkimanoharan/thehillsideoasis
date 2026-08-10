import type { MetadataRoute } from "next";
import { getJournalPosts } from "@/lib/journal";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://thehillsideoasis.com";
  const now = new Date();

  const posts = await getJournalPosts();
  const journalUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/journal/${post.slug}`,
    lastModified: new Date(post.published_at),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    {
      url: `${baseUrl}/journal`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...journalUrls,
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/stay`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/booking`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/activities`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}

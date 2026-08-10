import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import LogoMark from "@/components/logo-mark";
import { getJournalPosts } from "@/lib/journal";

export const metadata: Metadata = {
  title: "The Journal | Pollachi & Western Ghats Travel Guides",
  description:
    "Guides to Pollachi, Topslip, and the Western Ghats from The HillSide Oasis — what to see, when to visit, and how to plan your stay.",
  keywords: [
    "Pollachi travel guide",
    "Topslip wildlife sanctuary",
    "Western Ghats travel tips",
    "things to do near Pollachi",
    "best time to visit Pollachi",
  ],
  alternates: {
    canonical: "/journal",
  },
  openGraph: {
    title: "The Journal | Pollachi & Western Ghats Travel Guides",
    description:
      "Guides to Pollachi, Topslip, and the Western Ghats from The HillSide Oasis — what to see, when to visit, and how to plan your stay.",
    url: "https://thehillsideoasis.com/journal",
    type: "website",
    images: ["/images/9.jpeg"],
    siteName: "The HillSide Oasis",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Journal | Pollachi & Western Ghats Travel Guides",
    description:
      "Guides to Pollachi, Topslip, and the Western Ghats from The HillSide Oasis — what to see, when to visit, and how to plan your stay.",
    images: ["/images/9.jpeg"],
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function JournalIndexPage() {
  const posts = await getJournalPosts();

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only absolute left-2 top-2 z-50 bg-white text-black p-2 rounded shadow">
        Skip to main content
      </a>

      <main id="main-content" role="main" className="luxury-bg px-5 pb-16 pt-24 text-foreground sm:px-6">
        <section
          className="hero-shell overflow-hidden rounded-[2rem] border border-[#d7c8b5] p-8 shadow-[0_26px_56px_-42px_rgba(35,24,14,0.75)] sm:p-12"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(17, 35, 28, 0.82), rgba(17, 35, 28, 0.58), rgba(91, 67, 42, 0.45)), url('/images/9.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
            <LogoMark className="h-10 w-10" />
            <p className="eyebrow text-[#f4e7d6]">The Journal</p>
          </div>
          <p className="eyebrow text-[#e7d3b8]">Notes From Pollachi</p>
          <h1 className="hero-title mt-4 max-w-4xl text-[#fbf1e4]">Guides to the Western Ghats, written for your next visit</h1>
          <p className="mt-6 max-w-3xl text-[1.04rem] leading-8 text-[#e8d9c3]">
            What to see, when to go, and how to make the most of Pollachi — from our team on the ground.
          </p>
        </section>

        <section className="section-shell mt-10">
          {posts.length === 0 ? (
            <p className="text-sm text-[#5f5245]">New guides are on the way — check back soon.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/journal/${post.slug}`}
                  className="luxury-card group flex flex-col overflow-hidden rounded-2xl"
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={post.cover_image_url}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="eyebrow text-[#6b5638]">{formatDate(post.published_at)}</p>
                    <h2 className="font-display mt-2 text-2xl leading-tight text-[#241d16]">{post.title}</h2>
                    <p className="mt-3 flex-1 text-sm leading-7 text-[#5f5245]">{post.excerpt}</p>
                    <span className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-[#214032]">Read the guide &rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

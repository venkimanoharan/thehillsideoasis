import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJournalPostBySlug, parseJournalBody } from "@/lib/journal";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);

  if (!post) {
    return { title: "Guide Not Found" };
  }

  return {
    title: post.title,
    description: post.seo_description || post.excerpt,
    alternates: {
      canonical: `/journal/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.seo_description || post.excerpt,
      url: `https://thehillsideoasis.com/journal/${post.slug}`,
      type: "article",
      images: [post.cover_image_url],
      siteName: "The HillSide Oasis",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.seo_description || post.excerpt,
      images: [post.cover_image_url],
    },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function JournalPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getJournalPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const blocks = parseJournalBody(post.body);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seo_description || post.excerpt,
    image: [`https://thehillsideoasis.com${post.cover_image_url}`],
    datePublished: post.published_at,
    author: {
      "@type": "Organization",
      name: "The HillSide Oasis",
    },
    publisher: {
      "@type": "Organization",
      name: "The HillSide Oasis",
    },
    mainEntityOfPage: `https://thehillsideoasis.com/journal/${post.slug}`,
  };

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only absolute left-2 top-2 z-50 bg-white text-black p-2 rounded shadow">
        Skip to main content
      </a>
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>

      <main id="main-content" role="main" className="luxury-bg px-5 pb-16 pt-24 text-foreground sm:px-6">
        <article className="section-shell">
          <p className="eyebrow text-[#6b5638]">
            <Link href="/journal" className="hover:underline">
              The Journal
            </Link>{" "}
            &middot; {formatDate(post.published_at)}
          </p>
          <h1 className="font-display mt-3 max-w-4xl text-4xl leading-tight text-[#241d16] sm:text-5xl">{post.title}</h1>
          <p className="mt-4 max-w-2xl text-[1.02rem] leading-8 text-[#5f5245]">{post.excerpt}</p>

          <div className="relative mt-8 h-64 w-full overflow-hidden rounded-3xl border border-[#d7c8b5] sm:h-96">
            <Image
              src={post.cover_image_url}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="mt-10 max-w-2xl">
            {blocks.map((block, idx) =>
              block.type === "heading" ? (
                <h2 key={idx} className="font-display mt-10 text-2xl leading-tight text-[#241d16] first:mt-0">
                  {block.text}
                </h2>
              ) : (
                <p key={idx} className="mt-4 text-[1.02rem] leading-8 text-[#4b4238]">
                  {block.text}
                </p>
              ),
            )}
          </div>

          <div className="luxury-card mt-12 max-w-2xl rounded-2xl p-6 sm:p-8">
            <p className="eyebrow text-[#6b5638]">Plan Your Stay</p>
            <h2 className="font-display mt-2 text-2xl text-[#241d16]">Ready to see it for yourself?</h2>
            <p className="mt-3 text-sm leading-7 text-[#5f5245]">
              The HillSide Oasis is a short drive from everything in this guide, with concierge support to help plan your days.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/booking" className="luxury-btn-primary rounded-full px-5 py-3 text-xs font-bold uppercase tracking-[0.12em]">
                Check Availability
              </Link>
              <Link href="/journal" className="luxury-btn-secondary rounded-full px-5 py-3 text-xs font-bold uppercase tracking-[0.12em]">
                More Guides
              </Link>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}

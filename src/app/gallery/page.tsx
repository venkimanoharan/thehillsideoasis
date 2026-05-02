import type { Metadata } from "next";
import Image from "next/image";
import LogoMark from "@/components/logo-mark";
import { getGalleryItems } from "@/lib/content";
import Head from "next/head";

// Removed force-dynamic to allow SSG/ISR for better performance and SEO


export const metadata: Metadata = {
  title: "Resort Gallery | Luxury Farm Stay in Pollachi",
  description:
    "View the luxury farm stay gallery of The HillSide Oasis in Pollachi featuring suites, landscapes, and curated guest experiences.",
  keywords: [
    "Pollachi resort gallery",
    "HillSide Oasis photos",
    "Western Ghats nature pictures",
    "Pollachi farm stay images",
    "resort gallery Tamil Nadu",
  ],
  alternates: {
    canonical: "/gallery",
  },
  openGraph: {
    title: "Resort Gallery | Luxury Farm Stay in Pollachi",
    description:
      "View the luxury farm stay gallery of The HillSide Oasis in Pollachi featuring suites, landscapes, and curated guest experiences.",
    url: "https://thehillsideoasis.com/gallery",
    type: "website",
    images: ["/images/2.jpeg"],
    siteName: "The HillSide Oasis",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resort Gallery | Luxury Farm Stay in Pollachi",
    description:
      "View the luxury farm stay gallery of The HillSide Oasis in Pollachi featuring suites, landscapes, and curated guest experiences.",
    images: ["/images/2.jpeg"],
  },
};

export default async function GalleryPage() {
  const items = await getGalleryItems();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "name": "Gallery of The HillSide Oasis",
    "image": items.map((item) => `https://thehillsideoasis.com${item.image_url}`),
  };

  return (
    <>
      <Head>
        <title>Resort Gallery | Luxury Farm Stay in Pollachi</title>
        <meta name="description" content="View the luxury farm stay gallery of The HillSide Oasis in Pollachi featuring suites, landscapes, and curated guest experiences." />
        <meta property="og:title" content="Resort Gallery | Luxury Farm Stay in Pollachi" />
        <meta property="og:description" content="View the luxury farm stay gallery of The HillSide Oasis in Pollachi featuring suites, landscapes, and curated guest experiences." />
        <meta property="og:image" content="/images/2.jpeg" />
        <meta property="og:url" content="https://thehillsideoasis.com/gallery" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Resort Gallery | Luxury Farm Stay in Pollachi" />
        <meta name="twitter:description" content="View the luxury farm stay gallery of The HillSide Oasis in Pollachi featuring suites, landscapes, and curated guest experiences." />
        <meta name="twitter:image" content="/images/2.jpeg" />
        <link rel="canonical" href="https://thehillsideoasis.com/gallery" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Head>

      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only absolute left-2 top-2 z-50 bg-white text-black p-2 rounded shadow">
        Skip to main content
      </a>
      <main id="main-content" className="luxury-bg px-5 pb-16 pt-24 text-foreground sm:px-6" role="main">
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
            <p className="eyebrow text-[#f4e7d6]">Visual Archive</p>
          </div>
          <p className="eyebrow text-[#e7d3b8]">Gallery</p>
          <h1 className="hero-title mt-4 max-w-4xl text-[#fbf1e4]">Moments of landscape, architecture, and celebration</h1>
          <p className="mt-6 max-w-3xl text-[1.04rem] leading-8 text-[#e8d9c3]">
            A curated visual portfolio of The HillSide Oasis across seasons and guest journeys.
          </p>
        </section>

        <section className="section-shell mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="region" aria-labelledby="gallery-title">
          <h2 id="gallery-title" className="sr-only">Gallery Images</h2>
          {items.map((item) => (
            <figure key={item.id} className="luxury-card overflow-hidden rounded-2xl">
              <div className="relative h-64 w-full">
                <Image src={item.image_url} alt={item.alt_text} fill className="object-cover" />
              </div>
              <figcaption className="p-4 text-sm leading-7 text-[#5f5245]">{item.alt_text}</figcaption>
            </figure>
          ))}
        </section>
      </main>
    </>
  );
}

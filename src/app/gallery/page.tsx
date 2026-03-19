import type { Metadata } from "next";
import Image from "next/image";
import { getGalleryItems } from "@/lib/content";
import LogoMark from "@/components/logo-mark";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resort Gallery | Luxury Farm Stay in Pollachi",
  description:
    "View the luxury farm stay gallery of The HillSide Oasis in Pollachi featuring suites, landscapes, and curated guest experiences.",
  keywords: [
    "Pollachi resort gallery",
    "luxury farm stay photos",
    "Western Ghats retreat images",
  ],
  alternates: {
    canonical: "/gallery",
  },
  openGraph: {
    title: "Resort Gallery | Luxury Farm Stay in Pollachi",
    description:
      "Take a visual tour of accommodations, landscapes, and experiences at The HillSide Oasis.",
    images: ["/images/11.jpeg"],
    type: "website",
    url: "https://thehillsideoasis.com/gallery",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resort Gallery | Luxury Farm Stay in Pollachi",
    description: "Browse scenic moments from The HillSide Oasis nature retreat.",
    images: ["/images/11.jpeg"],
  },
};

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <main className="luxury-bg px-6 pb-16 pt-24 text-foreground">
      <section
        className="hero-shell rounded-3xl border border-white/40 p-8 shadow-2xl sm:p-12 reveal-fade parallax-surface"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(85, 32, 8, 0.82), rgba(9, 6, 3, 0.55)), url('/images/9.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mb-5 flex items-center gap-3">
          <LogoMark className="h-14 w-14 border-white/35 bg-[#f4e9dc]" imageClassName="scale-[1.12]" />
          <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-orange-50 backdrop-blur-sm">
            Visual Journey
          </div>
        </div>
        <p className="eyebrow text-orange-100">Gallery</p>
        <h1 className="font-display mt-3 text-4xl text-white sm:text-6xl">A Glimpse of The Oasis</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-orange-50">
          A visual journey through luxury cottages, orchards, mountain views, and curated experiences in Pollachi.
        </p>
      </section>

      <section className="mx-auto mt-8 grid max-w-[84rem] gap-5 lg:grid-cols-[1.05fr_1fr]">
        <article className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl reveal-up">
          <p className="eyebrow text-brand">Visual Storybook</p>
          <h2 className="section-title mt-3 text-zinc-900">Frames Of A Destination Experience</h2>
          <p className="lead-copy mt-3">
            This gallery is curated like a resort editorial: morning textures, landscape depth, celebratory evenings, and still moments in between.
          </p>
        </article>
        <div
          className="parallax-surface min-h-[20rem] overflow-hidden rounded-3xl border border-zinc-200 shadow-xl reveal-up reveal-delay-1"
          style={{
            backgroundImage:
              "linear-gradient(170deg, rgba(10,20,35,0.2), rgba(10,20,35,0.6)), url('/images/12.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </section>

      <section className="mx-auto mt-10 grid max-w-[84rem] gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-grid">
        {items.map((item) => (
          <figure key={item.id} className="overflow-hidden rounded-2xl luxury-card">
            <div className="relative h-64 w-full">
              <Image src={item.image_url} alt={item.alt_text} fill className="object-cover" />
            </div>
            <figcaption className="p-3 text-sm text-zinc-700">{item.alt_text}</figcaption>
          </figure>
        ))}
      </section>

      <section className="mx-auto mt-10 grid max-w-[84rem] gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <article
            key={index}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-lg reveal-up"
            style={{ animationDelay: `${0.1 * (index + 1)}s` }}
          >
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Curated Moment {index + 1}</p>
            <p className="mt-2 text-sm leading-7 text-zinc-700">
              {index === 0
                ? "Morning light through the valley lines and estate greens."
                : index === 1
                  ? "Afternoon experiences designed with natural pacing."
                  : "Evening celebrations and quiet conversations under open skies."}
            </p>
          </article>
        ))}
      </section>

      <section className="mx-auto mt-12 max-w-[84rem] rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl reveal-up">
        <p className="eyebrow text-brand">Captured Moments</p>
        <h2 className="section-title mt-3 text-zinc-900">From Sunrise Tranquility To Celebration Nights</h2>
        <p className="lead-copy mt-3 max-w-3xl">
          Every frame reflects our design intent: relaxed luxury, natural beauty, and meaningful experiences shared with the people you love.
        </p>
      </section>
    </main>
  );
}

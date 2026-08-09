import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import LogoMark from "@/components/logo-mark";
import { getRooms } from "@/lib/content";

export const metadata: Metadata = {
  title: "Luxury Cottages and Farm Stay in Pollachi",
  description:
    "Explore luxury cottages and private farm stay suites in Pollachi at The HillSide Oasis with Western Ghats views and concierge hospitality.",
  keywords: [
    "Pollachi cottages",
    "farm stay Pollachi",
    "Western Ghats stay",
    "Pollachi accommodations",
    "nature resort Tamil Nadu",
    "HillSide Oasis rooms",
  ],
  alternates: {
    canonical: "/stay",
  },
  openGraph: {
    title: "Luxury Cottages and Farm Stay in Pollachi",
    description:
      "Explore luxury cottages and private farm stay suites in Pollachi at The HillSide Oasis with Western Ghats views and concierge hospitality.",
    url: "https://thehillsideoasis.com/stay",
    type: "website",
    images: ["/images/2.jpeg"],
    siteName: "The HillSide Oasis",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury Cottages and Farm Stay in Pollachi",
    description:
      "Explore luxury cottages and private farm stay suites in Pollachi at The HillSide Oasis with Western Ghats views and concierge hospitality.",
    images: ["/images/2.jpeg"],
  },
};

export default async function StayPage() {
  const rooms = await getRooms();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Rooms and Suites at The HillSide Oasis",
    "itemListElement": rooms.map((room, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": room.name,
      "description": room.description,
      "url": `https://thehillsideoasis.com/stay#room-${room.id}`
    }))
  };

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only absolute left-2 top-2 z-50 bg-white text-black p-2 rounded shadow">
        Skip to main content
      </a>
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>

      <main id="main-content" className="luxury-bg px-5 pb-16 pt-24 text-foreground sm:px-6" role="main">
        <section
          className="hero-shell overflow-hidden rounded-[2rem] border border-[#d7c8b5] p-8 shadow-[0_26px_56px_-42px_rgba(35,24,14,0.75)] sm:p-12"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(17, 35, 28, 0.82), rgba(17, 35, 28, 0.58), rgba(91, 67, 42, 0.45)), url('/images/4.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden="true"
        >
          <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
            <LogoMark className="h-10 w-10" />
            <p className="eyebrow text-[#f4e7d6]">Accommodations</p>
          </div>
          <p className="eyebrow text-[#e7d3b8]">Signature Suites</p>
          <h1 className="hero-title mt-4 max-w-4xl text-[#fbf1e4]">Residences crafted for privacy, comfort, and natural views</h1>
          <p className="mt-6 max-w-3xl text-[1.04rem] leading-8 text-[#e8d9c3]">
            Choose from refined room categories designed for couples, families, and slow-luxury travelers.
          </p>
        </section>

        <section className="section-shell mt-10 grid gap-8" role="region" aria-labelledby="rooms-title">
          <h2 id="rooms-title" className="sr-only">Rooms and Suites</h2>
          {rooms.map((room, index) => (
            <article key={room.id} className="grid gap-6 rounded-3xl luxury-card p-5 sm:p-7 md:grid-cols-2">
              <div className={index % 2 ? "md:order-2" : ""}>
                <div className="relative h-72 overflow-hidden rounded-2xl sm:h-80">
                  <Image
                    src={room.image_url}
                    alt={room.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <h2 className="font-display text-3xl text-[#231c15]">{room.name}</h2>
                <ul className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#6c5b49]">
                  {[room.capacity, room.bed, room.view_label].map((detail, idx) => (
                    <li key={idx} className="rounded-full border border-[#d2c2ae] bg-[#f8f2e8] px-3 py-1">
                      {detail}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-sm leading-8 text-[#5f5245]">{room.description}</p>
                <ul className="mt-5 grid gap-2 text-sm text-[#5f5245]">
                  {room.amenities.map((amenity) => (
                    <li key={amenity}>- {amenity}</li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Link
                    href={`/booking?room=${room.slug}`}
                    className="luxury-btn-primary rounded-full px-5 py-3 text-xs font-bold uppercase tracking-[0.12em]"
                  >
                    Reserve This Suite
                  </Link>
                  <span className="text-sm font-semibold text-[#8a6b3a]">
                    From INR {room.price_per_night.toLocaleString()} / night
                  </span>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}

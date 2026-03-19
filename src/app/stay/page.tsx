import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getRooms } from "@/lib/content";
import LogoMark from "@/components/logo-mark";

export const dynamic = "force-dynamic";

const perks = [
  {
    title: "Farm-to-Table Meals",
    text: "Complimentary breakfast with local ingredients. Lunch and dinner available on request.",
  },
  {
    title: "Modern Bathrooms",
    text: "Hot water showers, premium toiletries, and eco-friendly essentials.",
  },
  {
    title: "Free WiFi",
    text: "Reliable internet across the property for work and leisure.",
  },
  {
    title: "Free Parking",
    text: "Ample secure parking with easy access for all guests.",
  },
  {
    title: "Housekeeping",
    text: "Daily room refresh to keep every stay comfortable.",
  },
  {
    title: "24/7 Support",
    text: "Our on-site team is available whenever you need help.",
  },
];

export const metadata: Metadata = {
  title: "Luxury Cottages and Farm Stay in Pollachi",
  description:
    "Explore luxury cottages and private farm stay suites in Pollachi at The HillSide Oasis with Western Ghats views and concierge hospitality.",
  keywords: [
    "luxury cottages Pollachi",
    "farm stay rooms Pollachi",
    "private suite stay Tamil Nadu",
    "nature resort accommodations",
  ],
  alternates: {
    canonical: "/stay",
  },
  openGraph: {
    title: "Luxury Cottages and Farm Stay in Pollachi",
    description:
      "Discover private suites and family cottages surrounded by orchards with premium mountain-retreat comfort.",
    images: ["/images/4.jpeg"],
    type: "website",
    url: "https://thehillsideoasis.com/stay",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury Cottages and Farm Stay in Pollachi",
    description:
      "Choose from premium suites and cottages designed for serene Western Ghats escapes.",
    images: ["/images/4.jpeg"],
  },
};

export default async function StayPage() {
  const rooms = await getRooms();

  return (
    <main className="luxury-bg text-foreground">
      <section className="relative overflow-hidden px-6 pb-16 pt-24">
        <div
          className="hero-shell relative overflow-hidden rounded-3xl border border-white/30 px-8 py-14 shadow-2xl sm:px-14 reveal-fade parallax-surface"
          style={{
            backgroundImage:
              "linear-gradient(118deg, rgba(80, 30, 8, 0.83), rgba(15, 8, 3, 0.62)), url('/images/4.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="mb-5 flex items-center gap-3">
            <LogoMark className="h-14 w-14 border-white/35" />
            <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-orange-50 backdrop-blur-sm">
              Signature Suites
            </div>
          </div>
          <p className="eyebrow text-orange-100">Places to Stay</p>
          <h1 className="font-display mt-3 text-4xl text-white sm:text-6xl">
            Choose Your Retreat
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-orange-50">
            Signature suites and private cottages designed for restorative luxury,
            mountain silence, and personalized estate-style service.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 reveal-up">
            <Link
              href="/"
              className="luxury-btn-secondary rounded-full px-5 py-3 text-sm font-semibold"
            >
              Home
            </Link>
            <a
              href="tel:+919150360597"
              className="luxury-btn-primary rounded-full px-5 py-3 text-sm font-semibold"
            >
              Call +91 91503 60597
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[84rem] gap-6 px-6 pb-4 lg:grid-cols-[1.2fr_1fr]">
        <article className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl reveal-up">
          <p className="eyebrow text-brand">Editorial Feature</p>
          <h2 className="section-title mt-3 text-zinc-900">A Signature Resort Narrative In Every Room</h2>
          <p className="lead-copy mt-3">
            From handcrafted textiles to mountain-facing sit-outs, each room is staged like a private chapter in a destination story. The design language is intentionally calm, textured, and rooted in Pollachi's natural rhythm.
          </p>
        </article>
        <article className="rounded-3xl border border-[#3d1a0a]/30 bg-[linear-gradient(145deg,#1c0806,#3d1a0a)] p-8 text-zinc-100 shadow-xl reveal-up reveal-delay-1">
          <p className="eyebrow text-orange-200">Guest Preference</p>
          <ul className="mt-4 grid gap-3 text-sm">
            <li>Honeymoon and anniversary suites</li>
            <li>Family cottages with shared lounge vibe</li>
            <li>Premium mountain-facing morning routines</li>
            <li>Workcation-ready comfort and connectivity</li>
          </ul>
        </article>
      </section>

      <section className="mx-auto grid max-w-[84rem] gap-10 px-6 pb-16 stagger-grid">
        {rooms.map((room, index) => (
          <article
            key={room.id}
            className="grid gap-6 rounded-3xl luxury-card p-5 sm:p-7 md:grid-cols-2"
          >
            <div className={index % 2 === 1 ? "md:order-2" : ""}>
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
              <h2 className="font-display text-3xl text-zinc-900">{room.name}</h2>
              <ul className="mt-3 flex flex-wrap gap-2 text-sm font-medium text-zinc-700">
                {[room.capacity, room.bed, room.view_label].map((detail) => (
                  <li
                    key={detail}
                    className="rounded-full bg-brand-soft px-3 py-1 text-brand-strong"
                  >
                    {detail}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-zinc-700">{room.description}</p>
              <ul className="mt-5 grid gap-2 text-sm text-zinc-700">
                {room.amenities.map((amenity) => (
                  <li key={amenity}>- {amenity}</li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link
                  href={`/booking?room=${room.slug}`}
                  className="luxury-btn-primary rounded-full px-5 py-3 text-sm font-semibold"
                >
                  Check Availability
                </Link>
                <span className="text-sm font-semibold text-gold">
                  Starting from INR {room.price_per_night.toLocaleString()}/night
                </span>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-[84rem]">
          <h2 className="section-title text-zinc-900 reveal-up">What&apos;s Included</h2>
          <p className="lead-copy mt-3">
            Every stay includes thoughtful comforts, attentive service, and concierge-level care.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-grid">
            {perks.map((perk) => (
              <article key={perk.title} className="rounded-2xl luxury-card p-5">
                <h3 className="text-lg font-semibold text-zinc-900">{perk.title}</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-700">{perk.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-brand-soft bg-white p-8 shadow-xl reveal-up">
            <p className="eyebrow text-brand">Tailored For You</p>
            <h3 className="section-title mt-3 text-zinc-900">Request A Personalized Stay Plan</h3>
            <p className="lead-copy mt-3 max-w-3xl">
              Share your preferred dates and travel style. Our team will curate a room and experience plan suitable for couples, families, or private groups.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/booking" className="luxury-btn-primary rounded-full px-5 py-3 text-sm font-bold">
                Start Booking
              </Link>
              <Link href="/contact" className="luxury-btn-secondary rounded-full px-5 py-3 text-sm font-bold">
                Speak To Concierge
              </Link>
            </div>
          </div>

          <div
            className="parallax-surface mt-10 overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-900 shadow-2xl"
            style={{
              backgroundImage:
                "linear-gradient(110deg, rgba(20,8,3,0.65), rgba(85,32,8,0.58)), url('https://images.pexels.com/photos/28901908/pexels-photo-28901908.jpeg?auto=compress&cs=tinysrgb&w=1800')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="max-w-3xl p-8 sm:p-12">
              <p className="eyebrow text-orange-200">Stay Flow</p>
              <h3 className="font-display mt-3 text-4xl text-white">From Arrival Ritual To Sunset Silence</h3>
              <p className="mt-3 leading-8 text-zinc-100">
                Check-in is paced, not rushed. Expect welcome refreshment, room orientation, curated local suggestions, and optional evening activity scheduling for a complete destination-stay arc.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

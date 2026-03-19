import type { Metadata } from "next";
import Link from "next/link";
import LogoMark from "@/components/logo-mark";

export const metadata: Metadata = {
  title: "Luxury Farm Stay in Pollachi",
  description:
    "Book a luxury farm stay in Pollachi at The HillSide Oasis with private cottages, concierge support, and curated Western Ghats experiences.",
  alternates: {
    canonical: "/",
  },
};

const highlights = [
  {
    title: "Estate Living",
    description:
      "Private orchard walks, sunrise tea service, and curated farm stories rooted in Pollachi.",
    href: "/stay",
    cta: "Discover",
  },
  {
    title: "Signature Suites",
    description:
      "Handcrafted suites with elevated interiors, mountain silhouettes, and quiet-luxury comfort.",
    href: "/stay",
    cta: "View Suites",
  },
  {
    title: "Curated Experiences",
    description:
      "From birdwatching and trail rituals to bespoke celebrations under the Western Ghats sky.",
    href: "/booking",
    cta: "Plan Experience",
  },
  {
    title: "Private Gatherings",
    description:
      "Host intimate destination events, family milestones, and executive retreats with dedicated service.",
    href: "/booking",
    cta: "Enquire",
  },
];

const heroVideo =
  "https://videos.pexels.com/video-files/4488285/4488285-hd_720_1280_30fps.mp4";

const imageSet = {
  sunrise:
    "/images/1.jpeg",
  estates:
    "/images/12.jpeg",
  valleys:
    "/images/10.jpeg",
  mountain:
    "/images/9.jpeg",
};

export default function Home() {
  const resortStructuredData = {
    "@context": "https://schema.org",
    "@type": "Resort",
    name: "The HillSide Oasis",
    description:
      "Luxury farm stay and private cottage retreat in Pollachi, Tamil Nadu with curated nature experiences.",
    url: "https://thehillsideoasis.com",
    telephone: "+91 91503 60597",
    email: "info@thehillsideoasis.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Arthanaripalayam",
      addressLocality: "Pollachi",
      addressRegion: "Tamil Nadu",
      postalCode: "642007",
      addressCountry: "IN",
    },
    image: ["https://thehillsideoasis.com/images/DSC_0072-PANO.jpg"],
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Where is The HillSide Oasis located?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The HillSide Oasis is located in Arthanaripalayam, Pollachi, Tamil Nadu near the Western Ghats.",
        },
      },
      {
        "@type": "Question",
        name: "How can I book a stay at The HillSide Oasis?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can check availability and submit your reservation from the booking page, or contact our concierge directly by phone or WhatsApp.",
        },
      },
      {
        "@type": "Question",
        name: "What type of experiences are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Guests can enjoy on-property nature experiences, farm-inspired hospitality, and curated local attractions around Pollachi.",
        },
      },
    ],
  };

  return (
    <main className="luxury-bg px-6 pb-20 pt-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(resortStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <section className="hero-shell-xl relative isolate overflow-hidden rounded-3xl border border-white/20 p-8 shadow-2xl sm:p-12">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          poster="/images/DSC_0072-PANO.jpg"
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          aria-label="Western Ghats waterfall cinematic background"
        />
        <div
          className="absolute inset-0 h-full w-full bg-cover bg-center opacity-45"
          style={{ backgroundImage: "url('/images/DSC_0072-PANO.jpg')" }}
        />
          <div className="absolute inset-0 bg-[linear-gradient(108deg,rgba(45,16,4,0.78)_0%,rgba(15,8,3,0.60)_48%,rgba(85,32,8,0.58)_100%)]" />

        <div className="relative grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <LogoMark className="h-14 w-14 border-white/35" />
              <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-orange-50 backdrop-blur-sm">
                Signature Nature Retreat
              </div>
            </div>
            <p className="eyebrow tracking-[0.3em] text-orange-100">
              The HillSide Oasis | Pollachi, Tamil Nadu
            </p>
            <h1 className="hero-title mt-4 text-white">
              Western Ghats grandeur, curated like a private resort estate
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-orange-50 sm:text-[1.08rem]">
              A cinematic luxury retreat inspired by mountain rain, tea-country roads, and timeless Pollachi hospitality. Stay in signature suites, dine in calm, and explore with concierge-crafted itineraries.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/booking"
                className="luxury-btn-primary rounded-full px-6 py-3 text-sm font-bold transition"
              >
                Build Your Journey
              </Link>
              <Link
                href="/stay"
                className="rounded-full border border-orange-100/70 bg-white/95 px-6 py-3 text-sm font-bold text-zinc-900 transition hover:bg-white"
              >
                View Accommodations
              </Link>
            </div>
          </div>

          <div className="glass-surface rounded-2xl p-6 text-zinc-900">
            <p className="eyebrow text-[#9e3e12]">Resort Highlights</p>
            <ul className="mt-4 grid gap-3 text-sm">
              <li>Curated experiences across Pollachi and Anaimalai foothills</li>
              <li>Mountain-view suites and private family cottages</li>
              <li>Event-ready retreat spaces for celebrations and gatherings</li>
              <li>Direct concierge booking with live availability checks</li>
            </ul>
            <a
              href="tel:+919150360597"
              className="mt-6 inline-block rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white"
            >
              Call Concierge
            </a>
          </div>
        </div>
      </section>

      <section className="section-shell mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Guest Rating", value: "4.9/5" },
          { label: "Resort Style", value: "Luxury Nature Estate" },
          { label: "Destination", value: "Pollachi, Western Ghats" },
        ].map((metric) => (
          <article key={metric.label} className="luxury-card rounded-2xl p-5 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{metric.label}</p>
            <p className="font-display mt-2 text-3xl text-zinc-900">{metric.value}</p>
          </article>
        ))}
      </section>

      <section className="section-shell mt-12 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <article className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl">
          <div
            className="h-[23rem] w-full"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(6,20,18,0.1), rgba(6,20,18,0.55)), url('${imageSet.estates}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="p-7">
            <p className="eyebrow text-brand">Stay In Style</p>
            <h2 className="section-title mt-3 text-zinc-900">Luxe Vibes With Western Ghats Views</h2>
            <p className="lead-copy mt-3">
              Inspired by five-star destination resorts, our suites blend warm regional textures with contemporary comfort. Wake to rain-fed hills, orchard breeze, and unhurried mornings.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/stay" className="luxury-btn-primary rounded-full px-5 py-3 text-sm font-bold">
                Explore Suites
              </Link>
              <Link href="/booking" className="luxury-btn-secondary rounded-full px-5 py-3 text-sm font-bold">
                Reserve Now
              </Link>
            </div>
          </div>
        </article>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="luxury-card rounded-2xl p-5 transition hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold text-zinc-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-zinc-700">{item.description}</p>
              <Link
                href={item.href}
                className="mt-4 inline-block text-sm font-bold text-brand hover:text-brand-strong"
              >
                {item.cta} →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell mt-12 grid gap-5 md:grid-cols-3">
        {[
          {
            title: "Tea Country Roads",
            text: "Scenic drives into Anaimalai and Valparai routes with curated stop points.",
            image: imageSet.sunrise,
          },
          {
            title: "Green Valley Mornings",
            text: "Misty horizons, paddy fields, and soft mountain light beyond Pollachi plains.",
            image: imageSet.valleys,
          },
          {
            title: "Monsoon Mountain Calm",
            text: "Rain-kissed ridges and forest edges that frame your stay with natural drama.",
            image: imageSet.mountain,
          },
        ].map((card) => (
          <article key={card.title} className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl">
            <div
              className="h-56 w-full"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(9,17,33,0.12), rgba(9,17,33,0.44)), url('${card.image}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="p-6">
              <h3 className="font-display text-2xl text-zinc-900">{card.title}</h3>
              <p className="mt-2 text-sm leading-7 text-zinc-700">{card.text}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="section-shell mt-12 rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl reveal-up">
        <p className="eyebrow text-brand">Inspired By The Western Ghats</p>
        <h2 className="section-title mt-2 text-zinc-900">Luxury Resort Feel, Rooted In Pollachi</h2>
        <p className="lead-copy mt-3">
          The HillSide Oasis is designed for modern travelers who want the polish of a premium resort with the soul of a nature destination. Every stay combines personalized planning, distinctive spaces, and region-first experiences across Pollachi and the Western Ghats corridor.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/activities" className="luxury-btn-secondary rounded-full px-5 py-3 text-sm font-bold">
            Explore Experiences
          </Link>
          <Link href="/contact" className="luxury-btn-primary rounded-full px-5 py-3 text-sm font-bold">
            Plan With Concierge
          </Link>
        </div>
      </section>

      <section className="section-shell mt-12 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_1fr]">
          <div className="p-8 sm:p-10">
            <p className="eyebrow text-brand">Virtual Itinerary Builder</p>
            <h2 className="section-title mt-3 text-zinc-900">Design Your Perfect Pollachi Escape</h2>
            <p className="lead-copy mt-3 max-w-2xl">
              Select your mood, pace, and preferred style. Our concierge team converts this into a personalized stay blueprint with room suggestions, activity balance, and dining recommendations.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Travel Mode", value: "Couple, Family, Group" },
                { label: "Stay Length", value: "2N, 3N, 4N+" },
                { label: "Experience Style", value: "Nature, Leisure, Celebration" },
                { label: "Trip Rhythm", value: "Relaxed, Balanced, Explorative" },
              ].map((item) => (
                <article key={item.label} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900">{item.value}</p>
                </article>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="luxury-btn-primary rounded-full px-5 py-3 text-sm font-bold">
                Start My Itinerary
              </Link>
              <Link href="/booking" className="luxury-btn-secondary rounded-full px-5 py-3 text-sm font-bold">
                Book Directly
              </Link>
            </div>
          </div>

          <div
            className="parallax-surface min-h-[22rem]"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(9,17,33,0.18), rgba(9,17,33,0.62)), url('https://images.pexels.com/photos/34130875/pexels-photo-34130875.jpeg?auto=compress&cs=tinysrgb&w=1800')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="flex h-full flex-col justify-end p-8 text-white">
              <p className="eyebrow text-orange-100">Concierge-Designed</p>
                            <p className="eyebrow text-orange-100">Concierge-Designed</p>
              <p className="font-display mt-2 text-3xl">Every Stay Can Feel Signature</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

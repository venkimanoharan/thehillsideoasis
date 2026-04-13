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

const features = [
  {
    title: "Estate Arrival",
    description:
      "Personal welcome rituals, curated room placement, and thoughtful concierge coordination from the moment you arrive.",
  },
  {
    title: "All-Suite Privacy",
    description:
      "A collection of signature rooms and cottages set within green contours, built for silence, comfort, and long-stay ease.",
  },
  {
    title: "Curated Coorg-like Mood",
    description:
      "Foggy mornings, forest palettes, and warm hospitality inspired by India\'s timeless hill-retreat traditions.",
  },
];

const journey = [
  {
    label: "Stay",
    text: "Choose room categories that match your pace, group type, and view preference.",
    href: "/stay",
    cta: "View Residences",
  },
  {
    label: "Explore",
    text: "Select gentle estate activities, local trails, and personalized nature-led outings.",
    href: "/activities",
    cta: "Plan Experiences",
  },
  {
    label: "Reserve",
    text: "Confirm dates directly with transparent room pricing and immediate support.",
    href: "/booking",
    cta: "Check Availability",
  },
];

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
    <main className="luxury-bg px-5 pb-20 pt-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(resortStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />

      <section className="hero-shell-xl overflow-hidden rounded-[2.2rem] border border-[#d7c8b5] shadow-[0_30px_70px_-48px_rgba(35,24,14,0.75)]">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_1fr]">
          <div
            className="relative min-h-[33rem] px-8 py-10 sm:px-12"
            style={{
              backgroundImage:
                "linear-gradient(118deg, rgba(18, 35, 28, 0.84), rgba(18, 35, 28, 0.62), rgba(89, 66, 42, 0.45)), url('/images/DSC_0072-PANO.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
              <LogoMark className="h-10 w-10" />
              <p className="eyebrow text-[#f4e7d6]">Heritage Nature Retreat</p>
            </div>

            <p className="eyebrow text-[#e9d3b5]">The HillSide Oasis . Pollachi</p>
            <h1 className="hero-title mt-4 max-w-3xl text-[#fbf1e4]">
              Grand hillside living with timeless Indian hospitality
            </h1>
            <p className="mt-6 max-w-2xl text-[1.02rem] leading-8 text-[#e6d4bc] sm:text-[1.08rem]">
              Inspired by the elegance of legacy hill destinations, The HillSide Oasis invites you to experience refined stays, tranquil landscape views, and concierge-led journeys.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/booking"
                className="luxury-btn-primary rounded-full px-6 py-3 text-xs font-bold uppercase tracking-[0.12em]"
              >
                Reserve Your Stay
              </Link>
              <Link
                href="/stay"
                className="luxury-btn-secondary rounded-full px-6 py-3 text-xs font-bold uppercase tracking-[0.12em]"
              >
                Explore Suites
              </Link>
            </div>
          </div>

          <aside className="bg-[#f7f2e8] p-7 sm:p-10">
            <p className="eyebrow text-[#7a6548]">Residence Highlights</p>
            <h2 className="font-display mt-3 text-4xl leading-none text-[#1f1812]">Designed For Slow Luxury</h2>
            <div className="section-rule my-6" />
            <ul className="grid gap-4 text-sm leading-7 text-[#5f5245]">
              <li>Private suites and family cottages with premium comforts</li>
              <li>Warm service rituals and tailor-made trip planning</li>
              <li>Seasonal experiences around Pollachi and Anaimalai</li>
              <li>Direct booking with responsive concierge assistance</li>
            </ul>
            <a
              href="tel:+919150360597"
              className="mt-7 inline-flex rounded-full border border-[#2f4f41] bg-[#214032] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-[#f8f0e4]"
            >
              Call Concierge
            </a>
          </aside>
        </div>
      </section>

      <section className="section-shell mt-10 grid gap-4 md:grid-cols-3">
        {features.map((item) => (
          <article key={item.title} className="heritage-frame luxury-card rounded-3xl p-6">
            <p className="eyebrow text-[#7f6a4f]">{item.title}</p>
            <p className="mt-3 text-sm leading-7 text-[#5b4f43]">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="section-shell mt-12 rounded-3xl border border-[#d8c9b5] bg-[#f9f4eb] p-7 sm:p-10">
        <p className="eyebrow text-[#7f6a4f]">Signature Journey</p>
        <h2 className="section-title mt-3 max-w-3xl text-[#241d16]">
          Three simple steps from discovery to your first morning at The HillSide Oasis
        </h2>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {journey.map((step) => (
            <article key={step.label} className="rounded-2xl border border-[#d8cab7] bg-white/90 p-5">
              <p className="eyebrow text-[#8a744f]">{step.label}</p>
              <p className="mt-3 text-sm leading-7 text-[#5d5044]">{step.text}</p>
              <Link href={step.href} className="mt-4 inline-block text-xs font-bold uppercase tracking-[0.11em] text-[#214032]">
                {step.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell mt-12 overflow-hidden rounded-3xl border border-[#d6c8b4] bg-[#f6efe3]">
        <div className="grid gap-0 lg:grid-cols-[1fr_1.1fr]">
          <div className="p-8 sm:p-10">
            <p className="eyebrow text-[#7a6548]">A New Standard In Pollachi</p>
            <h2 className="section-title mt-3 text-[#231d16]">
              Heritage-inspired elegance for modern travelers and family celebrations
            </h2>
            <p className="lead-copy mt-4 max-w-2xl">
              From intimate anniversary escapes to multi-generational gatherings, our estate hospitality is crafted around comfort, discretion, and meaningful experiences.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="luxury-btn-primary rounded-full px-5 py-3 text-xs font-bold uppercase tracking-[0.12em]">
                Plan With Our Team
              </Link>
              <Link href="/gallery" className="luxury-btn-secondary rounded-full px-5 py-3 text-xs font-bold uppercase tracking-[0.12em]">
                View Gallery
              </Link>
            </div>
          </div>

          <div className="p-7 sm:p-10">
            <div className="arched-media h-[22rem] border border-[#d3c4b0]">
              <div
                className="h-full w-full"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(11, 22, 19, 0.18), rgba(11, 22, 19, 0.52)), url('/images/12.jpeg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

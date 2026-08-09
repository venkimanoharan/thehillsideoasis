import type { Metadata } from "next";
import Link from "next/link";
import LogoMark from "@/components/logo-mark";
import { getSection } from "@/lib/content";

export const metadata: Metadata = {
  title: "About The HillSide Oasis Luxury Farm Retreat",
  description:
    "Learn about The HillSide Oasis, a luxury farm retreat in Pollachi built on sustainability, hospitality, and authentic local experiences.",
  keywords: [
    "About HillSide Oasis",
    "Pollachi farm stay",
    "Western Ghats retreat",
    "nature resort Pollachi",
    "sustainable resort Tamil Nadu",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About The HillSide Oasis Luxury Farm Retreat",
    description:
      "Learn about The HillSide Oasis, a luxury farm retreat in Pollachi built on sustainability, hospitality, and authentic local experiences.",
    url: "https://thehillsideoasis.com/about",
    type: "website",
    images: ["/images/2.jpeg"],
    siteName: "The HillSide Oasis",
  },
  twitter: {
    card: "summary_large_image",
    title: "About The HillSide Oasis Luxury Farm Retreat",
    description:
      "Learn about The HillSide Oasis, a luxury farm retreat in Pollachi built on sustainability, hospitality, and authentic local experiences.",
    images: ["/images/2.jpeg"],
  },
};

const values = [
  {
    title: "Heritage Hospitality",
    text: "Service rituals designed with warmth, discretion, and deeply personal guest attention.",
  },
  {
    title: "Landscape Respect",
    text: "Every stay experience is shaped around ecology, calm movement, and lower-impact operations.",
  },
  {
    title: "Local Culture",
    text: "Cuisine, stories, and activities are rooted in Pollachi and the surrounding foothill communities.",
  },
  {
    title: "Curated Living",
    text: "From arrival details to departure ease, each moment is planned with intent.",
  },
];

export default async function AboutPage() {
  const section = await getSection("about_main");
  // Add valuesSection for the values section below
  const valuesSection = {
    title: "Our Values",
    subtitle: "What guides us every day"
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About The HillSide Oasis Luxury Farm Retreat",
    "url": "https://thehillsideoasis.com/about",
    "description": section?.body || "Learn about The HillSide Oasis, a luxury farm retreat in Pollachi built on sustainability, hospitality, and authentic local experiences."
  };

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only absolute left-2 top-2 z-50 bg-white text-black p-2 rounded shadow">
        Skip to main content
      </a>
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>

      <main id="main-content" role="main" className="luxury-bg px-5 pb-16 pt-24 text-foreground sm:px-6">
        <section
          className="hero-shell overflow-hidden rounded-[2rem] border border-[#d7c8b5] p-8 shadow-[0_26px_56px_-42px_rgba(35,24,14,0.75)] sm:p-12"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(17, 35, 28, 0.82), rgba(17, 35, 28, 0.58), rgba(91, 67, 42, 0.45)), url('/images/12.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
            <LogoMark className="h-10 w-10" />
            <p className="eyebrow text-[#f4e7d6]">Our Story</p>
          </div>
          <p className="eyebrow text-[#e7d3b8]">About The Estate</p>
          <h1 className="hero-title mt-4 max-w-4xl text-[#fbf1e4]">A crafted retreat where nature and ceremony meet</h1>
          <p className="mt-6 max-w-3xl text-[1.04rem] leading-8 text-[#e8d9c3]">
            {section?.subtitle ?? "Where nature meets hospitality in the heart of the Western Ghats."}
          </p>
        </section>

        <section className="section-shell mt-10 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <article className="heritage-frame luxury-card rounded-3xl p-7 sm:p-10">
            <h2 className="section-title text-[#241d16]">{section?.title ?? "Our Story"}</h2>
            <p className="lead-copy mt-4">{section?.body ?? "The HillSide Oasis is a family-led nature retreat in Pollachi."}</p>
            <p className="lead-copy mt-4">
              Our vision is to offer estate-style comfort with timeless Indian hospitality, where every stay feels deliberate, elegant, and deeply connected to place.
            </p>
          </article>

          <article className="rounded-3xl border border-[#d8c9b5] bg-[#f9f3e9] p-7 sm:p-9">
            <p className="eyebrow text-[#7b664b]">Design Principle</p>
            <h2 className="font-display mt-3 text-4xl leading-none text-[#211a13]">Quiet Grandeur</h2>
            <p className="mt-4 text-sm leading-8 text-[#5f5245]">
              We believe luxury should feel composed, never loud. Our rooms, materials, and service details are designed for calm and lasting comfort.
            </p>
            <div className="section-rule my-6" />
            <p className="text-sm leading-8 text-[#5f5245]">
              Whether you travel for celebration, retreat, or family time, the experience is tailored to your own rhythm.
            </p>
          </article>
        </section>

        <section className="section-shell mt-10">
          <h2 className="section-title text-[#241d16]">{valuesSection?.title ?? "Our Values"}</h2>
          <p className="lead-copy mt-2">{valuesSection?.subtitle ?? "What guides us every day"}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <article key={value.title} className="luxury-card rounded-2xl p-5">
                <h3 className="font-display text-2xl leading-none text-[#241d16]">{value.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5d5044]">{value.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/stay" className="luxury-btn-primary rounded-full px-5 py-3 text-xs font-bold uppercase tracking-[0.12em]">
              Explore Suites
            </Link>
            <Link href="/booking" className="luxury-btn-secondary rounded-full px-5 py-3 text-xs font-bold uppercase tracking-[0.12em]">
              Plan Your Visit
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

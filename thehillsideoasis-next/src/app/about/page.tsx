import type { Metadata } from "next";
import Link from "next/link";
import { getSection } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About The HillSide Oasis Luxury Farm Retreat",
  description:
    "Learn about The HillSide Oasis, a luxury farm retreat in Pollachi built on sustainability, hospitality, and authentic local experiences.",
  keywords: [
    "about hillside oasis",
    "Pollachi luxury farm retreat",
    "boutique resort Tamil Nadu",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About The HillSide Oasis Luxury Farm Retreat",
    description:
      "Discover the story, values, and service philosophy behind The HillSide Oasis in Pollachi.",
    images: ["/images/DSC_0072-PANO.jpg"],
    type: "website",
    url: "https://thehillsideoasis.com/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About The HillSide Oasis Luxury Farm Retreat",
    description: "Explore our story, values, and hospitality vision.",
    images: ["/images/DSC_0072-PANO.jpg"],
  },
};

const values = [
  {
    title: "Sustainability",
    text: "Organic farming, water-conscious operations, and long-term ecological care.",
  },
  {
    title: "Hospitality",
    text: "Warm, personalized service that feels local, unhurried, and thoughtful.",
  },
  {
    title: "Community",
    text: "Working with nearby villages and local partners across food, staffing, and experiences.",
  },
  {
    title: "Authenticity",
    text: "Real farm life, regional food, and meaningful time in nature.",
  },
];

export default async function AboutPage() {
  const story = await getSection("about_story");
  const valuesSection = await getSection("about_values");

  return (
    <main className="luxury-bg px-6 pb-16 pt-24 text-foreground">
      <section
        className="hero-shell relative overflow-hidden rounded-3xl border border-white/40 p-8 shadow-2xl sm:p-12 reveal-fade"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(85, 32, 8, 0.82), rgba(15, 8, 3, 0.5)), url('https://images.pexels.com/photos/12311221/pexels-photo-12311221.jpeg?auto=compress&cs=tinysrgb&w=1800')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <p className="eyebrow text-orange-100">About Us</p>
        <h1 className="font-display mt-3 text-4xl text-white sm:text-6xl">About The HillSide Oasis</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-orange-50">
          {story?.subtitle ?? "Where nature meets hospitality in the heart of the Western Ghats."}
        </p>
      </section>

      <section className="mx-auto mt-10 max-w-[84rem] rounded-3xl luxury-card p-7 shadow-xl sm:p-10 reveal-up">
        <h2 className="section-title text-zinc-900">{story?.title ?? "Our Story"}</h2>
        <p className="lead-copy mt-4">{story?.body ?? "The HillSide Oasis is a family-led nature retreat in Pollachi."}</p>
        <p className="lead-copy mt-4">
          Our vision is to deliver a private-estate style hospitality experience where every stay feels curated, elegant, and deeply connected to the landscape.
        </p>
      </section>

      <section className="mx-auto mt-10 max-w-[84rem]">
        <h2 className="section-title text-zinc-900">{valuesSection?.title ?? "Our Values"}</h2>
        <p className="lead-copy mt-2">{valuesSection?.subtitle ?? "What guides us every day"}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-grid">
          {values.map((value) => (
            <article key={value.title} className="rounded-2xl luxury-card p-5">
              <h3 className="text-lg font-semibold text-zinc-900">{value.title}</h3>
              <p className="mt-2 text-sm leading-7 text-zinc-700">{value.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3 reveal-up">
          {[
            { label: "Estate Philosophy", value: "Nature, Craft, Calm" },
            { label: "Guest Promise", value: "Personalized Luxury" },
            { label: "Hospitality Style", value: "Warm and Intentional" },
          ].map((item) => (
            <article key={item.label} className="rounded-2xl border border-brand-soft bg-white p-5 text-center shadow-lg">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{item.label}</p>
              <p className="font-display mt-2 text-2xl text-zinc-900">{item.value}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/stay"
            className="luxury-btn-primary rounded-full px-5 py-3 text-sm font-bold"
          >
            Explore Accommodations
          </Link>
          <Link
            href="/booking"
            className="luxury-btn-secondary rounded-full px-5 py-3 text-sm font-bold"
          >
            Plan Your Visit
          </Link>
        </div>
      </section>
    </main>
  );
}

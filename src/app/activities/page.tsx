import type { Metadata } from "next";
import Link from "next/link";
import { getActivities } from "@/lib/content";
import LogoMark from "@/components/logo-mark";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Best Activities in Pollachi and Around The Western Ghats",
  description:
    "Discover curated on-property activities, local sightseeing, and nature experiences in Pollachi at The HillSide Oasis.",
  keywords: [
    "things to do in Pollachi",
    "Pollachi nature activities",
    "Western Ghats experiences",
    "farm stay activities Tamil Nadu",
  ],
  alternates: {
    canonical: "/activities",
  },
  openGraph: {
    title: "Best Activities in Pollachi and Around The Western Ghats",
    description:
      "Plan curated nature experiences, local attractions, and private itineraries from The HillSide Oasis.",
    images: ["/images/10.jpeg"],
    type: "website",
    url: "https://thehillsideoasis.com/activities",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Activities in Pollachi and Around The Western Ghats",
    description: "Explore immersive Pollachi experiences with concierge-assisted trip planning.",
    images: ["/images/10.jpeg"],
  },
};

export default async function ActivitiesPage() {
  const onProperty = await getActivities("on_property");
  const localAttractions = await getActivities("local_attraction");

  return (
    <main className="luxury-bg px-6 pb-16 pt-24 text-foreground">
      <section
        className="hero-shell rounded-3xl border border-white/40 p-8 shadow-2xl sm:p-12 reveal-fade parallax-surface"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(20, 8, 3, 0.72), rgba(110, 45, 12, 0.72)), url('/images/10.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mb-5 flex items-center gap-3">
          <LogoMark className="h-14 w-14 border-white/35 bg-[#f4e9dc]" imageClassName="scale-[1.12]" />
          <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-orange-50 backdrop-blur-sm">
            Curated Experiences
          </div>
        </div>
        <p className="eyebrow text-orange-100">Experiences</p>
        <h1 className="font-display mt-3 text-4xl text-white sm:text-6xl">Things to Do</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-orange-50">
          Immerse yourself in nature and local culture with curated experiences.
        </p>
      </section>

      <section className="mx-auto mt-8 grid max-w-[84rem] gap-6 lg:grid-cols-[1.1fr_1fr]">
        <article className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl reveal-up">
          <p className="eyebrow text-brand">Destination Journal</p>
          <h2 className="section-title mt-3 text-zinc-900">Experience Pollachi Beyond A Checklist</h2>
          <p className="lead-copy mt-3">
            We build balanced itineraries with breathing room: one immersive activity, one scenic transfer, and one reflective slow-living moment each day.
          </p>
        </article>
        <div
          className="parallax-surface min-h-[19rem] overflow-hidden rounded-3xl border border-zinc-200 shadow-xl reveal-up reveal-delay-1"
          style={{
            backgroundImage:
              "linear-gradient(170deg, rgba(8,18,37,0.28), rgba(8,18,37,0.62)), url('/images/1.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </section>

      <section className="mx-auto mt-10 max-w-[84rem]">
        <h2 className="section-title text-zinc-900">On-Property Experiences</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-grid">
          {onProperty.map((item) => (
            <article key={item.id} className="rounded-2xl luxury-card p-5">
              <h3 className="text-lg font-semibold text-zinc-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-zinc-700">{item.description}</p>
              <div className="mt-3 flex gap-2 text-xs text-zinc-600">
                {item.duration_label ? <span className="rounded-full bg-zinc-100 px-3 py-1">{item.duration_label}</span> : null}
                {item.price_label ? <span className="rounded-full bg-zinc-100 px-3 py-1">{item.price_label}</span> : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-[84rem]">
        <h2 className="section-title text-zinc-900">Local Attractions</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-grid">
          {localAttractions.map((item) => (
            <article key={item.id} className="rounded-2xl luxury-card p-5">
              <h3 className="text-lg font-semibold text-zinc-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-zinc-700">{item.description}</p>
              <div className="mt-3 flex gap-2 text-xs text-zinc-600">
                {item.distance_label ? <span className="rounded-full bg-zinc-100 px-3 py-1">{item.distance_label}</span> : null}
                {item.duration_label ? <span className="rounded-full bg-zinc-100 px-3 py-1">{item.duration_label}</span> : null}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-brand-soft bg-brand-soft/40 p-4 text-sm text-brand-strong reveal-up">
          We can arrange private transfers, guides, and custom day planning for all highlighted experiences.
        </div>

        <div className="mt-8 flex gap-3">
          <Link
            href="/contact"
            className="luxury-btn-primary rounded-full px-5 py-3 text-sm font-bold"
          >
            Contact Us
          </Link>
        </div>

        <div className="mt-10 rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl reveal-up">
          <p className="eyebrow text-brand">Signature Planning</p>
          <h3 className="section-title mt-3 text-zinc-900">Let Our Concierge Build Your Itinerary</h3>
          <p className="lead-copy mt-3 max-w-3xl">
            Tell us your stay length and interests, and we will create a day-by-day curated experience plan with pacing, private logistics, and seasonal recommendations.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/booking" className="luxury-btn-primary rounded-full px-5 py-3 text-sm font-bold">
              Book With Experiences
            </Link>
            <Link href="/contact" className="luxury-btn-secondary rounded-full px-5 py-3 text-sm font-bold">
              Request Itinerary
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { step: "Day 1", title: "Arrival + Estate Ease" },
            { step: "Day 2", title: "Hills + Local Discovery" },
            { step: "Day 3", title: "Slow Morning + Departure" },
          ].map((item, index) => (
            <article
              key={item.step}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-lg reveal-up"
              style={{ animationDelay: `${0.08 * (index + 1)}s` }}
            >
              <p className="text-xs uppercase tracking-[0.18em] text-brand">{item.step}</p>
              <h3 className="font-display mt-2 text-2xl text-zinc-900">{item.title}</h3>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

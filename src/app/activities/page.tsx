import type { Metadata } from "next";
import Link from "next/link";
import LogoMark from "@/components/logo-mark";
import { getActivities } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Best Activities in Pollachi and Around The Western Ghats",
  description:
    "Discover curated on-property activities, local sightseeing, and nature experiences in Pollachi at The HillSide Oasis.",
  alternates: {
    canonical: "/activities",
  },
};

export default async function ActivitiesPage() {
  const onProperty = await getActivities("on_property");
  const localAttractions = await getActivities("local_attraction");

  return (
    <main className="luxury-bg px-5 pb-16 pt-24 text-foreground sm:px-6">
      <section
        className="hero-shell overflow-hidden rounded-[2rem] border border-[#d7c8b5] p-8 shadow-[0_26px_56px_-42px_rgba(35,24,14,0.75)] sm:p-12"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(17, 35, 28, 0.82), rgba(17, 35, 28, 0.58), rgba(91, 67, 42, 0.45)), url('/images/10.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
          <LogoMark className="h-10 w-10" />
          <p className="eyebrow text-[#f4e7d6]">Experiences</p>
        </div>
        <p className="eyebrow text-[#e7d3b8]">Curated Activity Portfolio</p>
        <h1 className="hero-title mt-4 max-w-4xl text-[#fbf1e4]">Slow adventures across estate grounds and nearby landscapes</h1>
        <p className="mt-6 max-w-3xl text-[1.04rem] leading-8 text-[#e8d9c3]">
          Discover experiences designed to balance immersion, comfort, and scenic discovery.
        </p>
      </section>

      <section className="section-shell mt-10">
        <h2 className="section-title text-[#241d16]">On-Property Experiences</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {onProperty.map((item) => (
            <article key={item.id} className="luxury-card rounded-2xl p-5">
              <h3 className="font-display text-2xl leading-none text-[#241d16]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#5f5245]">{item.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#6f5f4f]">
                {item.duration_label ? <span className="rounded-full border border-[#d3c4af] bg-[#f9f3e9] px-3 py-1">{item.duration_label}</span> : null}
                {item.price_label ? <span className="rounded-full border border-[#d3c4af] bg-[#f9f3e9] px-3 py-1">{item.price_label}</span> : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell mt-12">
        <h2 className="section-title text-[#241d16]">Local Attractions</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {localAttractions.map((item) => (
            <article key={item.id} className="luxury-card rounded-2xl p-5">
              <h3 className="font-display text-2xl leading-none text-[#241d16]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#5f5245]">{item.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#6f5f4f]">
                {item.distance_label ? <span className="rounded-full border border-[#d3c4af] bg-[#f9f3e9] px-3 py-1">{item.distance_label}</span> : null}
                {item.duration_label ? <span className="rounded-full border border-[#d3c4af] bg-[#f9f3e9] px-3 py-1">{item.duration_label}</span> : null}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/contact" className="luxury-btn-primary rounded-full px-5 py-3 text-xs font-bold uppercase tracking-[0.12em]">
            Request Concierge Plan
          </Link>
          <Link href="/booking" className="luxury-btn-secondary rounded-full px-5 py-3 text-xs font-bold uppercase tracking-[0.12em]">
            Book With Experiences
          </Link>
        </div>
      </section>
    </main>
  );
}

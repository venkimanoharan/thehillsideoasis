import type { Metadata } from "next";
import Link from "next/link";
import LogoMark from "@/components/logo-mark";
import { getSection } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact and Booking Enquiries | The HillSide Oasis Pollachi",
  description:
    "Contact The HillSide Oasis in Pollachi for room bookings, family holidays, private events, and concierge-planned getaways.",
  alternates: {
    canonical: "/contact",
  },
};

export default async function ContactPage() {
  const section = await getSection("contact_main");

  return (
    <main className="luxury-bg px-5 pb-16 pt-24 text-foreground sm:px-6">
      <section
        className="hero-shell overflow-hidden rounded-[2rem] border border-[#d7c8b5] p-8 shadow-[0_26px_56px_-42px_rgba(35,24,14,0.75)] sm:p-12"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(17, 35, 28, 0.82), rgba(17, 35, 28, 0.58), rgba(91, 67, 42, 0.45)), url('/images/DSC_0072-PANO.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
          <LogoMark className="h-10 w-10" />
          <p className="eyebrow text-[#f4e7d6]">Concierge Desk</p>
        </div>
        <p className="eyebrow text-[#e7d3b8]">Contact</p>
        <h1 className="hero-title mt-4 max-w-4xl text-[#fbf1e4]">{section?.title ?? "Connect with The HillSide Oasis"}</h1>
        <p className="mt-6 max-w-3xl text-[1.04rem] leading-8 text-[#e8d9c3]">
          {section?.subtitle ?? "We help you plan every detail of your stay, celebrations, and curated itinerary."}
        </p>
      </section>

      <section className="section-shell mt-10 grid gap-6 lg:grid-cols-2">
        <article className="luxury-card rounded-3xl p-7">
          <h2 className="section-title text-[#241d16]">Contact Information</h2>
          <div className="mt-6 grid gap-3 text-sm text-[#5f5245]">
            <a href="tel:+919150360597" className="rounded-xl border border-[#d2c2ae] bg-[#f9f3e9] px-4 py-3">
              Phone: +91 91503 60597
            </a>
            <a href="https://wa.me/919150360597" className="rounded-xl border border-[#d2c2ae] bg-[#f9f3e9] px-4 py-3">
              WhatsApp: +91 91503 60597
            </a>
            <a href="mailto:info@thehillsideoasis.com" className="rounded-xl border border-[#d2c2ae] bg-[#f9f3e9] px-4 py-3">
              Email: info@thehillsideoasis.com
            </a>
            <div className="rounded-xl border border-[#d2c2ae] bg-[#f9f3e9] px-4 py-3">Arthanaripalayam, Pollachi, Tamil Nadu 642007</div>
          </div>
        </article>

        <article className="luxury-card rounded-3xl p-7">
          <h2 className="section-title text-[#241d16]">Need Help Booking?</h2>
          <p className="lead-copy mt-4">
            Share your dates and preferences. Our concierge team will recommend rooms, experiences, and complete your stay plan quickly.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/booking" className="luxury-btn-primary rounded-full px-5 py-3 text-xs font-bold uppercase tracking-[0.12em]">
              Go To Booking
            </Link>
            <Link href="/stay" className="luxury-btn-secondary rounded-full px-5 py-3 text-xs font-bold uppercase tracking-[0.12em]">
              View Suites
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}

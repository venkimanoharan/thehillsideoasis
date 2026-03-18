import type { Metadata } from "next";
import Link from "next/link";
import { getSection } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact and Booking Enquiries | The HillSide Oasis Pollachi",
  description:
    "Contact The HillSide Oasis in Pollachi for room bookings, family holidays, private events, and concierge-planned getaways.",
  keywords: [
    "contact hillside oasis",
    "Pollachi resort booking contact",
    "farm stay enquiry Tamil Nadu",
  ],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact and Booking Enquiries | The HillSide Oasis Pollachi",
    description:
      "Connect with our concierge for direct booking support, celebration stays, and custom itineraries.",
    images: ["/images/9.jpeg"],
    type: "website",
    url: "https://thehillsideoasis.com/contact",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact and Booking Enquiries | The HillSide Oasis Pollachi",
    description: "Talk to our booking concierge for personalized trip planning.",
    images: ["/images/9.jpeg"],
  },
};

export default async function ContactPage() {
  const section = await getSection("contact_main");

  return (
    <main className="luxury-bg px-6 pb-16 pt-24 text-foreground">
      <section
        className="hero-shell rounded-3xl border border-white/40 p-8 shadow-2xl sm:p-12 reveal-fade"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(80, 30, 8, 0.82), rgba(20, 8, 3, 0.62)), url('https://images.pexels.com/photos/18827152/pexels-photo-18827152.jpeg?auto=compress&cs=tinysrgb&w=1800')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <p className="eyebrow text-orange-100">Contact</p>
        <h1 className="font-display mt-3 text-4xl text-white sm:text-6xl">{section?.title ?? "Get in Touch"}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-orange-50">
          {section?.subtitle ?? "We are here to help plan your perfect luxury mountain getaway in Pollachi."}
        </p>
      </section>

      <section className="mx-auto mt-10 grid max-w-[84rem] gap-6 lg:grid-cols-2">
        <article className="rounded-2xl luxury-card p-6 reveal-up">
          <h2 className="section-title text-zinc-900">Contact Information</h2>
          <div className="mt-5 grid gap-3 text-zinc-700">
            <a href="tel:+919150360597" className="rounded-xl border border-zinc-200 px-4 py-3">
              Phone: +91 91503 60597
            </a>
            <a href="https://wa.me/919150360597" className="rounded-xl border border-zinc-200 px-4 py-3">
              WhatsApp: +91 91503 60597
            </a>
            <a
              href="mailto:info@thehillsideoasis.com"
              className="rounded-xl border border-zinc-200 px-4 py-3"
            >
              Email: info@thehillsideoasis.com
            </a>
            <div className="rounded-xl border border-zinc-200 px-4 py-3">Pollachi, Tamil Nadu</div>
          </div>
          <p className="mt-5 text-sm text-zinc-700">
            Address: Arthanaripalayam, Pollachi, Tamil Nadu 642007
          </p>
        </article>

        <article className="rounded-2xl luxury-card p-6 reveal-up">
          <h2 className="section-title text-zinc-900">Speak To Our Booking Concierge</h2>
          <p className="lead-copy mt-3">
            For suite recommendations, celebration stays, and private itinerary planning,
            connect with us directly or proceed to instant booking.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/booking"
              className="luxury-btn-primary rounded-full px-5 py-3 text-sm font-bold"
            >
              Go To Booking
            </Link>
            <Link
              href="/stay"
              className="luxury-btn-secondary rounded-full px-5 py-3 text-sm font-bold"
            >
              View Rooms
            </Link>
          </div>

          <div className="mt-6 rounded-2xl border border-brand-soft bg-brand-soft/35 p-4 text-sm text-brand-strong">
            Typical response time: under 30 minutes during active hours.
          </div>
        </article>
      </section>
    </main>
  );
}

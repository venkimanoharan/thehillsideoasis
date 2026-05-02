import type { Metadata } from "next";
import Link from "next/link";
import LogoMark from "@/components/logo-mark";
import { getSection } from "@/lib/content";
import { getCachedSiteSettings } from "@/lib/site-settings";
import Head from "next/head";

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
  const [section, settings] = await Promise.all([getSection("contact_main"), getCachedSiteSettings()]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact The HillSide Oasis",
    "url": "https://thehillsideoasis.com/contact",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": settings.contactPhoneDisplay,
        "contactType": "customer service",
        "areaServed": "IN",
        "availableLanguage": ["English", "Tamil"]
      }
    ]
  };

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only absolute left-2 top-2 z-50 bg-white text-black p-2 rounded shadow">
        Skip to main content
      </a>
      <Head>
        <title>Contact and Booking Enquiries | The HillSide Oasis Pollachi</title>
        <meta name="description" content="Contact The HillSide Oasis in Pollachi for room bookings, family holidays, private events, and concierge-planned getaways." />
        <meta property="og:title" content="Contact and Booking Enquiries | The HillSide Oasis Pollachi" />
        <meta property="og:description" content="Contact The HillSide Oasis in Pollachi for room bookings, family holidays, private events, and concierge-planned getaways." />
        <meta property="og:image" content="/images/2.jpeg" />
        <meta property="og:url" content="https://thehillsideoasis.com/contact" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact and Booking Enquiries | The HillSide Oasis Pollachi" />
        <meta name="twitter:description" content="Contact The HillSide Oasis in Pollachi for room bookings, family holidays, private events, and concierge-planned getaways." />
        <meta name="twitter:image" content="/images/2.jpeg" />
        <link rel="canonical" href="https://thehillsideoasis.com/contact" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Head>

      <main id="main-content" className="luxury-bg px-5 pb-16 pt-24 text-foreground sm:px-6" role="main">
        <section
          className="hero-shell overflow-hidden rounded-[2rem] border border-[#d7c8b5] p-8 shadow-[0_26px_56px_-42px_rgba(35,24,14,0.75)] sm:p-12"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(17, 35, 28, 0.82), rgba(17, 35, 28, 0.58), rgba(91, 67, 42, 0.45)), url('/images/DSC_0072-PANO.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden="true"
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

        <section className="section-shell mt-10 grid gap-6 lg:grid-cols-2" role="region" aria-labelledby="contact-info-title">
          <h2 id="contact-info-title" className="sr-only">Contact Information</h2>
          <article className="luxury-card rounded-3xl p-7">
            <h2 className="section-title text-[#241d16]">Contact Information</h2>
            <div className="mt-6 grid gap-3 text-sm text-[#5f5245]">
              <a href={settings.contactPhoneHref} className="rounded-xl border border-[#d2c2ae] bg-[#f9f3e9] px-4 py-3">
                Phone: {settings.contactPhoneDisplay}
              </a>
              <a href={settings.contactWhatsappHref} className="rounded-xl border border-[#d2c2ae] bg-[#f9f3e9] px-4 py-3">
                WhatsApp: {settings.contactWhatsappDisplay}
              </a>
              <a href={settings.contactEmailHref} className="rounded-xl border border-[#d2c2ae] bg-[#f9f3e9] px-4 py-3">
                Email: {settings.contactEmailDisplay}
              </a>
              <div className="rounded-xl border border-[#d2c2ae] bg-[#f9f3e9] px-4 py-3">{settings.contactAddressDisplay}</div>
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
            </div>
          </article>
        </section>
      </main>
    </>
  );
}

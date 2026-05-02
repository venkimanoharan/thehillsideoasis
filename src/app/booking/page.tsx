import type { Metadata } from "next";
import LogoMark from "@/components/logo-mark";
import { getCachedSiteSettings } from "@/lib/site-settings";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Book Your Stay | The HillSide Oasis Pollachi",
  description:
    "Book your luxury farm stay in Pollachi at The HillSide Oasis. Contact us on WhatsApp or email for a personalized booking experience.",
  alternates: {
    canonical: "/booking",
  },
  openGraph: {
    title: "Book Your Stay | The HillSide Oasis Pollachi",
    description:
      "Book your luxury farm stay in Pollachi at The HillSide Oasis. Contact us on WhatsApp or email for a personalized booking experience.",
    images: ["/images/2.jpeg"],
    type: "website",
    url: "https://thehillsideoasis.com/booking",
  },
  twitter: {
    card: "summary_large_image",
    title: "Book Your Stay | The HillSide Oasis Pollachi",
    description: "Book your luxury farm stay in Pollachi at The HillSide Oasis. Contact us on WhatsApp or email for a personalized booking experience.",
    images: ["/images/2.jpeg"],
  },
};

export default async function BookingPage() {
  const settings = await getCachedSiteSettings();

  return (
    <>
      <Head>
        <title>Book Your Stay | The HillSide Oasis Pollachi</title>
        <meta name="description" content="Book your luxury farm stay in Pollachi at The HillSide Oasis. Contact us on WhatsApp or email for a personalized booking experience." />
        <meta property="og:title" content="Book Your Stay | The HillSide Oasis Pollachi" />
        <meta property="og:description" content="Book your luxury farm stay in Pollachi at The HillSide Oasis. Contact us on WhatsApp or email for a personalized booking experience." />
        <meta property="og:image" content="/images/2.jpeg" />
        <meta property="og:url" content="https://thehillsideoasis.com/booking" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Book Your Stay | The HillSide Oasis Pollachi" />
        <meta name="twitter:description" content="Book your luxury farm stay in Pollachi at The HillSide Oasis. Contact us on WhatsApp or email for a personalized booking experience." />
        <meta name="twitter:image" content="/images/2.jpeg" />
        <link rel="canonical" href="https://thehillsideoasis.com/booking" />
      </Head>

      <main className="luxury-bg px-5 pb-16 pt-24 text-foreground sm:px-6 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="max-w-xl w-full text-center bg-white/80 rounded-3xl shadow-xl p-8 border border-[#e2d3c0]">
          <div className="flex flex-col items-center gap-3 mb-6">
            <LogoMark className="h-14 w-14" />
            <h1 className="font-display text-3xl sm:text-4xl text-[#231d16] mt-2">Book Your Stay</h1>
            <p className="mt-2 text-lg text-[#5f5245]">We'd love to help you plan your perfect farm retreat.</p>
          </div>
          <p className="text-md text-[#5f5245] mb-6">
            For all bookings and availability enquiries, please contact us directly. Our concierge team will respond promptly and help you customize your stay.
          </p>
          <div className="flex flex-col gap-4 items-center">
            <a
              href={settings.contactWhatsappHref}
              className="luxury-btn-primary w-full max-w-xs rounded-full px-6 py-3 text-base font-bold uppercase tracking-[0.12em] flex items-center justify-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with us on WhatsApp"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path fill="#25D366" d="M12 2C6.477 2 2 6.477 2 12c0 1.85.504 3.59 1.38 5.08L2 22l5.09-1.36A9.953 9.953 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z"/><path fill="#fff" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.967-.94 1.166-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.075-.149-.669-1.612-.916-2.21-.242-.58-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.1 3.21 5.077 4.374.71.306 1.263.489 1.695.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347Z"/></svg>
              WhatsApp Us
            </a>
            <a
              href={settings.contactEmailHref}
              className="luxury-btn-secondary w-full max-w-xs rounded-full px-6 py-3 text-base font-bold uppercase tracking-[0.12em] flex items-center justify-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Email us"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" fill="#EA4335" rx="12"/><path fill="#fff" d="M6.75 8.25v7.5h10.5v-7.5H6.75Zm9.75 0v.638l-5.25 3.5-5.25-3.5V8.25h10.5Zm-10.5 8.25v-6.112l5.25 3.5 5.25-3.5V16.5H6.75Z"/></svg>
              Email Us
            </a>
          </div>
          <div className="mt-8 text-sm text-[#7b664b]">
            <p>Prefer to talk? Call us at <a href={settings.contactPhoneHref} className="underline font-semibold">{settings.contactPhoneDisplay}</a></p>
          </div>
        </div>
      </main>
    </>
  );
}

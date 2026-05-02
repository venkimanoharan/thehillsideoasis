import type { Metadata } from "next";
import BookingClient from "@/components/booking/booking-client";
import { getRooms } from "@/lib/content";
import { getCachedSiteSettings } from "@/lib/site-settings";
import Head from "next/head";

// Removed force-dynamic to allow SSG/ISR for better performance and SEO

export const metadata: Metadata = {
  title: "Book Luxury Stay in Pollachi",
  description:
    "Book your luxury farm stay in Pollachi at The HillSide Oasis. Check dates, choose your room, and reserve directly.",
  keywords: [
    "book resort in Pollachi",
    "Pollachi luxury stay booking",
    "farm stay reservation Tamil Nadu",
  ],
  alternates: {
    canonical: "/booking",
  },
  openGraph: {
    title: "Book Luxury Stay in Pollachi",
    description:
      "Choose dates and room type to reserve your premium mountain retreat in Pollachi.",
    images: ["/images/2.jpeg"],
    type: "website",
    url: "https://thehillsideoasis.com/booking",
  },
  twitter: {
    card: "summary_large_image",
    title: "Book Luxury Stay in Pollachi",
    description: "Check live availability and reserve your stay at The HillSide Oasis.",
    images: ["/images/2.jpeg"],
  },
};

export default async function BookingPage() {
  const [rooms, settings] = await Promise.all([getRooms(), getCachedSiteSettings()]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Reservation",
    "name": "Book Luxury Stay in Pollachi",
    "url": "https://thehillsideoasis.com/booking",
    "provider": {
      "@type": "Resort",
      "name": "The HillSide Oasis"
    }
  };

  return (
    <>
      <Head>
        <title>Book Luxury Stay in Pollachi | The HillSide Oasis</title>
        <meta name="description" content="Book your luxury farm stay in Pollachi at The HillSide Oasis. Check dates, choose your room, and reserve directly." />
        <meta property="og:title" content="Book Luxury Stay in Pollachi" />
        <meta property="og:description" content="Book your luxury farm stay in Pollachi at The HillSide Oasis. Check dates, choose your room, and reserve directly." />
        <meta property="og:image" content="/images/2.jpeg" />
        <meta property="og:url" content="https://thehillsideoasis.com/booking" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Book Luxury Stay in Pollachi" />
        <meta name="twitter:description" content="Book your luxury farm stay in Pollachi at The HillSide Oasis. Check dates, choose your room, and reserve directly." />
        <meta name="twitter:image" content="/images/2.jpeg" />
        <link rel="canonical" href="https://thehillsideoasis.com/booking" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Head>
      <BookingClient rooms={rooms} settings={settings} />
    </>
  );
}

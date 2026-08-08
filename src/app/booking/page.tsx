import type { Metadata } from "next";
import BookingClient from "@/components/booking/booking-client";
import { getRooms } from "@/lib/content";
import { getCachedSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Book Your Stay | The HillSide Oasis Pollachi",
  description:
    "Book your luxury farm stay in Pollachi at The HillSide Oasis. Pick your dates, choose a room, and submit your reservation request online.",
  alternates: {
    canonical: "/booking",
  },
  openGraph: {
    title: "Book Your Stay | The HillSide Oasis Pollachi",
    description:
      "Book your luxury farm stay in Pollachi at The HillSide Oasis. Pick your dates, choose a room, and submit your reservation request online.",
    images: ["/images/2.jpeg"],
    type: "website",
    url: "https://thehillsideoasis.com/booking",
  },
  twitter: {
    card: "summary_large_image",
    title: "Book Your Stay | The HillSide Oasis Pollachi",
    description:
      "Book your luxury farm stay in Pollachi at The HillSide Oasis. Pick your dates, choose a room, and submit your reservation request online.",
    images: ["/images/2.jpeg"],
  },
};

export default async function BookingPage() {
  const [rooms, settings] = await Promise.all([getRooms(), getCachedSiteSettings()]);

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only absolute left-2 top-2 z-50 bg-white text-black p-2 rounded shadow">
        Skip to main content
      </a>
      <BookingClient rooms={rooms} settings={settings} />
    </>
  );
}

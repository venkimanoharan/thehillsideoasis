import type { Metadata } from "next";
import BookingClient from "@/components/booking/booking-client";
import { getRooms } from "@/lib/content";

export const dynamic = "force-dynamic";

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
  const rooms = await getRooms();
  return <BookingClient rooms={rooms} />;
}

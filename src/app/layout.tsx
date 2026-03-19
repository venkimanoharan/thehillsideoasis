import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thehillsideoasis.com"),
  title: {
    default: "The HillSide Oasis | Luxury Farm Stay in Pollachi",
    template: "%s | The HillSide Oasis",
  },
  description:
    "Luxury farm stay, private cottages, and curated nature experiences in Pollachi, Tamil Nadu near the Western Ghats.",
  keywords: [
    "luxury stay in Pollachi",
    "farm stay Pollachi",
    "resort near Coimbatore",
    "Western Ghats retreat",
    "cottage stay Pollachi",
    "The HillSide Oasis",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://thehillsideoasis.com",
    siteName: "The HillSide Oasis",
    title: "The HillSide Oasis | Luxury Farm Stay in Pollachi",
    description:
      "Escape to a boutique mountain retreat in Pollachi with private cottages, curated activities, and estate-style hospitality.",
    images: [
      {
        url: "/images/DSC_0072-PANO.jpg",
        width: 1600,
        height: 900,
        alt: "The HillSide Oasis luxury nature retreat in Pollachi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The HillSide Oasis | Luxury Farm Stay in Pollachi",
    description:
      "Luxury cottages, curated nature experiences, and serene mountain views in Pollachi.",
    images: ["/images/DSC_0072-PANO.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

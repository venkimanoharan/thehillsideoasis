import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The HillSide Oasis | Luxury Farm Stay in Pollachi",
    short_name: "HillSide Oasis",
    description:
      "Luxury farm stay, private cottages, and curated nature experiences in Pollachi, Tamil Nadu near the Western Ghats.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f3ea",
    theme_color: "#214032",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}

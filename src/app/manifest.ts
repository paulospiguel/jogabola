import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JogaBola",
    short_name: "JogaBola",
    description: "Organiza jogos sem o caos do WhatsApp.",
    start_url: "/",
    display: "standalone",
    background_color: "#050312",
    theme_color: "#1effbf",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ComplyCare",
    short_name: "ComplyCare",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0e7490",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  }
}

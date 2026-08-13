import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["favicon-light.svg", "favicon-dark.svg", "favicon.svg"],
      workbox: {
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        // Con "autoUpdate" el SW nuevo espera a que se cierren todas las
        // pestañas antes de tomar control, así que un fix recién publicado
        // puede tardar en verse. skipWaiting + clientsClaim hace que el SW
        // nuevo tome control apenas se detecta, sin esperar.
        skipWaiting: true,
        clientsClaim: true,
      },
      manifest: {
        name: "CoinControl",
        short_name: "CoinControl",
        description: "Controla tus ingresos y gastos fácilmente",
        theme_color: "#0f9c8f",
        background_color: "#132420",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/pwa/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/pwa/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});

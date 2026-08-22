import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://sarapuce.fr",
  integrations: [sitemap({ filter: (page) => !page.includes("/cv") })],
  vite: {
    plugins: [tailwindcss()],
  },
});

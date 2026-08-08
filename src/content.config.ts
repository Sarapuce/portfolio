import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const missions = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/missions" }),
  schema: z.object({
    titre: z.string(),
    badge: z.string(),
    resume: z.string(),
    constats: z.array(z.string()).default([]),
    conclusion: z.string(),
    tags: z.array(z.string()).default([]),
    ordre: z.number().default(0),
    perimetre: z.string().optional(),
    perimetreDetail: z.string().optional(),
    duree: z.string().optional(),
    dureeDetail: z.string().optional(),
    verdict: z.string().optional(),
    verdictDetail: z.string().optional(),
  }),
});

export const collections = { missions };

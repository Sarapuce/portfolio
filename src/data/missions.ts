import { getCollection, type CollectionEntry } from "astro:content";

export type Mission = CollectionEntry<"missions">;

export const categorieDe = (m: Mission) => m.id.split("/")[0];
export const slugDe = (m: Mission) => m.id.split("/").slice(1).join("/");
export const lienDe = (m: Mission) => `/${categorieDe(m)}/${slugDe(m)}`;

export async function missionsDe(categorieId: string) {
  const toutes = await getCollection("missions");
  return toutes
    .filter((m) => categorieDe(m) === categorieId)
    .sort((a, b) => a.data.ordre - b.data.ordre);
}

// Ajouter une catégorie : une entrée ici + un dossier du même id dans src/content/missions/
// Les classes sont écrites en entier, sinon Tailwind ne les voit pas au build.

export type Categorie = {
  id: string;
  label: string;
  tagline: string;
  // Libellés des trois encadrés en haut d'une page. Optionnel, voir libellesDe.
  libelles?: {
    perimetre: string;
    duree: string;
    verdict: string;
  };
  couleur: {
    texte: string;
    point: string;
    trait: string;
  };
};

export const categories: Categorie[] = [
  {
    id: "finops",
    label: "FinOps",
    tagline:
      "Analyse de la facture, identification des postes récupérables, application sans interruption de service.",
    couleur: {
      texte: "text-finops",
      point: "bg-finops",
      trait: "group-hover:border-finops",
    },
  },
  {
    id: "securite",
    label: "Sécurité Cloud",
    tagline:
      "Modélisation des menaces, recherche des chemins de compromission, priorisation des correctifs.",
    couleur: {
      texte: "text-secu",
      point: "bg-secu",
      trait: "group-hover:border-secu",
    },
  },
  {
    id: "recherche",
    label: "Recherche & publications",
    tagline: "Travaux de recherche et publications, menés hors missions client.",
    libelles: {
      perimetre: "Cible",
      duree: "Publication",
      verdict: "Impact",
    },
    couleur: {
      texte: "text-recherche",
      point: "bg-recherche",
      trait: "group-hover:border-recherche",
    },
  },
];

export const getCategorie = (id: string) => categories.find((c) => c.id === id);

export const libellesDe = (c: Categorie) =>
  c.libelles ?? { perimetre: "Périmètre", duree: "Durée", verdict: "Verdict" };

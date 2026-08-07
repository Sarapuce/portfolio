// Ajouter une catégorie : une entrée ici + un dossier du même id dans src/content/missions/
// Les classes sont écrites en entier, sinon Tailwind ne les voit pas au build.

export type Categorie = {
  id: string;
  label: string;
  tagline: string;
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
      "Savoir où part vraiment votre budget cloud. Et récupérer ce qui peut l'être sans rien casser en production.",
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
      "Trouver vos failles avant qu'on ne les trouve pour vous. Et passer vos audits de conformité sans mauvaise surprise.",
    couleur: {
      texte: "text-secu",
      point: "bg-secu",
      trait: "group-hover:border-secu",
    },
  },
];

export const getCategorie = (id: string) => categories.find((c) => c.id === id);

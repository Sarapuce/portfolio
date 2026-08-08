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
      "Où part votre budget cloud, et ce qu'on peut récupérer sans coupure en prod.",
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
      "Vos failles avant qu'on ne les trouve pour vous, et la conformité sans surprise.",
    couleur: {
      texte: "text-secu",
      point: "bg-secu",
      trait: "group-hover:border-secu",
    },
  },
];

export const getCategorie = (id: string) => categories.find((c) => c.id === id);

// Ajouter une catégorie : une entrée ici + un dossier du même id dans src/content/
// Les classes sont écrites en entier, sinon Tailwind ne les voit pas au build.

export type Categorie = {
  id: string;
  label: string;
  tagline: string;
  couleur: {
    texte: string;
    bordure: string;
    badge: string;
    barre: string;
    bouton: string;
    puce: string;
  };
};

export const categories: Categorie[] = [
  {
    id: "finops",
    label: "FinOps",
    tagline:
      "Regarder où part l'argent, chiffrer ce qui peut être récupéré, et dire dans quel ordre s'y prendre.",
    couleur: {
      texte: "text-finops",
      bordure: "hover:border-finops",
      badge: "bg-finops/10 text-finops border-finops/20",
      barre: "border-finops",
      bouton:
        "bg-finops/10 border-finops/20 text-finops hover:bg-finops hover:text-base",
      puce: "text-finops",
    },
  },
  {
    id: "securite",
    label: "Sécurité Cloud",
    tagline:
      "Regarder ce qui est réellement exposé, mesurer l'écart avec ce que l'équipe croit, et prioriser les corrections.",
    couleur: {
      texte: "text-secu",
      bordure: "hover:border-secu",
      badge: "bg-secu/10 text-secu border-secu/20",
      barre: "border-secu",
      bouton:
        "bg-secu/10 border-secu/20 text-secu hover:bg-secu hover:text-base",
      puce: "text-secu",
    },
  },
];

export const getCategorie = (id: string) =>
  categories.find((c) => c.id === id);

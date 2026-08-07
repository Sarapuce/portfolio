# Portfolio

Mon site perso. Je fais de l'audit cloud, du FinOps et de la sécurité.

J'avais pas envie d'une page avec une liste de logos et de compétences, donc j'ai mis des cas à la place. Chaque audit a sa page : ce que j'ai regardé, ce que j'ai trouvé, ce que j'ai recommandé.

## Stack

Astro pour le rendu 
Tailwind pour les styles

Le build sort du HTML statique, sans JavaScript côté client à part le menu mobile. Le contenu vit en Markdown, ce qui me permet d'ajouter un audit ou une catégorie sans toucher aux composants.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # sort dans dist/
```

## Organisation

```
src/data/site.ts          # Identité, liens, textes de la page d'accueil
src/data/categories.ts    # Les catégories et leurs couleurs
src/content/missions/     # Un dossier par catégorie, un .md par audit
src/components/           # Nav, Hero, MissionCard, CategorieSection, Contact
src/pages/                # L'accueil et la route [categorie]/[slug]
src/styles/global.css     # Couleurs, polices, rendu du Markdown
```

Remarque sur le code : les classes Tailwind sont écrites en entier dans `categories.ts` plutôt que construites dynamiquement. Tailwind analyse le code source au build, une classe assemblée à la volée ne serait jamais générée.

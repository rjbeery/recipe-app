# Recipe App

A minimal frontend-only recipe app built as a live coding interview exercise.

**Live demo:** https://recipe-app.thehereticalphysicist.com/
**Source code:** https://github.com/rjbeery/recipe-app
**Interview landing page:** https://thehereticalphysicist.com/direct-supply-interview

---

## What it is

Two-page app: a recipe list and a recipe detail view. React + TypeScript + Vite, no backend. Recipe data lives in a local TypeScript module.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Architecture

```
src/
├── main.tsx          # React entry
├── App.tsx           # Router: / and /recipes/:id
├── types.ts          # RecipeSummary, Recipe
├── data.ts           # In-memory recipe array
├── recipes.ts        # getAllRecipes(), getRecipeById()
└── pages/
    ├── RecipeList.tsx    # / — list all recipes
    └── RecipeDetail.tsx  # /recipes/:id — recipe detail
```

`data.ts` holds the raw array. `recipes.ts` is the only file that reads it — this is the seam where a real API call would go later. Pages import from `recipes.ts` directly; they never touch `data.ts`.

## Deploy (Netlify)

1. Push repo to GitHub
2. New site → Import from Git → connect `rjbeery/recipe-app`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy

No environment variables needed.

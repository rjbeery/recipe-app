# Recipe App

A minimal full-stack recipe app built as a live coding interview exercise.

**Live demo:** `PLACEHOLDER_LIVE_DEMO_URL`
**Source code:** https://github.com/rjbeery/recipe-app
**Interview landing page:** https://thehereticalphysicist.com/direct-supply-interview

---

## What it is

Two-page app: a recipe list and a recipe detail view. Express backend with in-memory data, React frontend with React Router.

## Run locally

**Terminal 1 — server** (runs on port 3001):
```bash
cd server
npm install
npm run dev
```

**Terminal 2 — client** (runs on port 5173):
```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173

## API

| Method | Path | Returns |
|--------|------|---------|
| GET | /api/recipes | `RecipeSummary[]` |
| GET | /api/recipes/:id | `Recipe` or 404 |

## Architecture

```
interview-recipe-app/
├── server/
│   └── src/
│       ├── index.ts     # Express setup
│       ├── types.ts     # RecipeSummary, Recipe
│       ├── data.ts      # In-memory recipe array
│       ├── store.ts     # getAllRecipes, getRecipeById
│       └── routes.ts    # Route handlers
└── client/
    └── src/
        ├── main.tsx     # React entry
        ├── App.tsx      # Router
        ├── types.ts     # RecipeSummary, Recipe
        ├── api.ts       # fetchRecipes, fetchRecipe
        └── pages/
            ├── RecipeList.tsx    # / — list view
            └── RecipeDetail.tsx  # /recipes/:id — detail view
```

Data layer is isolated in `store.ts`. To swap in a real database, only `data.ts` and `store.ts` change.

## Deploying

### Backend → Render
1. Push repo to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect the GitHub repo, set root directory to `server`
4. Build command: `npm install && npm run build`
5. Start command: `npm start`

### Frontend → Netlify
1. Create a new site on [netlify.com](https://netlify.com)
2. Connect the GitHub repo, set base directory to `client`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-render-app.onrender.com/api`

See `client/.env.example` for the required environment variable.

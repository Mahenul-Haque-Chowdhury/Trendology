Trendology – a minimalist e-commerce UI built with Next.js (App Router), TypeScript, and Tailwind CSS.

## Features
- Responsive layout with Header, Footer, and product grid
- TypeScript-first setup
- Tailwind CSS styling

## Getting Started

1. Install Node.js (LTS):
   - Option A: Download and install from https://nodejs.org (LTS)
   - Option B: Install nvm and then Node LTS:
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
     export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
     nvm install --lts

2. Install dependencies:

```bash
# (repo root)
npm install
npm install
```

3. Run the dev server:

```bash
npm run dev
```

Then open http://localhost:3000

## Next Steps
- Add product detail pages and a cart drawer
- Hook up a headless CMS or JSON API for products
- Add filtering/search and checkout mock flow

## Deploy (Vercel)

1) Build locally to verify:

```bash
npm run build
```

2) Push to GitHub (this folder is the project root).

3) In Vercel: New Project → Import Repo → Root Directory: `store` → Framework: Next.js.

4) Add Environment Variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server-only; required for orders to insert)
- ADMIN_USER (optional, for /admin basic auth)
- ADMIN_PASS (optional, for /admin basic auth)

5) Deploy, then add a custom domain if desired.

See `.env.local.example` for the required variables.

## Local env

Create a file named `.env.local` in the `store` folder with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_USER=
ADMIN_PASS=
```

Important: Never commit `.env.local`. The Service Role key is sensitive and must never be exposed client-side (don’t prefix it with `NEXT_PUBLIC_`).

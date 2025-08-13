A minimalist e-commerce UI built with Next.js (App Router), TypeScript, and Tailwind CSS—perfect for your portfolio.

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
cd "./storefront"
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

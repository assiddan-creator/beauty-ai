# Beauty AI

Beauty AI is a mobile-first virtual makeup try-on product built for beauty retail and brand experiences.

## Product flow

1. Upload or capture a selfie.
2. Get a beauty recommendation or browse looks/products.
3. Apply a selected look with an image-editing model.
4. Compare before/after results.
5. Review the exact products and shades used.

## Current AI stack

- Claude API — beauty recommendation, product prompt building, result copy, and advisor chat.
- Replicate — server-side image generation proxy.
- Nano Banana 2 — primary production image-editing model.

Secrets are server-side only. Required Vercel environment variables:

- `ANTHROPIC_API_KEY`
- `REPLICATE_API_TOKEN`

Do not expose either secret with a `VITE_` prefix.

## App stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Vercel Functions

## Local development

```bash
npm install
npm run dev
```

The local Vite proxy reads `REPLICATE_API_TOKEN` on the development server so the secret does not enter the browser bundle.

## Production direction

The commercial target is a white-label beauty try-on layer for retailers and brands: real catalog products and shades, personalized discovery, virtual try-on, product-level conversion actions, analytics, and privacy-conscious selfie handling.

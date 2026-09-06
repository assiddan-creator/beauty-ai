# Beauty AI

Beauty AI is a mobile-first virtual makeup try-on product built for beauty retail and brand experiences.

## Product flow

1. Upload or capture a selfie.
2. Get a makeup color-direction recommendation or browse looks/products.
3. Apply a selected look with an image-editing model.
4. Compare before/after results.
5. Review the exact products and shades used.
6. In a retailer deployment, continue to product or cart through configured purchase links.

## Current AI stack

- Claude Sonnet 5 — selfie color-direction analysis.
- Claude Haiku 4.5 — product prompt building, short result copy, and advisor chat.
- Replicate — server-side image generation proxy.
- Nano Banana 2 — primary production image-editing model.

The API routing is intentionally cost-aware: the stronger vision model is reserved for the image-analysis step, while short text tasks use the faster model with tighter output limits.

Secrets are server-side only. Required Vercel environment variables:

- `ANTHROPIC_API_KEY`
- `REPLICATE_API_TOKEN`

Optional model overrides:

- `CLAUDE_VISION_MODEL`
- `CLAUDE_FAST_MODEL`

Do not expose secrets with a `VITE_` prefix. The Vite build uses only a harmless browser sentinel for the existing Replicate client guard; real Replicate authentication happens in the server proxy.

## App stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Vercel Functions

## Commercial configuration

White-label commercial identity and purchase destinations can be configured at runtime through:

- `public/commercial-config.json`

Supported fields:

- `operatorName` — legal or operating entity shown in the transparency layer.
- `retailerName` — retailer or brand name for the deployment.
- `privacyContact` — privacy/support contact shown to users.
- `purchaseLinks` — optional map of product IDs to retailer product URLs.

The runtime loader validates purchase URLs and only accepts `http`/`https` destinations. The default file is intentionally empty so the demo does not imply a retailer or brand partnership.

A public data-handling notice is available at:

- `/privacy.html`

It describes the current technical behavior and is not a substitute for a client-specific legal privacy policy before launch.

## Local development

```bash
npm install
npm run dev
```

The local Vite proxy reads `REPLICATE_API_TOKEN` on the development server so the secret does not enter the browser bundle.

## Production direction

The commercial target is a white-label beauty try-on layer for retailers and brands: real catalog products and shades, personalized discovery, virtual try-on, product-level conversion actions, analytics, and privacy-conscious selfie handling.

The product should optimize the full shopping loop rather than only image generation:

`discover → try → compare → understand products → buy`

The next commercial milestones are:

1. Connect exact SKU purchase links to the product/result experience.
2. Add full-look cart actions and conversion events.
3. Split the legacy single-file UI into maintainable product, try-on, advisor, and commerce modules.
4. Add client-specific catalogs so recommendations never cross into competitor products in branded deployments.
5. Add production abuse protection/rate limiting before broad public traffic.
6. Validate visual product fidelity per SKU; keep the UI explicit that current output is a visual simulation rather than calibrated colorimetric matching.

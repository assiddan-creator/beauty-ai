# Beauty AI — Commercial Roadmap

## Product position

Beauty AI should be sold as a conversion layer for beauty retailers and brands, not as a generic AI image generator.

The core shopping loop is:

`discover → try → compare → understand products → buy`

The product should make it easy for a shopper to answer three questions:

1. Which makeup direction do I want to explore?
2. What does this exact product or look simulate on my photo?
3. Where do I buy the exact SKU or full look?

## Phase 1 — Trust, stability, and cost control

Status: in progress / mostly complete.

- Server-only AI secrets.
- Same-site protection on billable API routes.
- Phone-image compression and payload controls.
- Cost-aware Claude routing.
- Public data-handling notice.
- In-app transparency layer.
- Runtime operator / retailer identity configuration.
- Explicit visual-simulation accuracy language.

Before broad public traffic:

- Add production-grade rate limiting / abuse protection.
- Add client-specific legal privacy terms and contact details.

## Phase 2 — Conversion loop

Highest commercial priority.

- Connect exact product IDs to retailer product URLs.
- Show a clear `Shop this product` action after a single-product try-on.
- Show `Shop this look` after a preset/full-look try-on.
- Support `Add all to cart` when the retailer integration allows it.
- Keep the exact brand, product, shade, and finish visible beside the result.
- Add conversion events for: try-on started, try-on completed, product opened, add-to-cart, checkout handoff.

Do not invent purchase links. A button only appears when the client catalog provides a verified destination.

## Phase 3 — Client catalog isolation

A branded deployment should only recommend products that belong to that client's approved catalog.

- One catalog per retailer / brand deployment.
- No competitor products inside a branded experience unless explicitly configured.
- SKU metadata should include stable product ID, brand, product name, shade, finish, swatch, inventory state, and purchase URL.
- Recommendations and advisor chat should receive the same approved catalog context.

## Phase 4 — Product-fidelity validation

The current generative workflow is a visual simulation, not calibrated colorimetry.

For commercial claims, validate each SKU or shade family before exposing it broadly:

- Compare generated output against controlled reference photography.
- Test several lighting conditions and skin-tone ranges.
- Tune prompt/product metadata per category and finish.
- Track failure patterns such as identity drift, color drift, over-smoothing, and makeup bleeding outside the intended area.
- Keep accuracy language conservative until calibration data supports stronger claims.

## Phase 5 — White-label packaging

- Runtime operator and retailer identity.
- Client-specific logo, accent color, typography, and catalog.
- Client-specific privacy/contact details.
- Optional embedded widget mode for retailer product pages.
- Optional standalone consultation flow for campaign landing pages and in-store tablets.

## UX principles

- Mobile first.
- One primary action per screen.
- Product information stays close to the generated result.
- AI advice should be short and practical.
- Avoid medical framing and appearance scoring.
- Recommendations should focus on color direction, finish, intensity, occasion, and product choice.
- Clearly distinguish a visual simulation from an exact physical shade match.

## Competitive bar

Leading beauty virtual-try-on products increasingly combine virtual visualization, personalized product discovery, full-look shopping, and brand-specific catalog context in one flow. Beauty AI should compete on a simpler setup for smaller retailers, strong generative visuals, a useful advisor, and flexible white-label deployment.

## Next implementation order

1. Finish trust-layer preview validation and merge.
2. Refactor the commerce/product section out of the legacy `App.tsx` monolith.
3. Wire verified `purchaseLinks` into product cards and result screens.
4. Add `Shop this look` / full-look cart hooks.
5. Add conversion analytics events without sending selfie image data.
6. Continue the broader UI redesign once the commercial conversion loop is structurally sound.

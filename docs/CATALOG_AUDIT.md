# Beauty AI commercial catalog audit

This audit covers the current code structure as of September 2026. It is a product/catalog integrity review, not a claim that any named product is currently stocked by a retailer.

## Current state

The app currently has two separate product sources inside `src/App.tsx`:

1. `LOOK_PRODUCTS` — the product/shade recipes used by the 20 curated looks.
2. `PRODUCT_CATALOG` — the smaller catalog exposed by the direct “specific product” try-on flow.

The curated look library contains 20 looks with three product references per look (60 references total). Those references resolve to roughly 24 distinct brand/product/shade combinations.

The direct product try-on catalog currently contains 12 entries.

## Coverage gap

Only part of the look library is represented in the direct product catalog. The direct catalog currently covers products such as:

- MAC MACximal Silky Matte Lipstick — Velvet Teddy, Ruby Woo, Mehr
- Dior Addict Lip Maximizer — 001 Pink, 018 Intense Spice
- NARS Powermatte Lipstick — Dragon Girl
- Charlotte Tilbury Matte Revolution Lipstick — Pillow Talk
- MAC Lip Pencil — Spice
- NARS Powder Blush — Taj Mahal, Dolce Vita
- MAC Powder Blush — Melba
- Rare Beauty Soft Pinch Liquid Blush — Joy

The curated looks also reference products that do not currently exist in `PRODUCT_CATALOG`, including examples from Kiko Milano, YSL, Fenty Beauty, Bobbi Brown, Maybelline, Ga-De, Careline, additional MAC liner shades, NARS liner shades, and Dior blush.

This means a user can see a product inside a curated look even though the same exact product/shade is not yet selectable in the direct product flow.

## Naming inconsistencies

There are also canonical-name differences that can break exact matching even when the commercial item is logically the same.

Examples found in the current code:

- `M·A·Cximal Silky Matte Lipstick` vs `MACximal Silky Matte Lipstick`
- `NARS Blush` vs `NARS Powder Blush`

Commercial purchase links should therefore be keyed by stable product IDs, not by display text alone.

## Recommended commercial architecture

Before onboarding a real retailer, move toward one canonical catalog record per exact SKU/shade with:

- stable internal product ID
- retailer SKU
- brand
- canonical product name
- shade name / shade code
- category and product type
- finish and shade family
- swatch value used for UI only
- direct retailer product URL
- optional price label
- availability state
- aliases for legacy display names

Curated looks should reference those stable product IDs instead of duplicating brand/product/shade strings.

## Commerce configuration

`public/commercial-config.json` remains intentionally empty by default. The app must not invent retailer URLs or imply a commercial partnership.

For a retailer deployment, populate exact product/shade links only after the retailer catalog has been verified. The purchase layer already supports configured product links and look-level links.

## Conversion measurement

The commercial build now has a first-party session funnel for QA and retailer pilots. It records only coarse product-flow events in `sessionStorage` and sends nothing to a third-party analytics service by default.

Tracked stages:

- app loaded
- beauty analysis requested / succeeded / failed
- try-on requested / succeeded / failed
- commerce sheet opened
- commerce link clicked

No selfie, generated image, free-text beauty-chat message, API payload, IP address, email, or retailer URL is stored by this funnel layer.

For QA in the browser console, the current session snapshot is available through:

`window.beautyCommercialFunnel?.()`

## Next catalog step

The next safe refactor is to extract `LOOK_PRODUCTS` and `PRODUCT_CATALOG` from the legacy monolithic `App.tsx` into a single canonical catalog module, then make curated looks, direct product try-on, purchase mapping, and future retailer imports all use the same product IDs.

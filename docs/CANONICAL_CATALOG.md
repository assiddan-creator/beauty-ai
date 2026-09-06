# Beauty AI canonical product identity

The commercial build now has a stable product-identity layer in `src/lib/beautyCatalog.ts`.

## Why this exists

The legacy app currently stores product names in several places and some names are not textually identical. Examples include:

- `M·A·Cximal Silky Matte Lipstick` and `MACximal Silky Matte Lipstick`
- `NARS Blush` and `NARS Powder Blush`

A retailer purchase flow must not depend on exact display-text equality because that can hide a valid purchase link or, worse, connect the wrong shade after catalog changes.

## Stable IDs

The canonical layer assigns stable internal IDs to the exact brand/product/shade combinations currently used by the curated look library and direct product flow.

Examples:

- `mac-velvet-teddy`
- `dior-lip-maximizer-001`
- `nars-blush-dolce-vita`
- `rare-beauty-joy`

Retailer configuration should use these stable IDs when the retailer item corresponds to a known Beauty AI product.

## Retailer mappings are canonical-ID first

For a product that already exists in the Beauty AI canonical catalog, retailer configuration only needs the stable product ID, retailer URL, and optionally commercial metadata. The app takes the visible brand, product name, and shade name from the canonical catalog instead of trusting duplicate retailer text.

Example shape using a non-production placeholder URL:

```json
{
  "id": "mac-velvet-teddy",
  "url": "https://example.com/products/mac-velvet-teddy",
  "priceLabel": "",
  "retailerSku": "SKU-EXAMPLE-001",
  "availability": "in_stock"
}
```

Supported availability states are:

- `in_stock`
- `out_of_stock`
- `unknown`

If availability is missing or invalid, the app treats it as `unknown`. Products explicitly marked `out_of_stock` are not offered as purchase links in the Beauty AI commerce layer, and `getPurchaseUrl()` also refuses to return their URL. This keeps a stale product page from being presented as a currently purchasable shade.

`retailerSku` is optional metadata for retailer reconciliation and conversion events. It is not used as the Beauty AI product identity; the stable canonical ID remains authoritative.

This prevents a retailer feed typo or formatting difference from changing the identity shown to the shopper while still allowing each retailer to own its URL, SKU, availability, and pricing metadata.

Retailer-specific products that are not yet in the canonical Beauty AI catalog remain supported. For those unknown IDs, the retailer configuration must include the full exact identity (`brand`, `productName`, `shadeName`) together with the URL so the commerce layer does not guess.

`public/commercial-config.json` stays empty by default. Real retailer URLs, prices, SKUs, availability, or partnership claims must only be added after the retailer catalog has been verified.

## Look mapping

`LOOK_PRODUCT_IDS` maps each curated look to the three canonical product IDs that compose it. This creates a reliable bridge between a visual look and a retailer catalog without putting retailer URLs inside the look definitions.

## Alias-aware commerce matching

The commerce layer checks canonical aliases when deciding whether a configured product is visible in the current app state. This fixes known naming differences while preserving a fallback for retailer-specific IDs that are not yet in the canonical Beauty AI catalog.

## What is intentionally not changed yet

`src/App.tsx` remains a large legacy single-file component and still contains its existing `LOOK_PRODUCTS` and direct `PRODUCT_CATALOG` data. Removing those duplicated definitions is a larger refactor because that file drives the active try-on experience.

The safe migration order is:

1. establish stable canonical IDs and alias-aware commerce matching;
2. make retailer mappings canonical-ID first;
3. add retailer SKU and stock-state support without inventing retailer data;
4. verify production behavior;
5. move the legacy look and direct-product definitions to the canonical module without changing prompts or UI behavior;
6. add automated retailer catalog imports only after the catalog source of truth is unified.

This staged approach keeps the live try-on flow stable while the commercial catalog architecture is improved.

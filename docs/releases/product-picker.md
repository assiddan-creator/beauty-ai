# Product picker release batch

This release branch exists to validate the catalog-backed specific-product picker before the feature PR is merged.

Validation scope:

- TypeScript/Vite production build completes.
- Product category → brand → product → shade selectors compile against `productCatalogFacade`.
- Product selection analytics compile against the first-party commercial funnel.
- Existing `App.tsx` is intentionally unchanged in this batch.
- No retailer URL, SKU, price, or availability data is introduced.

After a successful preview build, merge the feature PR first. The actual `App.tsx` cutover remains a separate release step because that file is large and carries the working try-on flow.

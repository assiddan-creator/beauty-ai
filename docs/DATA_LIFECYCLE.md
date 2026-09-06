# Beauty AI data lifecycle

This document describes the current product implementation. It is an engineering/product reference, not a legal privacy policy.

## Current image flow

1. The user captures or uploads a selfie in the browser.
2. Large inline images are compressed in the browser before API transport.
3. Beauty matching analysis is sent through the Beauty AI server function to the Anthropic API.
4. Makeup generation is sent through the Beauty AI server-side Replicate proxy to the selected image-editing model.
5. The generated Replicate output URL is rendered in the browser.
6. Recent result references may be stored in browser local storage under `beauty-tryon-history-v1`.

The current application does not include a dedicated server-side database for selfie storage.

## Current provider lifecycle

Provider behavior must be re-verified before each commercial launch or contract because policies can change.

As of September 2026:

- Replicate API prediction data and output files are deleted by default after about one hour.
- Anthropic API inputs and outputs are deleted by default within 30 days, subject to legal, safety, and contractual exceptions.
- Anthropic commercial API inputs and outputs are not used for model training by default unless the customer explicitly opts in or submits qualifying feedback.

## Local result history

Replicate API output URLs are short-lived, so keeping them in local storage for days creates stale `Preview expired` cards without providing useful persistent history.

The current app therefore prunes local result-history entries before React loads them:

- storage key: `beauty-tryon-history-v1`
- local result-reference TTL: 50 minutes
- maximum local entries: 12
- malformed or fully expired local history is removed
- users can clear local result history from the in-app Privacy & Transparency panel

The clear-history control removes local-storage history. It does not force an immediate reload, so a result already held in the current React screen may remain visible until navigation or refresh.

## Persistent history — future architecture

Do not treat Replicate output URLs as permanent assets.

If a retailer later wants user accounts, saved looks, CRM history, or a persistent gallery, copy approved generated outputs into operator-controlled object storage and define, before launch:

- explicit user consent and purpose
- retention period
- delete / account-delete behavior
- access controls and tenant isolation
- signed or private asset URLs where appropriate
- region and data-residency requirements
- processor/subprocessor disclosures
- backup retention
- support and legal deletion workflows

Persistent storage is intentionally not enabled in the current build.

## Commercial catalog and analytics

Retailer purchase URLs are loaded from `/commercial-config.json`. Default mappings are empty so the demo does not invent URLs or imply a commercial partnership.

Commerce clicks emit the browser event `beauty:commerce-click`. This event currently contains product/look metadata only and is not connected to a third-party analytics vendor by default.

## Secrets

AI credentials remain server-side:

- `ANTHROPIC_API_KEY`
- `REPLICATE_API_TOKEN`

The browser must never receive the real provider secrets.

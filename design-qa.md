# Vesti Beauty — Design QA

## Visual source of truth

- Tutorial contact sheet: `../../outputs/vesti-tutorial-contact-sheet.png`
- Lipstick contact sheet: `../../outputs/vesti-lipstick-contact-sheet.png`
- Entry reference frame: `../../outputs/tutorial-05-brand-lifestyle.png`
- Product reference frame: `../../outputs/lipstick-01-product-rail.png`
- Result reference frame: `../../outputs/lipstick-04-before-after.png`

The video frames are 480 × 270 pixels. They are campaign references rather than pixel-identical screen specifications, so the comparison targets their visual system: editorial black canvas, restrained ivory type, deep red action color, large face/product imagery, sparse hierarchy, and a clear before/after reveal.

## Implementation captures

- Entry, iPad landscape: `qa/01-entry-ipad.png`
- Product selection, iPad landscape: `qa/02-products-ipad.png`
- Result, iPad landscape: `qa/03-result-ipad.png`
- Entry comparison: `qa/compare-entry.png`
- Product comparison: `qa/compare-products.png`
- Result comparison: `qa/compare-result.png`

The implementation captures are 1180 × 820 pixels at a 1180 × 820 CSS viewport and density 1. Mobile responsiveness was separately verified in the in-app browser at a 390 × 844 CSS viewport and density 1.

## States reviewed

- Entry
- Uploaded-photo confirmation
- Product category
- Brand selection
- Product selection
- Shade selection
- Product result
- Before/after slider at 50 and 75
- Hebrew and English
- iPad landscape and phone portrait

## Interaction and behavior checks

- The photo-confirmation primary action enters product selection directly.
- The product flow advances category → brand → product → shade and supports back navigation.
- Language switching updates the active retail interface.
- The result slider changes from 50 to 75 through its accessible range control.
- Expert analysis, recommendations, custom request, and look-selection controls are absent from retail mode.
- The download action is absent from retail mode.
- Horizontal overflow is absent at 1180 × 820 and 390 × 844.
- Retail sessions automatically return to the entry screen after three minutes without interaction.
- The paid try-on action was intentionally not triggered during QA.

## Browser and build evidence

- Browser: Codex in-app Chromium browser and Microsoft Edge headless.
- Console: no errors or warnings in the reviewed result state.
- Production build: passed with TypeScript and Vite.
- `git diff --check`: passed; only line-ending notices were reported by Git.

## Issue history

1. Early phone PNG captures appeared clipped because the external headless browser enforced a wider layout viewport than the requested screenshot crop. The interface was rechecked with explicit device metrics; `innerWidth`, document width, and body width were all 390 pixels, with no overflow.
2. The retail result still exposed a download action. It was hidden in retail mode to keep the kiosk decision path focused.
3. The reset action restored the legacy look mode internally. It now restores product mode when the retail shell is active.
4. A three-minute inactivity reset was added for unattended store use.

final result: passed

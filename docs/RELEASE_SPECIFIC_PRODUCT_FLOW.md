# Specific-product flow release check

This release branch validates the App.tsx migration that replaces the legacy in-file product selector with the reusable catalog-backed ProductTryOnPicker.

Validation target:
- category → brand → product → shade
- existing product try-on generation handler remains unchanged
- unified canonical catalog supplies the selection UI
- ordinary feature branches remain deployment-disabled


Fix the logo update by replacing the actual served asset and removing cache ambiguity.

1. Replace the currently served logo file
- Overwrite `public/logo.png` with the newly uploaded image, since the live UI is still reading `/logo.png`.
- Also overwrite `src/assets/logo.png` so both asset locations stay consistent.

2. Eliminate stale-browser caching
- Stop relying on the plain `/logo.png` path for in-app branding.
- Create a single shared logo import from `src/assets/logo.png` and use that import in:
  - `src/components/Navbar.tsx`
  - `src/components/DashboardSidebar.tsx`
- This makes Vite fingerprint the file so the preview loads the new image instead of a cached old one.

3. Update the remaining header branding spot
- In `src/components/Navbar.tsx`, replace the mobile sheet header’s current `Zap` icon block with the same uploaded logo image so every header surface uses the same brand asset.

4. Keep current sizing and styling
- Preserve the original logo sizes already in code:
  - Navbar: `h-10 w-10`
  - Sidebar: `h-9 w-9`
- Keep the black header styling as-is.

5. Refresh favicon consistency
- Update `index.html` favicon reference to use the current logo asset path strategy or re-save the public logo so browser tabs stop showing the old mark.

6. Verify all logo references
- Check for any remaining hardcoded `/logo.png` usages and update only the app-branding ones that should reflect the new uploaded file.
- Leave unrelated download/export references like generated file names alone.

Technical details
- Current code still points to `/logo.png` in `Navbar.tsx` and `DashboardSidebar.tsx`, which explains why the old image can persist if the public asset was not actually replaced or is being cached.
- There are two logo files in the repo (`public/logo.png` and `src/assets/logo.png`), so the safest MVP fix is:
  - replace both files
  - use the imported `src/assets/logo.png` in React components
  - keep `public/logo.png` for favicon/browser-level usage

Expected result
- The homepage header, sidebar logo, and mobile menu header all show the newly uploaded image.
- The preview stops serving the old cached logo.
- Logo dimensions remain at the original size.

# Greening `npm run lint:build` — remaining cleanup

`npm run lint:build` (the production gate, `eslint -c eslint.build.config.mjs
"./src/**/*.{js,jsx,ts,tsx}" "./cypress/**/*.{js,jsx,ts,tsx}"`) is red from debt that
predates the instanced-rendering work. All files touched by that work pass the gate
individually. This doc tracks what's left.

## Done

- **Removed 13 stray compiled `.js` artifacts** in `src/models/` and `src/utilities/`
  (each had a `.ts` sibling; absent on `main`; webpack/jest resolve `.ts` first so they
  were dead). This cut the gate from ~3808 to ~2990 errors with no test or build impact.

## Remaining (each its own focused task)

1. **Vendored `src/codap/` `.js` artifacts (~63 files).** These are compiled outputs of
   the vendored CODAP source and are the bulk of the remaining `.js` errors. Do **not**
   hand-delete piecemeal: `src/codap/` is synced via
   `rsync -av --existing --delete ../codap/v3/src/ src/codap/` (CLAUDE.md), and `--existing`
   won't recreate deleted files. Options, in order of preference:
   - Add `src/codap/**/*.js` (and the two `src/**/*.js` mocks/tests below if desired) to an
     ignore block in `eslint.build.config.mjs`. Codecov already ignores `src/codap/`; the
     lint gate should too. **This is the single highest-leverage fix.**
   - Or stop committing compiled `.js` under `src/codap/` entirely (gitignore + remove).

2. **60 pre-existing errors + 221 warnings in 22 `.ts/.tsx` source files** (none touched by
   the instanced work): e.g. `point.tsx` (now-dead reference code), `codap-utils.ts`,
   `dataset-config-panel.tsx`, `dst-legend.tsx`, `graph-tab.tsx`, `opacity-manager.ts`,
   `codap-dataset-utils.ts`, `map-bounds-manager.ts`, `get-min-max-coordinates.ts`. Many
   are `--fix`-able; run `npx eslint -c eslint.build.config.mjs "./src/**/*.{ts,tsx}" --fix`
   first, then hand-resolve the rest. Review each change for behavior impact.

3. **Two legitimate non-artifact `.js`** (`src/__mocks__/styleMock.js`,
   `src/components/__tests__/dataset-config-panel.test.js`) — real files, not artifacts;
   fix their lint errors in place or convert to `.ts`.

## Suggested order

`eslint.build.config.mjs` ignore for `src/codap/**/*.js` (item 1) → `--fix` pass on
`.ts/.tsx` (item 2) → hand-resolve residual `.ts/.tsx` errors → item 3. Re-run
`npm run lint:build` after each.

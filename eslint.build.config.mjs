import baseConfig from "./eslint.config.mjs"
import typescriptEslint from "typescript-eslint"

// build/production configuration extends default/development configuration
export default typescriptEslint.config(
  ...baseConfig,
  {
    // The production lint gate (npm run build) covers shipped code. It does not
    // gate on:
    //  - compiled .js artifacts of the vendored CODAP TS sources (the .ts is the
    //    source of truth — see CLAUDE.md; codecov also ignores this tree), or
    //  - test / mock / setup files, which aren't bundled and are still linted by
    //    the dev `npm run lint` and exercised by `npm test`.
    ignores: [
      "src/codap/**/*.js",
      "**/*.test.{js,jsx,ts,tsx}",
      "**/__tests__/**",
      "src/test/**",
      "src/__mocks__/**"
    ]
  },
  {
    rules: {
      // FIXME a new prefix is needed
      "@eslint-community/eslint-comments/no-unused-disable": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error"      
    }
  }
);

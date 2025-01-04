import baseConfig from "./eslint.config.mjs"
import typescriptEslint from "typescript-eslint"

// build/production configuration extends default/development configuration
export default typescriptEslint.config(
  ...baseConfig,
  {
    rules: {
      // FIXME a new prefix is needed
      "@eslint-community/eslint-comments/no-unused-disable": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error"      
    }
  }
);

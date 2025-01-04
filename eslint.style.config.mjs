import baseConfig from "./eslint.config.mjs"
import typescriptEslint from "typescript-eslint"
import stylisticJsx from "@stylistic/eslint-plugin-jsx"

export default typescriptEslint.config(
  ...baseConfig,
  {
    plugins: {
      "@stylistic/jsx": stylisticJsx
    },
    rules: {
      "@stylistic/js/array-bracket-spacing": ["error", "never"],
      "@stylistic/js/object-curly-spacing": ["error", "always"],
      "@stylistic/jsx/jsx-curly-spacing": ["error", { "when": "never", "children": { "when": "always" } }],
    }
  }
)

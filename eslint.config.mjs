// @ts-check

import stylisticEslintPlugin from "@stylistic/eslint-plugin"
import stylisticJs from "@stylistic/eslint-plugin-js"
import globals from "globals"
import jest from "eslint-plugin-jest"
import json from "eslint-plugin-json"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import testingLibrary from "eslint-plugin-testing-library"
import tsParser from "@typescript-eslint/parser"
import typescriptEslint from "typescript-eslint"
import js from "@eslint/js"
import comments from "@eslint-community/eslint-plugin-eslint-comments/configs"
import { flatConfigs as importPluginConfig } from "eslint-plugin-import"
import pluginCypress from "eslint-plugin-cypress/flat"

// This helper `config()` function replaces the basic [] used by 
// eslint normally:
// https://typescript-eslint.io/packages/typescript-eslint#config
export default typescriptEslint.config(
  {
    ignores: [ "dist/", "node_modules/" ]  
  },
  js.configs.recommended,
  typescriptEslint.configs.recommended,
  typescriptEslint.configs.stylistic,
  // @ts-expect-error for some reason the rules in comments.recommend are not compatible with
  // RuleEntry
  comments.recommended,
  importPluginConfig.recommended,
  importPluginConfig.typescript,
  react.configs.flat?.recommended,
  // React Hooks plugin doesn't have a flat config built in so the following approach is
  // used. See https://github.com/facebook/react/issues/28313 for more info
  {
    name: "react hooks rules",
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    name: "browser files",
    files: ["src/**"],
    languageOptions: {
      globals: globals.browser
    }
  },
  {
    name: "general rules",
    plugins: {
      "@stylistic": stylisticEslintPlugin,
      "@stylistic/js": stylisticJs,
    },
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2018,
      sourceType: "module"
    },
    linterOptions: {
      reportUnusedDisableDirectives: false
    },
    settings: {
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"]
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "."
        }
      },
      react: {
        pragma: "React",
        version: "detect"
      }
    },
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-confusing-non-null-assertion": "error",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-empty-object-type": ["error", { allowInterfaces: "always" }],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/no-shadow": ["warn", { builtinGlobals: false, hoist: "all", allow: [] }],
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-unused-expressions": ["error", { allowShortCircuit: true }],
      "@typescript-eslint/no-unused-vars": ["warn", { args: "none", caughtErrors: "none", ignoreRestSiblings: true }],
      "@typescript-eslint/prefer-optional-chain": "off",
      "@stylistic/semi": ["warn", "always"],
      "curly": ["error", "multi-line", "consistent"],
      "dot-notation": "error",
      "eol-last": "warn",
      "eqeqeq": ["error", "smart"],
      "@eslint-community/eslint-comments/no-unused-disable": "off",   // enabled in eslint.build.config.js
      "import/no-cycle": "warn",
      "import/no-extraneous-dependencies": "warn",
      "import/no-useless-path-segments": "warn",
      "@stylistic/js/jsx-quotes": ["error", "prefer-double"],
      "max-len": ["off", { code: 120, ignoreUrls: true }],
      "no-bitwise": "error",
      "no-debugger": "off",
      "no-duplicate-imports": "error",
      "no-sequences": "error",
      "no-shadow": "off", // superseded by @typescript-eslint/no-shadow
      "no-tabs": "error",
      "no-unneeded-ternary": "error",
      // This is superseded by the typescript rule
      "no-unused-expressions": "off",
      "no-unused-vars": "off",  // superseded by @typescript-eslint/no-unused-vars
      "no-useless-call": "error",
      "no-useless-concat": "error",
      "no-useless-rename": "error",
      "no-useless-return": "error",
      "no-var": "error",
      "no-whitespace-before-property": "error",
      "object-shorthand": "error",
      "prefer-const": ["off", { destructuring: "all" }],
      "prefer-object-spread": "error",
      "prefer-regex-literals": "error",
      "prefer-rest-params": "off",
      "prefer-spread": "error",
      "quotes": ["error", "double", { allowTemplateLiterals: true, avoidEscape: true }],
      "radix": "error",
      // TODO: convert to stylistic
      "react/jsx-closing-tag-location": "error",
      "react/jsx-handler-names": "off",
      "react/jsx-no-useless-fragment": "error",
      "react/no-access-state-in-setstate": "error",
      "react/no-danger": "error",
      "react/no-unsafe": ["off", { checkAliases: true }],
      "react/no-unused-state": "error",
      "react/prop-types": "off",
    },
  },
  {
    name: "CODAP relaxed rules",
    files: ["src/codap/**"],
    rules: {
      "quotes": "off",
      "@stylistic/js/jsx-quotes": "off",
      "@stylistic/semi": ["warn", "never", { beforeStatementContinuationChars: "always" }],
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/class-literal-property-style": "off",
      "@typescript-eslint/consistent-generic-constructors": "off",
      "@typescript-eslint/consistent-indexed-object-style": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "react/jsx-no-useless-fragment": "off",
    }
  },
  {
    name: "rules specific to Jest tests",
    files: ["src/**/*.test.*"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    // ts eslint's config function adds back in the `extends` feature of the older eslint
    extends: [
      jest.configs['flat/recommended'],
      testingLibrary.configs['flat/react']
    ],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      // require() can be useful in mocking
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-var-requires": "off",
      "jest/no-done-callback": "off"
    }
  },
  { 
    name: "rules specific to Cypress tests",
    files: ["cypress/**"],
    extends: [
      pluginCypress.configs.recommended
    ],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-var-requires": "off",
      "cypress/no-unnecessary-waiting": "off"
    }
  },
  {
    files: ["**/*.json"],
    ...json.configs["recommended"]
  },
  {
    name: "webpack configs",
    files: ["webpack.config.js"],
    languageOptions: {
      globals: {
        ...globals.node
      },      
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-var-requires": "off",
      "quotes": ["error", "single", { allowTemplateLiterals: true, avoidEscape: true }],
    }
  }
);

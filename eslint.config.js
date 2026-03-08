import js from "@eslint/js"
import stylistic from "@stylistic/eslint-plugin"
import vitest from "@vitest/eslint-plugin"
import { defineConfig } from "eslint/config"
import eslintPluginImport from "eslint-plugin-import"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefreshPlugin from "eslint-plugin-react-refresh"
import globals from "globals"
import tseslint from "typescript-eslint"

export default defineConfig([
  {
    ignores: ["dist", "coverage", "node_modules"],
  },
  {
    files: ["**/*.{js,ts,tsx}"],
    ignores: ["**/*.d.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
    settings: {
      react: { version: "detect" },
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strict,
      ...tseslint.configs.stylistic,
      eslintPluginImport.flatConfigs.recommended,
      eslintPluginImport.flatConfigs.typescript,
    ],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefreshPlugin,
      "@stylistic": stylistic,
    },
    rules: {
      // React Hooks
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",

      // React Refresh
      "react-refresh/only-export-components": ["warn", {
        allowConstantExport: true,
      }],

      // Function style
      "func-style": ["error", "expression"],
      "prefer-arrow-callback": "error",
      "react/function-component-definition": ["error", {
        namedComponents: "arrow-function",
        unnamedComponents: "arrow-function",
      }],

      // TypeScript
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": ["error", {
        prefer: "type-imports",
      }],
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      }],

      // React
      "react/jsx-tag-spacing": ["error", {
        "afterOpening": "never",
        "beforeClosing": "never",
      }],
      "react/prop-types": "off",

      // General
      "no-console": "warn",

      // Stylistic
      "@stylistic/array-bracket-newline": ["error", "consistent"],
      "@stylistic/array-element-newline": ["error", "consistent"],
      "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
      "@stylistic/comma-dangle": ["error", "always-multiline"],
      "@stylistic/eol-last": ["error", "always"],
      "@stylistic/indent": ["error", 2, { SwitchCase: 1 }],
      "@stylistic/jsx-quotes": ["error", "prefer-double"],
      "@stylistic/no-multi-spaces": ["error"],
      "@stylistic/no-multiple-empty-lines": ["error", { max: 1 }],
      "@stylistic/no-trailing-spaces": ["error"],
      "@stylistic/object-curly-newline": ["error", { consistent: true }],
      "@stylistic/object-property-newline": ["error", { allowAllPropertiesOnSameLine: true }],
      "@stylistic/object-curly-spacing": ["error", "always"],
      "@stylistic/padding-line-between-statements": ["error", {
        blankLine: "always",
        prev: "*",
        next: "return",
      }],
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/semi": ["error", "never"],
      "@stylistic/member-delimiter-style": ["error", {
        multiline: { delimiter: "none", requireLast: false },
        singleline: { delimiter: "semi", requireLast: false },
      }],

      // Import
      "import/first": "error",
      "import/order": ["error", {
        "newlines-between": "always",
        "groups": [["builtin", "external", "internal"], "parent", "sibling", "index"],
        "pathGroups": [{ pattern: "@/**", group: "internal", position: "after" }],
        "pathGroupsExcludedImportTypes": ["builtin"],
        "alphabetize": { order: "asc", caseInsensitive: true },
      }],
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "import/no-unresolved": "off",
      "import/named": "off",
      "import/default": "off",
      "import/namespace": "off",
    },
  },
  {
    files: ["**/hooks/**/*.{ts,tsx}", "**/router.tsx", "tests/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["tests/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    files: ["tests/**/*.{ts,tsx}", "**/*.config.{ts,js}", "server/**/*.ts"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["tests/**/*.{ts,tsx}"],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
      "vitest/no-conditional-expect": "warn",
      "vitest/expect-expect": "error",
    },
  },
])

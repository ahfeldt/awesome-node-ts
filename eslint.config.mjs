import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginImport from "eslint-plugin-import";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      import: eslintPluginImport
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "import/order": ["warn", { "newlines-between": "always", "alphabetize": { "order": "asc" } }]
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    ignores: ["dist"]
  }
);

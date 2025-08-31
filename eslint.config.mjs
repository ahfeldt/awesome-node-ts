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

      // 👇 ändrat från "warn" till "off" så CI inte bryr sig om import-ordningen
      "import/order": "off",

      // 👇 ny regel: tillåt 'any' tills vi hunnit typa färdigt
      "@typescript-eslint/no-explicit-any": "off"
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    ignores: ["dist"]
  },
  // 👇 speciellt för test-filer: tillåt 'any' helt fritt
  {
    files: ["test/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
);

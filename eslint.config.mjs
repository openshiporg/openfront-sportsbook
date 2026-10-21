import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "@typescript-eslint/ban-ts-comment": "error",
      "react-hooks/exhaustive-deps": "error",
      "react-hooks/rules-of-hooks": "error",
      "react/no-unescaped-entities": "error"
    },
  },
  { files: ["**/*.test.ts"], rules: { "@typescript-eslint/no-unused-expressions": "off" } },
  globalIgnores([".next/**", ".keystone/**", "out/**", "build/**", "next-env.d.ts", "features/dashboard/views/**", "features/dashboard/components/Fields.tsx", "features/dashboard/components/ListTable.tsx", "features/keystone/view-order/**", "app/api/mcp-transport/**"]),
]);

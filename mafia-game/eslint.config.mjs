import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      // Disable "any" restriction
      "@typescript-eslint/no-explicit-any": "off",

      // Disable unused vars errors (make them warnings if you prefer)
      "@typescript-eslint/no-unused-vars": "off",

      // Allow sync scripts in Next.js
      "@next/next/no-sync-scripts": "off",

      // Disable prefer-const blocking builds
      "prefer-const": "warn",

      // Downgrade React hooks deps check to a warning
      "react-hooks/exhaustive-deps": "warn",

      // Disable unescaped entities in JSX
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;

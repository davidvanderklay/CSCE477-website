// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Use compat.config() to load configurations AND apply overrides
  ...compat.config({
    // List the configurations you want to extend
    extends: [
      "next/core-web-vitals",
      // You had "next/typescript" here. 'next/core-web-vitals' usually
      // includes the necessary TypeScript setup. If you specifically need
      // something from 'next/typescript' that isn't in core-web-vitals,
      // you can keep it, but often 'next/core-web-vitals' is sufficient.
      // "next/typescript",
    ],
    // Add your rule overrides here
  }),

  // You can add other flat config objects here if needed
  // e.g., { files: [...], rules: {...} } for specific file types
];

export default eslintConfig;

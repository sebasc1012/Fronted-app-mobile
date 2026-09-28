// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // HU-06: todo texto pasa por AppText/AppTextInput para respetar el tamaño elegido.
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react-native",
              importNames: ["Text", "TextInput"],
              message: "Usa AppText / AppTextInput de @/components/ui/AppText.",
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },
]);

import eslint from "@eslint/js"
import configPrettier from "eslint-config-prettier"
import pluginAstro from "eslint-plugin-astro"
import pluginReact from "eslint-plugin-react"
import globals from "globals"
import tseslint from "typescript-eslint"

const tsconfigRootDir = new URL(".", import.meta.url).pathname

/** @type {import("eslint").Linter.Config[]} */
export default [
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    pluginReact.configs.flat.recommended,
    ...pluginAstro.configs.recommended,
    configPrettier,
    {
        files: ["**/*.astro"],
        languageOptions: {
            parser: "astro-eslint-parser",
            parserOptions: {
                parser: "@typescript-eslint/parser",
                projectService: true,
                tsconfigRootDir,
                sourceType: "module",
                ecmaVersion: "latest",
            },
        },
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: "@typescript-eslint/parser",
            parserOptions: {
                projectService: true,
                tsconfigRootDir,
                sourceType: "module",
                ecmaVersion: "latest",
            },
        },
    },
    {
        globals: { ...globals.browser },
        settings: {
            react: {
                version: "detect",
            },
        },
    },
]

import js from "@eslint/js";

export default [

    // Base recomendada (NO destructiva)
    js.configs.recommended,
    {
        ignores: [
            "node_modules/**",
            "dist/**"
        ],

        files: ["**/*.js", "**/*.cjs"],

        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "commonjs",

            globals: {
                console: "readonly",
                require: "readonly",
                module: "readonly",
                __dirname: "readonly",
                process: "readonly",
                setTimeout: "readonly"
            }
        },

        rules: {
            // ❗ No toques formato, no destruyas código
            indent: "off",
            curly: "off",
            quotes: "off",
            semi: "off",
            "comma-dangle": "off",
            "object-curly-spacing": "off",
            "array-bracket-spacing": "off",

            // ⚠️ Solo advertencias no-destructivas
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "no-undef": "error",

            // Preferencia suave
            eqeqeq: ["warn", "always"],
            "prefer-const": ["warn"],
            "no-var": "off",
            "no-console": "off"
        }
    }
];

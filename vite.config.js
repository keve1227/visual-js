import { fileURLToPath, URL } from "url";

import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import preprocess from "svelte-preprocess";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const production = mode === "production";

    return {
        plugins: [
            svelte({
                emitCss: production,
                preprocess: preprocess(),
                compilerOptions: { dev: !production },
                hot: !production && { injectCss: true },
            }),
        ],
        resolve: {
            alias: {
                "@": fileURLToPath(new URL("./src", import.meta.url)),
            },
        },
        build: {
            sourcemap: !production,
            minify: production ? "terser" : false,
            terserOptions: production ? { mangle: true, compress: true } : undefined,
        },
    };
});

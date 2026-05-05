import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vite.dev/config/
export default defineConfig({
    build: {
        target: "es2022",
        outDir: "../dist",
        rollupOptions: {
            output: {
                manualChunks: undefined,
            },
        },
    },
    plugins: [svelte(), viteSingleFile()],
});

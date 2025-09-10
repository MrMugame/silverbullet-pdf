import { viteSingleFile } from "vite-plugin-singlefile"

export default {
    build: {
        rollupOptions: {
            input: "./dist/web/viewer.html",
        },
        minify: true,
        outDir: "./dist/viewer"
    },
    plugins: [viteSingleFile()]
}
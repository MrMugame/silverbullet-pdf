import type { UserConfig } from "vite"
import fs from 'fs/promises';

async function wrapFile(path: string) {
    const content = await fs.readFile(path, "utf8");

    const text = `export default \`${content.replaceAll("\\", "\\\\").replaceAll("$", "\\$").replaceAll("\`", "\\\`")}\``;

    await fs.writeFile(`${path}.ts`, text);
}

export default {
    build: {
        lib: {
            name: "pdfviewer",
            entry: ["src/viewer.ts"],
            formats: ["iife"],
            cssFileName: "viewer",
            fileName: "viewer"
        },
        minify: true,
    },
    plugins: [
        {
            name: "test",
            closeBundle: async () => {
                // Prepare HTML file by combining it with the css
                const css = await fs.readFile("dist/viewer.css", "utf8");
                const html = await fs.readFile("src/viewer.html", "utf8");

                const content = `<style>${css.replaceAll("\n", "")}</style>\n${html}`;

                await fs.writeFile("dist/viewer.html", content);

                // Prepare
                wrapFile("dist/viewer.html");
                wrapFile("dist/viewer.iife.js");
            }
        }
    ]
} satisfies UserConfig
import html from "../dist/viewer.wrapped.ts";
import worker from "../dist/pdf.worker.wrapped.ts"
// This is so f*cking dumb, deno can't import the types I could directly build
// here, probably for some religous dumb reasons I don't even want to
// understand, because it would probably make me punch a hole in the monitor
// @deno-types="npm:pdfjs-dist"
import * as pdfjsLib from "../dist/pdf.min.mjs";

import { DocumentEditorContent } from "@silverbulletmd/silverbullet/type/client"
import { DocumentMeta } from "@silverbulletmd/silverbullet/type/index";
import { space } from "@silverbulletmd/silverbullet/syscalls";

// For some reason pdfjs will use window.location when setting up a worker, and
// once that fails it will set up a "fake worker". This prevents this.
self.window = self;

const workerURL = "data:application/javascript," + encodeURIComponent(worker)

pdfjsLib.GlobalWorkerOptions.workerSrc = workerURL;

export function viewer(): DocumentEditorContent {
    return { html: html.replace("{{ SILVERBULLET-PDF-WORKER-JS }}", workerURL) };
}

export async function extract({ meta }: { meta: DocumentMeta }) {
    if (meta.contentType !== "application/pdf") return;

    const raw = await space.readDocument(meta.name);

    const task = pdfjsLib.getDocument(raw);
    const pdf = await task.promise;

    const textPromises = Array.from({ length: pdf.numPages }, async (_, i) => {
        return (await (await pdf.getPage(i + 1)).getTextContent()).items.map(item => "str" in item ? item.str : "").join(" ");
    });

    const texts = await Promise.all(textPromises);

    let pos = 0;
    const navigationMap = texts.map((text, i) => {
        const route = {
            type: "range",
            from: pos,
            to: pos + text.length,
            tail: `@${i + 1}`
        };

        pos += text.length;
        return route;
    });

    return { content: texts.join(""), cacheMode: "persistent", navigationMap };
}
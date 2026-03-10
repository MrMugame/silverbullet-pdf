import html from "../dist/viewer.wrapped";
import worker from "../dist/pdf.worker.wrapped"

import * as pdfjsLib from "../dist/pdf.min.mjs";
const pdfjs = pdfjsLib as typeof import("../pdfjs/build/types/src/pdf");

import { DocumentEditorContent } from "@silverbulletmd/silverbullet/type/client";
import { DocumentMeta } from "@silverbulletmd/silverbullet/type/index";
import { editor, space } from "@silverbulletmd/silverbullet/syscalls";
import { version } from "../version";

// For some reason pdfjs will use window.location when setting up a worker, and
// once that fails it will set up a "fake worker". This prevents this.
// @ts-expect-error
self.window = self;

const workerURL = "data:application/javascript," + encodeURIComponent(worker)

pdfjs.GlobalWorkerOptions.workerSrc = workerURL;

export function viewer(): DocumentEditorContent {
    return { html: html.replace("{{ SILVERBULLET-PDF-WORKER-JS }}", workerURL) };
}

export async function extract({ meta }: { meta: DocumentMeta }) {
    if (meta.contentType !== "application/pdf") return;

    const raw = await space.readDocument(meta.name);

    const task = pdfjs.getDocument(raw);
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

export async function showVersion() {
    await editor.flashNotification(`Silverbullet PDF - Version ${version}`);
}
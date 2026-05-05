import { DocumentEditorContent } from "@silverbulletmd/silverbullet/type/client";
import { asset, editor, space } from "@silverbulletmd/silverbullet/syscalls";
import { Message } from "../shared/message";
import { DocumentMeta } from "@silverbulletmd/silverbullet/type/index";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { version } from "../dist/version";

const PLUG_NAME = "silverbullet-pdf";

// For some reason pdfjs will use window.location when setting up a worker, and
// once that fails it will set up a "fake worker". This prevents this.
self.window = self;

let workerUrl: string | null = null;

async function ensureWorkerIsInitalized() {
    if (workerUrl) return;

    const worker = await asset.readAsset(PLUG_NAME, "assets/pdf.worker.min.mjs");
    const inlined = "data:application/javascript," + encodeURIComponent(worker);

    workerUrl = inlined;
    pdfjsLib.GlobalWorkerOptions.workerSrc = inlined;
}

export async function viewer(): Promise<DocumentEditorContent> {
    await ensureWorkerIsInitalized();
    const html = await asset.readAsset(PLUG_NAME, "assets/index.html");

    // TODO: We should maybe test if loading the asset in the viewer is faster, but I would guess no.
    return {
        html: html.replace("{{ SILVERBULLET-PDF-WORKER-JS }}", workerUrl!),
    }
}

export async function zoomIn(): Promise<void> {
    await editor.sendMessage("custom", {
        type: "zoom-in"
    } satisfies Message);
}

export async function zoomOut(): Promise<void> {
    await editor.sendMessage("custom", {
        type: "zoom-out"
    } satisfies Message);
}

export async function zoomToFitHeight(): Promise<void> {
    await editor.sendMessage("custom", {
        type: "zoom-to-fit",
        fit: "height"
    } satisfies Message);
}

export async function zoomToFitWidth(): Promise<void> {
    await editor.sendMessage("custom", {
        type: "zoom-to-fit",
        fit: "width"
    } satisfies Message);
}

export async function zoomToFitPage(): Promise<void> {
    await editor.sendMessage("custom", {
        type: "zoom-to-fit",
        fit: "height"
    } satisfies Message);
}

export async function extract({ meta }: { meta: DocumentMeta }) {
    if (meta.contentType !== "application/pdf") return;

    await ensureWorkerIsInitalized();

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

    return { content: texts.join(" "), cacheMode: "persistent", navigationMap };
}

export async function showVersion() {
    await editor.flashNotification(`Silverbullet PDF - Version ${version}`);
}
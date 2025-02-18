// // deno-lint-ignore no-explicit-any
// globalThis.silverbullet.addEventListener("file-update", (event: any) => {
//     //(document.getElementById("editor") as HTMLTextAreaElement).value = new TextDecoder().decode(event.detail.data);
// });

// globalThis.silverbullet.addEventListener("request-save", () => {
//     //const content = (document.getElementById("editor") as HTMLTextAreaElement).value
//     //globalThis.silverbullet.sendMessage("file-saved", { data: new TextEncoder().encode(content) });
// });

// globalThis.silverbullet.addEventListener("focus", () => {
//    (document.getElementById("editor") as HTMLTextAreaElement).focus();
// });

import "https://esm.sh/pdfjs-dist@4.10.38/web/pdf_viewer.css"

import * as pdfjsLib from "https://esm.sh/pdfjs-dist@4.10.38/build/pdf.mjs?target=es2022";
import * as pdfjsViewer from "https://esm.sh/pdfjs-dist@4.10.38/web/pdf_viewer.mjs?target=es2022";

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://esm.sh/pdfjs-dist@4.10.38/build/pdf.worker.mjs?target=es2022";

const SEARCH_FOR = ""; // try "Mozilla";

const container = document.getElementById("viewerContainer") as HTMLDivElement;

const eventBus = new pdfjsViewer.EventBus();

const pdfLinkService = new pdfjsViewer.PDFLinkService({
    eventBus,
});

const pdfFindController = new pdfjsViewer.PDFFindController({
    eventBus,
    linkService: pdfLinkService,
});

const pdfScriptingManager = new pdfjsViewer.PDFScriptingManager({
    eventBus,
    sandboxBundleSrc: new URL("https://esm.sh/pdfjs-dist@4.10.38/build/pdf.sandbox.mjs?target=es2022"),
});

const pdfViewer = new pdfjsViewer.PDFViewer({
    container,
    eventBus,
    linkService: pdfLinkService,
    findController: pdfFindController,
    scriptingManager: pdfScriptingManager,
});
pdfLinkService.setViewer(pdfViewer);
pdfScriptingManager.setViewer(pdfViewer);

eventBus.on("pagesinit", function () {
    // We can use pdfViewer now, e.g. let's change default scale.
    pdfViewer.currentScaleValue = "page-width";

    // We can try searching for things.
    if (SEARCH_FOR) {
        eventBus.dispatch("find", { type: "", query: SEARCH_FOR });
    }
});

globalThis.silverbullet.addEventListener("file-open", async (event: any) => {
    // Loading document.
    const loadingTask = pdfjsLib.getDocument(event.detail.data as Uint8Array);

    const pdfDocument = await loadingTask.promise;

    // Document loaded, specifying document for the viewer and
    // the (optional) linkService.
    pdfViewer.setDocument(pdfDocument);
    pdfLinkService.setDocument(pdfDocument, null);
});

document.getElementById("zoomInButton")!.addEventListener("click", () => {
    pdfViewer.updateScale({ steps: 1 })
})

document.getElementById("zoomOutButton")!.addEventListener("click", () => {
    pdfViewer.updateScale({ steps: -1 })
})
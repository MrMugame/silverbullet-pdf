window.PDFViewerApplicationOptions.set("disablePreferences", true);

// Set to the empty string, so pdfjs doesn't initally load some pdf
window.PDFViewerApplicationOptions.set("defaultUrl", "");
window.PDFViewerApplicationOptions.set("workerSrc", "{{ SILVERBULLET-PDF-WORKER-JS }}");

window.silverbullet.addEventListener("file-open", async (event) => {
    window.PDFViewerApplication._contentDispositionFilename = event.detail.meta.name;
    await window.PDFViewerApplication.open({ data: event.detail.data });


    window.PDFViewerApplication.eventBus.on("documentinit", () =>  {
        const oldOnSetModified = window.PDFViewerApplication.pdfDocument.annotationStorage.onSetModified;

        window.PDFViewerApplication.pdfDocument.annotationStorage.onSetModified = () => {
            oldOnSetModified();

            window.silverbullet.sendMessage("file-changed");
        }
    });
});

window.silverbullet.addEventListener("request-save", async (event) => {
    const data = await window.PDFViewerApplication.pdfDocument.saveDocument();

    globalThis.silverbullet.sendMessage("file-saved", { data });
});

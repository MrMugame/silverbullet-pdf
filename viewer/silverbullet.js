// This seems to be the only reasonable solution right now
class AnnotationScrubber {
    static #baseline = null;
    static #checkInterval = 0;

    static markSaved() {
        this.#baseline = this.snapshot();
    }

    static isDirty() {
        return this.#baseline !== this.snapshot();
    }

    static initBaseline() {
        this.#baseline = this.snapshot();
    }

    static snapshot() {
        const storage = window?.PDFViewerApplication?.pdfDocument?.annotationStorage;
        if (!storage || !storage.serializable || !storage.serializable.map) return null;
        const map = storage.serializable.map;
        const entries = Array.from(map.entries());
        return JSON.stringify(entries);
    }

    static startChecking(callback) {
        this.#checkInterval = setInterval(() => {
            if (AnnotationScrubber.isDirty()) {
                callback();
                AnnotationScrubber.markSaved();
            }
        }, 250);
    }

    static stopChecking() {
        clearInterval(this.#checkInterval);
    }
}

async function saveDocument() {
    const data = await window.PDFViewerApplication.pdfDocument.saveDocument();
    window.silverbullet.sendMessage("file-saved", { data });
}

// Monkey patch console.log with some magic
const originalLog = console.log;
console.log = function () {
    originalLog.apply(console, ["[silverbullet-pdf]"].concat(Array.from(arguments)));
}

// No idea why this is attached to the parent of the window
window.parent.document.addEventListener("webviewerloaded", () => {
    window.PDFViewerApplicationOptions.set("disablePreferences", true);
    window.PDFViewerApplicationOptions.set("defaultUrl", "");
    // This is later replaced with the data url
    window.PDFViewerApplicationOptions.set("workerSrc", "{{ SILVERBULLET-PDF-WORKER-JS }}");

    // Could use this to disable JS
    // window.PDFViewerApplicationOptions.set("enableScripting", false);
    // window.PDFViewerApplicationOptions.set("isEvalSupported", false);

    window.PDFViewerApplication.initializedPromise.then(() => {
        window.PDFViewerApplication.eventBus.on("documentinit", () =>  {
            // These functions's attach an event handler to show the "Do you really
            // want to close this website" message. We don't need that. They also
            // set a virable to determine where the doc is modified, which is used
            // on closing the editor, which doesn't properly work.
            // https://github.com/mozilla/pdf.js/issues/19966
            window.PDFViewerApplication.pdfDocument.annotationStorage.onSetModified = () => {}
            window.PDFViewerApplication.pdfDocument.annotationStorage.onResetModified = () => {}
        });
    });
});

window.silverbullet.addEventListener("request-save", async () => {
    if (!window.PDFViewerApplication?.pdfDocument) {
        console.error("Failed to save, no document");
        return;
    }

    saveDocument();
});

window.silverbullet.addEventListener("file-open", async (event) => {
    if (AnnotationScrubber.isDirty()) {
        saveDocument();
    }

    await window.PDFViewerApplication.open({ data: event.detail.data });

    window.PDFViewerApplication.setTitle(event.detail.meta.name);
    window.PDFViewerApplication._contentDispositionFilename = event.detail.meta.name;

    AnnotationScrubber.initBaseline();

    AnnotationScrubber.stopChecking();

    AnnotationScrubber.startChecking(() => {
        window.silverbullet.sendMessage("file-changed");
    });
});

// Ignore, we have nothing to focus
// window.silverbullet.addEventListener("focus", async (event) => {});
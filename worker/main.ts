import html from "../dist/viewer.wrapped.ts";
import worker from "../dist/pdf.worker.wrapped.ts"
import { DocumentEditorContent } from "@silverbulletmd/silverbullet/type/client"

const workerURL = "data:application/javascript," + encodeURIComponent(worker)

export function viewer(): DocumentEditorContent {
    return { html: html.replace("{{ SILVERBULLET-PDF-WORKER-JS }}", workerURL) };
}
import type { PDFPageView } from "pdfjs-dist/types/web/pdf_page_view";
import type { Link } from "../silverbullet/query";
import type { TextLayer } from "pdfjs-dist";
import { computeRectsForSelection, type Rect } from "./geometry";
import type { TextContentItem } from "./typings";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { editor } from "@silverbulletmd/silverbullet/syscalls";
import { hoverCard } from "../components/card/hover-card.svelte";


function getBacklinkHighlightLayer(pageView: PDFPageView): HTMLElement {
    const pageDiv = pageView.div;

    const layer = pageDiv.querySelector<HTMLElement>("div.silverbullet-pdf-backlink-highlight-layer");
    if (layer) return layer;

    const newLayer = document.createElement("div");
    newLayer.classList.add("silverbullet-pdf-backlink-highlight-layer");
    pdfjsLib.setLayerDimensions(newLayer, pageView.viewport);
    pageDiv.appendChild(newLayer);

    return newLayer;
}

function placeRectInPage(rect: Rect, page: PDFPageView) {
    const viewBox = page.pdfPage.view;
    const pageX = viewBox[0];
    const pageY = viewBox[1];
    const pageWidth = viewBox[2] - viewBox[0];
    const pageHeight = viewBox[3] - viewBox[1];

    const mirroredRect = pdfjsLib.Util.normalizeRect([rect[0], viewBox[3] - rect[1] + viewBox[1], rect[2], viewBox[3] - rect[3] + viewBox[1]]) as [number, number, number, number];
    const layerElement = getBacklinkHighlightLayer(page);

    const rectElement = document.createElement("div");
    rectElement.classList.add("silverbullet-pdf-backlink");
    layerElement.appendChild(rectElement);
    rectElement.style.left = `${100 * (mirroredRect[0] - pageX) / pageWidth}%`;
    rectElement.style.top = `${100 * (mirroredRect[1] - pageY) / pageHeight}%`;
    rectElement.style.width = `${100 * (mirroredRect[2] - mirroredRect[0]) / pageWidth}%`;
    rectElement.style.height = `${100 * (mirroredRect[3] - mirroredRect[1]) / pageHeight}%`;

    return rectElement;
}

export function visualizeLink(page: PDFPageView, link: Link) {
    const textLayerBuilder = page.textLayer as any;
    if (!textLayerBuilder) return null;
    const textLayer = textLayerBuilder.textLayer as TextLayer;
    if (!textLayer || !textLayer.textDivs) return null;

    if (link.selection) {
        const rects = computeRectsForSelection(textLayer as unknown as { textDivs: HTMLElement[]; textContentItems: TextContentItem[]; }, link.selection);
        if (!rects) return;

        for (const { rect, indices } of rects) {
            const rectEl = placeRectInPage(rect, page);
            rectEl.classList.add("silverbullet-pdf-backlink", "silverbullet-pdf-backlink-selection");

            // font-size is used to set the padding of this highlight in em unit
            const textDiv = textLayer.textDivs[indices[0]];
            rectEl.style.fontSize = textDiv.style.fontSize;

            rectEl.addEventListener("dblclick", async () => {
                await editor.navigate(link.source);
            });

            rectEl.addEventListener("mouseenter", (event) => {
                hoverCard.showIfNotShown(link.sourceSnippet, event.clientX, event.clientY);
            });

            rectEl.addEventListener("mouseleave", () => {
                hoverCard.hide();
            });

        }
    }
}
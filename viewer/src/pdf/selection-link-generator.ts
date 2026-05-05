import { encodeRef, getNameFromPath, type Path } from "@silverbulletmd/silverbullet/lib/ref";
import { LinkGenerator } from "./link-generator";
import { paramsToString, toSingleLine } from "./util";
import type { LinkTemplate } from "./template";

export type TextSelection = {
    beginIndex: number,
    beginOffset: number,
    endIndex: number,
    endOffset: number
};

export function parseTextSelectionStr(string: string): TextSelection | null {
    const parts = string.split(",");
    if (parts.length !== 4) return null;

    const [beginIndex, beginOffset, endIndex, endOffset] = parts.map((x) => +x);
    return { beginIndex, beginOffset, endIndex, endOffset };
}

function getPageElementAssociatedWithNode(node: Node): HTMLElement | null {
    const element = node instanceof HTMLElement ? node : node.parentElement;
    if (!element) return null;

    const pageElement = element.closest(".page");
    if (!pageElement || !(pageElement instanceof HTMLElement)) return null;

    return pageElement;
}

function getPageElementFromSelection(range: Range): HTMLElement | null {
    return getPageElementAssociatedWithNode(range.startContainer);
}

function getTextLayerNode(pageElement: HTMLElement, node: Node) {
    // Thanks to this line, we can detect if the selection spans across pages or not.
    if (!pageElement.contains(node)) return null;

    if (node instanceof HTMLElement && node.classList.contains("textLayerNode")) return node;

    for (let n = node; n !== pageElement && n.parentNode; n = n.parentNode) {
        if (n instanceof HTMLElement && n.classList.contains("textLayerNode")) return n;
    }

    return null;
}

function getOffsetInTextLayerNode(textLayerNode: HTMLElement, node: Node, offsetInNode: number): number | null {
    if (!textLayerNode.contains(node)) return null;

    const iterator = document.createNodeIterator(textLayerNode, NodeFilter.SHOW_TEXT);

    let textNode;
    let offset = offsetInNode;
    while ((textNode = iterator.nextNode()) && node !== textNode) {
        offset += textNode.textContent!.length;
    }

    return offset;
}


function getTextSelectionRange(pageElement: HTMLElement, range: Range): TextSelection | null {
    if (!range || range.collapsed) return null;

    const startTextLayerNode = getTextLayerNode(pageElement, range.startContainer);
    const endTextLayerNode = getTextLayerNode(pageElement, range.endContainer);

    if (!startTextLayerNode || !endTextLayerNode) return null;

    const beginIndex = startTextLayerNode.dataset.idx;
    const endIndex = endTextLayerNode.dataset.idx;
    const beginOffset = getOffsetInTextLayerNode(startTextLayerNode, range.startContainer, range.startOffset);
    const endOffset = getOffsetInTextLayerNode(endTextLayerNode, range.endContainer, range.endOffset);

    // Explicitely check here so we don't accidentally catch zero's
    if ((beginIndex === undefined) || (endIndex === undefined) || (beginOffset == undefined) || (endOffset == undefined)) return null;

    return {
        beginIndex: +beginIndex,
        beginOffset,
        endIndex: +endIndex,
        endOffset
    };
}

function getTextSelectionStr(pageElement: HTMLElement, range: Range): string | null {
    const text = getTextSelectionRange(pageElement, range);
    if (!text) return null;

    const { beginIndex, beginOffset, endIndex, endOffset } = text;
    return `${beginIndex},${beginOffset},${endIndex},${endOffset}`;
}

export function getPageAndTextRangeFromSelection(selection?: Selection): { page: number, selection?: TextSelection } | null {
    selection ??= window.getSelection() ?? undefined;
    if (!selection || !selection.rangeCount) return null;

    const range = selection.getRangeAt(0);

    const pageElement = getPageElementFromSelection(range);
    if (!pageElement || pageElement.dataset.pageNumber === undefined) return null;

    const pageNumber = +pageElement.dataset.pageNumber;

    const selectionRange = getTextSelectionRange(pageElement, range);
    if (selectionRange) {
        return { page: pageNumber, selection: selectionRange };
    } else {
        return { page: pageNumber };
    }
}

export class SelectionLinkGenerator extends LinkGenerator {
    // TODO: Potentially flash notification on failure?
    async copyLink(config: { path: Path, template: LinkTemplate }): Promise<{ msg: string } | void> {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return { msg: "Couldn't get selection"};

        const range = selection.getRangeAt(0);

        const pageElement = getPageElementFromSelection(range);
        if (!pageElement || !pageElement.dataset.pageNumber) return { msg: "Couldn't get page element" };

        const pageNumber = +pageElement.dataset.pageNumber;
        const selectionStr = getTextSelectionStr(pageElement, range);
        if (!selectionStr) return { msg: "Couldn't determine selection boundaries" };

        const text = toSingleLine(selection.toString());

        const subpath = paramsToString({
            "page": pageNumber,
            "selection": selectionStr,
        });

        const ref = encodeRef({ path: config.path, details: { type: "header", header: subpath } });

        const clipboard = await config.template.render({
            path: config.path,
            name: getNameFromPath(config.path),
            page: pageNumber,
            text: text,
            ref: ref,
        });

        await navigator.clipboard.writeText(clipboard);
    }

    // TODO: I don't think we want to do formatting for this one, but I'm unsure
    async copyLinkToPage(config: { path: Path, page: number }): Promise<{ msg: string } | void> {
        const clipboard = `[[${getNameFromPath(config.path)}#page=${config.page}]]`;

        await navigator.clipboard.writeText(clipboard);
    }
}
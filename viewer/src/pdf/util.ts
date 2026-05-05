import { normalizeUnicode } from "pdfjs-dist/legacy/build/pdf.mjs";

type Params = Record<string, number | string>;

export function paramsToString(params: Params): string {
    return Object.entries(params)
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
}

export function toSingleLine(string: string): string {
    const replaced = string.replace(/(.?)([\r\n]+)(.?)/g, (_match, prev, _br, next) => {
        if (prev === '-' && next.match(/[a-zA-Z]/)) return next;
        // Replace the line break with a whitespace if the line break is followed by a non-empty character.
        return next ? prev + ' ' + next : prev;
    });

    return removeNullCharacters(normalizeUnicode(replaced));
}

// Taken from pdfjs, theoretically this is part of pdfjs, but I can't find an export
const InvisibleCharsRegExp = /[\x00-\x1F]/g;
function removeNullCharacters(str: string, replaceInvisible = false): string {
    if (!InvisibleCharsRegExp.test(str)) {
        return str;
    }
    if (replaceInvisible) {
        return str.replaceAll(InvisibleCharsRegExp, m => m === "\x00" ? "" : " ");
    }
    return str.replaceAll("\x00", "");
}

/**
 * Get the position of the offset-th character in the given node.
 * The result is represented by a pair of the node and the offset within the node.
 * @param node The parent node
 * @param offset The offset within the parent node.
 */
export function getNodeAndOffsetOfTextPos(node: Node, offset: number) {
    const iter = document.createNodeIterator(node, NodeFilter.SHOW_TEXT);
    let textNode;
    while ((textNode = iter.nextNode()) && offset >= textNode.textContent!.length) {
        offset -= textNode.textContent!.length;
    }
    return textNode ? { node: textNode as Text, offset } : null;
}
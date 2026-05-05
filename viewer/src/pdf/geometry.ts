import type { TextSelection } from "./selection-link-generator";
import type { TextContentItem } from "./typings";
import { getNodeAndOffsetOfTextPos } from "./util";

// x1, y1, x2, y2
export type Rect = [number, number, number, number];

export type MergedRect = { rect: Rect, indices: number[] };

function mergeRectangles(...rects: Rect[]): Rect {
    const lefts = rects.map((rect) => rect[0]);
    const bottoms = rects.map((rect) => rect[1]);
    const rights = rects.map((rect) => rect[2]);
    const tops = rects.map((rect) => rect[3]);
    return [
        Math.min(...lefts),
        Math.min(...bottoms),
        Math.max(...rights),
        Math.max(...tops),
    ];
}

function areRectanglesMergeable(rect1: Rect, rect2: Rect): boolean {
    return areRectanglesMergeableHorizontally(rect1, rect2)
        || areRectanglesMergeableVertically(rect1, rect2);
}

function areRectanglesMergeableHorizontally(rect1: Rect, rect2: Rect): boolean {
    const [left1, bottom1, right1, top1] = rect1;
    const [left2, bottom2, right2, top2] = rect2;
    const y1 = (bottom1 + top1) / 2;
    const y2 = (bottom2 + top2) / 2;
    const height1 = Math.abs(top1 - bottom1);
    const height2 = Math.abs(top2 - bottom2);
    const threshold = Math.max(height1, height2) * 0.5;
    return Math.abs(y1 - y2) < threshold;
}

function areRectanglesMergeableVertically(rect1: Rect, rect2: Rect): boolean {
    const [left1, bottom1, right1, top1] = rect1;
    const [left2, bottom2, right2, top2] = rect2;
    const width1 = Math.abs(right1 - left1);
    const width2 = Math.abs(right2 - left2);
    const height1 = Math.abs(top1 - bottom1);
    const height2 = Math.abs(top2 - bottom2);
    const threshold = Math.max(width1, width2) * 0.1;
    return Math.abs(left1 - left2) < threshold && Math.abs(right1 - right2) < threshold
        && height1 / width1 > 0.85 && height2 / width2 > 0.85;
}

function computeHighlightRectForItemFromTextLayer(item: TextContentItem, textDiv: HTMLElement, index: number, beginIndex: number, beginOffset: number, endIndex: number, endOffset: number): Rect | null {
    // the bounding box of the whole text content item
    const x1 = item.transform[4];
    const y1 = item.transform[5];
    const x2 = item.transform[4] + item.width;
    const y2 = item.transform[5] + item.height;

    const range = document.createRange();

    if (index === beginIndex) {
        const posFrom = getNodeAndOffsetOfTextPos(textDiv, beginOffset);
        if (posFrom) {
            range.setStart(posFrom.node, posFrom.offset);
        } else {
            range.setStartBefore(textDiv);
        }
    } else {
        range.setStartBefore(textDiv);
    }

    if (index === endIndex) {
        const posTo = getNodeAndOffsetOfTextPos(textDiv, endOffset);
        if (posTo) {
            range.setEnd(posTo.node, posTo.offset);
        } else {
            range.setEndAfter(textDiv);
        }
    } else {
        range.setEndAfter(textDiv);
    }

    const rect = range.getBoundingClientRect();
    const parentRect = textDiv.getBoundingClientRect();

    return [
        x1 + (rect.left - parentRect.left) / parentRect.width * item.width,
        y1 + (rect.bottom - parentRect.bottom) / parentRect.height * item.height,
        x2 - (parentRect.right - rect.right) / parentRect.width * item.width,
        y2 - (parentRect.top - rect.top) / parentRect.height * item.height,
    ];
}

function computeMergedHighlightRects(textLayer: { textDivs: HTMLElement[], textContentItems: TextContentItem[] }, { beginIndex, beginOffset, endIndex, endOffset }: TextSelection): MergedRect[] {
    const { textContentItems, textDivs } = textLayer;

    const results: MergedRect[] = [];

    let mergedRect: Rect | null = null;
    let mergedIndices: number[] = [];

    // If the selection ends at the beginning of a text content item,
    // replace the end point with the end of the previous text content item.
    if (endOffset === 0) {
        endIndex--;
        endOffset = textContentItems[endIndex].str.length;
    }

    for (let index = beginIndex; index <= endIndex; index++) {
        const item = textContentItems[index];
        const textDiv = textDivs[index];

        if (!item.str) continue;

        // the minimum rectangle that contains all the chars of this text content item
        const rect = computeHighlightRectForItemFromTextLayer(item, textDiv, index, beginIndex, beginOffset, endIndex, endOffset);
        if (!rect) continue;

        if (!mergedRect) {
            mergedRect = rect;
            mergedIndices = [index];
        } else {
            const mergeable = areRectanglesMergeable(mergedRect, rect);
            if (mergeable) {
                mergedRect = mergeRectangles(mergedRect, rect);
                mergedIndices.push(index);
            } else {
                results.push({ rect: mergedRect, indices: mergedIndices });

                mergedRect = rect;
                mergedIndices = [index];
            }
        }
    }

    if (mergedRect) results.push({ rect: mergedRect, indices: mergedIndices });

    return results;
}

export function computeRectsForSelection(textLayer: { textDivs: HTMLElement[], textContentItems: TextContentItem[] }, selection: TextSelection): MergedRect[] | null {
    return computeMergedHighlightRects(textLayer, selection);
}
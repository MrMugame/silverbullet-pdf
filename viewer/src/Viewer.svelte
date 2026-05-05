<script lang="ts">
    import { getContext, onMount, tick } from "svelte";
    import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
    import * as pdfjsViewer from "pdfjs-dist/legacy/web/pdf_viewer.mjs";
    import "pdfjs-dist/legacy/web/pdf_viewer.css";
    import Toolbar from "./components/Toolbar.svelte";
    import { contextmenu } from "./components/context/context-menu";
    import Clipboard from "./components/icons/Clipboard.svelte";
    import type { MenuItem } from "./components/context/context-menu.svelte";
    import { getPageAndTextRangeFromSelection, SelectionLinkGenerator } from "./pdf/selection-link-generator";
    import type { Path } from "@silverbulletmd/silverbullet/lib/ref";
    import { DefaultLinkTemplate } from "./pdf/template";
    import { queryLinks } from "./silverbullet/query";
    import type { PDFPageView } from "pdfjs-dist/legacy/web/pdf_viewer.mjs";
    import { visualizeLink } from "./pdf/visualize";
    import { ViewHistory } from "./pdf/history";
    import type { Message } from "../../shared/message";
    import { useWheelScroll } from "./components/util.svelte";
    import { toSingleLine } from "./pdf/util";
    import { editor } from "@silverbulletmd/silverbullet/syscalls";
    import Type from "./components/icons/Type.svelte";

    let { path, data, initalPage }: { path: Path, data: Uint8Array, initalPage: number | null } = $props();

    const eventBus: pdfjsViewer.EventBus = new pdfjsViewer.EventBus();
    const pdfFindController: pdfjsViewer.PDFFindController = new pdfjsViewer.PDFFindController({
        eventBus,
        linkService: new pdfjsViewer.PDFLinkService({ eventBus }),
    });

    let containerNode: HTMLDivElement;
    let pdfViewer: pdfjsViewer.PDFViewer;
    let history: ViewHistory;

    let initalized = $state(false);
    let totalPages = $state<number>(0);
    let scale = $state<number>(100);
    let rotation = $state<number>(0);
    let page = $state<number>(1);

    let linkGenerator = new SelectionLinkGenerator();

    onMount(async () => {
        const linkPromise = queryLinks(path);

        pdfViewer = new pdfjsViewer.PDFViewer({
            container: containerNode,
            eventBus,
            findController: pdfFindController,
        });

        eventBus.on("pagechanging", (event: { pageNumber: number }) => {
            page = event.pageNumber;
        });

        eventBus.on("textlayerrendered", async (data: { source: PDFPageView, pageNumber: number }) => {
            const links = await linkPromise;
            const pending = links.filter((link) => link.page == data.pageNumber);

            for (const link of pending) {
                visualizeLink(data.source, link);
            }
        });

        eventBus.on("updateviewarea", async () => {
            const save = {
                scale: scale,
                rotation: rotation as 0 | 90 | 180 | 270,
                scrollLeft: pdfViewer.container.scrollLeft,
                scrollTop: pdfViewer.container.scrollTop,
            };

            if (history) await history.setSave(save);
        });

        // Load Document
        const loadingTask = pdfjsLib.getDocument(data);
        const pdfDocument = await loadingTask.promise;

        pdfViewer.setDocument(pdfDocument);
        totalPages = pdfDocument.numPages;

        // Load History
        history = await ViewHistory.loadHistory(pdfDocument);

        initalized = true;

        // Apply History
        const saved = history.getSave();
        if (initalPage) {
            pdfViewer.currentPageNumber = Math.min(Math.max(initalPage, 1), totalPages);
        } else if (saved) {
            scale = saved.scale;
            rotation = saved.rotation;

            // Wait till the scale is applied
            await tick();

            pdfViewer.pagesRotation = saved.rotation;
            pdfViewer.container.scrollTop = saved.scrollTop;
            pdfViewer.container.scrollLeft = saved.scrollLeft;
        }
    });

    export function handleMessage(message: Message) {
        switch (message.type) {
            case "zoom-in": {
                zoomIn();
            } break;
            case "zoom-out": {
                zoomOut();
            } break;
            case "zoom-to-fit": {
                zoomToFit(message.fit)
            } break;
        }
    }

    $effect(() => {
        scale = Math.max(Math.min(scale, 500), 10);

        const formatted = (scale / 100).toString();
        if (initalized && formatted !== pdfViewer.currentScaleValue) pdfViewer.currentScaleValue = formatted;
    });

    $effect(() => {
        page = Math.max(Math.min(page, totalPages), 1);

        if (initalized && pdfViewer.currentPageNumber != page) pdfViewer.currentPageNumber = page;
    });

    $effect(() => {
        if (rotation === 360) rotation = 0;
        else if (rotation === -90) rotation = 270;
        else rotation = rotation;

        if (initalized && pdfViewer.pagesRotation != rotation) pdfViewer.pagesRotation = rotation;
    });

    const wheeScroll = useWheelScroll((value) => {
        if (value > 0) {
            zoomIn();
        } else {
            zoomOut();
        }
    });

    function zoomToFit(type: "width" | "height" | "page") {
        // This is a little hacky, but better than implementing this ourselfs
        if (type === "width") {
            pdfViewer.currentScaleValue = "page-width";
        } else if (type === "height") {
            pdfViewer.currentScaleValue = "page-height";
        } else if (type === "page") {
            pdfViewer.currentScaleValue = "fit-page";
        }

        scale = Math.floor(pdfViewer.currentScale * 100);
    }

    function zoomIn() {
        scale = Math.floor((scale + 10) / 10) * 10;
    }

    function zoomOut() {
        scale = Math.ceil((scale - 10) / 10) * 10;
    }

    function rotateCcw() {
        rotation -= 90;
    }

    function rotateCw() {
        rotation += 90;
    }

    function createContextMenu(target: HTMLElement | null): MenuItem[] {
        const windowSelection = window.getSelection();
        const isTextSelected = windowSelection && toSingleLine(windowSelection.toString()) !== "";
        const selection = getPageAndTextRangeFromSelection(windowSelection ?? undefined) ?? { page: page };

        const menu: MenuItem[] = [];

        if (isTextSelected && selection.selection) {
            menu.push({
                type: "action",
                label: "Copy link to selection",
                icon: Clipboard,
                action: async () => {
                    const err = await linkGenerator.copyLink({ path: path, template: new DefaultLinkTemplate() });
                    if (err) editor.flashNotification(`Copying faild: ${err.msg}`, "error");
                },
            });
        }

        if (isTextSelected) {
            menu.push({
                type: "action",
                label: "Copy selected text",
                icon: Type,
                action: async () => {
                    await navigator.clipboard.writeText(windowSelection.toString());
                }
            })
        }

        // Some fallbacks

        if (!menu.length && target) {
            const domPage = target.closest(".page");
            if (domPage instanceof HTMLElement) {
                const number = parseInt(domPage.dataset.pageNumber ?? "");

                menu.push({
                    type: "action",
                    label: "Copy link to page",
                    icon: Clipboard,
                    action: async () => await linkGenerator.copyLinkToPage({ path: path, page: number }),
                });
            }
        }

        // TODO: Some ultimate fallback

        return menu;
    }
</script>

<svelte:window use:wheeScroll></svelte:window>

<Toolbar
    bind:page={page}
    bind:scale={scale}
    bind:rotation={rotation}
    {zoomIn}
    {zoomOut}
    {rotateCw}
    {rotateCcw}
    {totalPages}
></Toolbar>

<div bind:this={containerNode} class="pdf-container" use:contextmenu={createContextMenu}>
    <div class="pdfViewer"></div>
</div>

<style>
    .pdf-container {
        position: absolute;
        width: 100%;
        height: 100vh;
        overflow: auto;
        background-color: var(--root-background-color);
    }
</style>

<script lang="ts">
    import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
    import ContextMenu from "./components/context/ContextMenu.svelte";
    import {
        closeMenu,
        menuState,
    } from "./components/context/context-menu.svelte";
    import Viewer from "./Viewer.svelte";
    import type { Path, Ref } from "@silverbulletmd/silverbullet/lib/ref";
    import { parseLinkFromPathAndDetails } from "./silverbullet/query";
    import { hoverCard } from "./components/card/hover-card.svelte";
    import HoverCard from "./components/card/HoverCard.svelte";
    import { onMount } from "svelte";

    // This is later replaced by the worker, this reduces bundle size
    // troumendously as it would also need to be bundled for the worker.
    pdfjsLib.GlobalWorkerOptions.workerSrc = "{{ SILVERBULLET-PDF-WORKER-JS }}";

    let data = $state<{ data: Uint8Array, path: Path, initalPage: number | null } | null>(null);

    let viewer = $state<ReturnType<typeof Viewer>>();

    onMount(() => {
        window.silverbullet.addEventListener("file-open", async (event) => {
            const path = event.detail.meta.ref as Path;

            let initalPage: null | number = null;

            if (event.detail.details?.type === "header") {
                const link = parseLinkFromPathAndDetails(path, "", event.detail.details as Ref["details"]);
                if (link) initalPage = link.page;
            } else if (event.detail.details?.type === "position") {
                // This is for legacy support
                initalPage = event.detail.details.pos;
            }

            hoverCard.reset();

            data = {
                data: event.detail.data,
                path,
                initalPage,
            };
        });

        window.silverbullet.addEventListener("focus", () => {
            window.focus();
        });

        window.silverbullet.addEventListener("custom", (event) => {
            if (viewer) viewer.handleMessage(event.detail);
        });

        // Don't removeEventListeners, we just don't care
    })
</script>

{#key data}
    {#if data}
        <Viewer bind:this={viewer} path={data.path} data={data.data} initalPage={data.initalPage}/>
    {/if}
{/key}

{#if menuState.visible}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="menu-backdrop"
        // Needed so we don't deselect the selection
        onmousedown={(e) => { e.preventDefault(); e.stopPropagation() }}
        onclick={closeMenu}
        onkeydown={(e) => e.key == "Escape" && closeMenu()}
        oncontextmenu={(e) => {
            e.preventDefault();
            closeMenu();
        }}
    ></div>

    <ContextMenu items={menuState.items} x={menuState.x} y={menuState.y} />
{/if}

{#if hoverCard.value.visible}
    <HoverCard snippet={hoverCard.value.snippet} x={hoverCard.value.x} y={hoverCard.value.y}></HoverCard>
{/if}

<style>
    .menu-backdrop {
        position: fixed;
        inset: 0;
        z-index: 99;
    }
</style>

<script lang="ts">
    import { markdown } from "@silverbulletmd/silverbullet/syscalls";
    import { ctrlKey } from "../util.svelte";

    let { snippet, x, y }: { snippet: string; x: number; y: number } = $props();

    let show = $state(ctrlKey.isPressed);

    const htmlPromise = $derived(markdown.markdownToHtml(snippet));

    $effect(() => {
        if (ctrlKey.isPressed) show = true;
    })
</script>


{#if show}
    {#await htmlPromise then html}
        <div class="popup" style="left: {x}px; top: {y}px">
            {@html html}
        </div>
    {/await}
{/if}

<style>
    .popup {
        position: absolute;
        transform: translate(0, -100%);
        max-width: 400px;
        z-index: 999;
        padding: 6px;
        margin: 0;
        background-color: var(--modal-background-color);
        border: var(--editor-widget-background-color) 1px solid;
        color: var(--modal-color);
        white-space: normal;
        border-radius: 12px;
    }

    .popup :global(p strong) {
        display: block;
        padding: 10px 12px;
        background-color: var(--editor-widget-background-color);
        border: 1px solid var(--editor-widget-background-color);
        border-radius: 8px 8px 0 0;
        font-weight: 600;
    }

    .popup :global(blockquote) {
        margin: 0 5px;
        padding: 12px;
        border: 1px solid var(--editor-widget-background-color);
        border-radius: 8px;
        background-color: var(--editor-widget-background-color);
        color: var(--editor-text-color);
        border-top: 1px solid var(--editor-widget-background-color);
    }

    .popup :global(h1) {
        margin: -10px -10px 10px -10px !important;
        padding: 15px 10px !important;
        background-color: var(--editor-widget-background-color);
        font-size: 1.2em;
    }

    .popup :global(h1) {
        margin: 0 0 5px 0;
        padding: 10px !important;
        background-color: var(--editor-widget-background-color);
        font-size: 1.2em;
    }
</style>

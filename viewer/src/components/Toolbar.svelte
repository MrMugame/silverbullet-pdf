<script lang="ts">
    import RotateClockwise from "./icons/RotateClockwise.svelte";
    import RotateCounterClockwise from "./icons/RotateCounterClockwise.svelte";
    import ZoomOut from "./icons/ZoomOut.svelte";
    import ZoomIn from "./icons/ZoomIn.svelte";

    let {
        page = $bindable(),
        scale = $bindable(),
        rotation = $bindable(),

        rotateCw,
        rotateCcw,
        zoomIn,
        zoomOut,

        totalPages
    }: {
        page: number,
        scale: number,
        rotation: number,

        rotateCw: () => void,
        rotateCcw: () => void,
        zoomIn: () => void,
        zoomOut: () => void,

        totalPages: number
    } = $props();

</script>

<header class="toolbar">
    <button class="toolbar-button" onclick={zoomOut} title="Zoom out">
        <ZoomOut></ZoomOut>
    </button>
    <input class="toolbar-input" type="number" value={scale} onchange={(e) => scale = Math.floor(+e.currentTarget.value)}/>
    <span class="toolbar-text">%</span>
    <button class="toolbar-button" onclick={zoomIn} title="Zoom in">
        <ZoomIn></ZoomIn>
    </button>
    <span class="toolbar-space-bar"></span>
    <button class="toolbar-button" onclick={rotateCcw} title="Rotate counterclockwise">
        <RotateCounterClockwise></RotateCounterClockwise>
    </button>
    <button class="toolbar-button" onclick={rotateCw} title="Rotate clockwise">
        <RotateClockwise></RotateClockwise>
    </button>
    <span class="toolbar-space-bar"></span>
    <span class="toolbar-spacer"></span>
    <input class="toolbar-input" type="number" value={page} onchange={(e) => page = Math.floor(+e.currentTarget.value)} min={1} max={totalPages}>
    <span class="toolbar-text">of {totalPages}</span>
    <span class="toolbar-spacer"></span>
</header>

<style>
    .toolbar {
        background-color: var(--top-background-color);
        border: var(--top-border-color) 1px solid;
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 0.5rem;
        gap: 0.3rem;

        position: absolute;
        z-index: 99;
        top: 0.5rem;
        left: 50%;
        transform: translate(-50%, 0);
        border-radius: 0.5rem;
    }

    .toolbar-button {
        border: none;
        background-color: var(--action-button-background-color);
        color: var(--action-button-color);

        /* margin-left: 0.3rem;
        margin-right: 0.3rem; */
        padding: 0.25rem;
        width: 1.75rem;
        height: 1.75rem;
    }

    .toolbar-button:hover {
        color: var(--action-button-hover-color);
    }

    .toolbar-text {
        color: var(--action-button-color);
        user-select: none;
        font-size: 0.9rem;
    }

    .toolbar-input {
        height: 1.25rem;
        padding: 0.25rem 0.5rem;
        width: 2.5rem;
        border: var(--button-border-color) 1px solid;
        border-radius: 0.5rem;
        background-color: var(--button-background-color);
        color: var(--button-color);
        text-align: right;
        filter: brightness(65%);
    }

    .toolbar-space-bar {
        width: 1px;
        height: 1.5rem;
        background-color: var(--button-border-color);
        margin: 0 0.25rem;
    }
</style>
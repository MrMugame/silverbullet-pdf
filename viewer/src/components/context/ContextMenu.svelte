<script lang="ts">
    import { closeMenu, type MenuItem } from "./context-menu.svelte";
    import ContextMenu from "./ContextMenu.svelte";

    let { items, x, y }: { items: MenuItem[]; x: number; y: number } = $props();

    let activeSubmenuIndex = $state<number | null>(null);
    let menuNode = $state<HTMLElement>();

    // TODO: Fix this
    // Flip menu if it would overflow viewport
    let adjustedX = $derived(x);
    let adjustedY = $derived(y);
    // let adjustedX = $derived(x + 220 > window.innerWidth ? x - 220 : x);
    // let adjustedY = $derived(
    //     y + items.length * 36 > window.innerHeight
    //         ? window.innerHeight - items.length * 36 - 8
    //         : y,
    // );

    function handleAction(item: MenuItem) {
        if (item.type != "action" || !item.action || item.disabled) return;

        item.action();
        closeMenu();
    }
</script>

<menu
    bind:this={menuNode}
    // Needed so we don't deselect the selection
    onmousedown={(e) => { e.preventDefault(); e.stopPropagation() }}
    style="left: {adjustedX}px; top: {adjustedY}px"
    role="menu"
    class="menu"
>
    {#each items as item, i}
        {#if item.type === "separator"}
            <hr />
        {:else if item.type === "action"}
            <li
                class:disabled={item.disabled}
                class:submenu-is-open={activeSubmenuIndex === i}
                role="menuitem"
                tabindex={item.disabled ? -1 : 0}
                onmouseenter={() => (activeSubmenuIndex = i)}
                onclick={() => handleAction(item)}
                onkeydown={(e) => e.key === "Enter" && handleAction(item)}
            >
                {#if item.icon}<span class="icon"><item.icon /></span>{/if}
                <span class="label">{item.label}</span>
                {#if item.shortcut}<span class="shortcut">{item.shortcut}</span
                    >{/if}
                {#if item.children}<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="arrow"><polyline points="9 18 15 12 9 6"></polyline></svg>{/if}

                <!-- Recursive submenu -->
                {#if item.children && activeSubmenuIndex === i}
                    <div class="menu-wrapper">
                        <ContextMenu items={item.children} x={0} y={0} />
                    </div>
                {/if}
            </li>
        {/if}
    {/each}
</menu>

<style>
    .menu {
        position: absolute;
        z-index: 999;
        padding: 6px;
        margin: 0;
        background-color: var(--modal-background-color);
        border: var(--modal-border-color) 1px solid;
        color: var(--modal-color);
        border-radius: 12px;
    }

    .menu hr {
        border: none;
        height: 1px;
        background-color: var(--modal-border-color);
    }

    .menu span {
        user-select: none;
    }

    .menu li {
        height: 20px;
        position: relative;
        display: flex;
        align-items: center;
        padding: 4px 8px;
        max-width: 200px;
    }

    .menu li.disabled {
        color: var(--modal-description-color)
    }

    .menu li:not(.disabled):hover, .menu li:not(.disabled).submenu-is-open {
        background-color: var(--modal-selected-option-background-color);
        color: var(--modal-selected-option-color);
        border-radius: 6px;
    }

    .menu li .icon {
        width: 18px;
        height: 18px;
        margin-right: 8px;
    }

    .menu li .arrow {
        color: var(--modal-color);
        width: 16px;
        height: 16px;
        margin-left: 5px;
    }

    .menu li .shortcut {
        color: var(--modal-description-color);
    }

    .menu li .label {
        flex-grow: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-right: 10px;
    }

    .menu-wrapper {
        position: absolute;
        left: 100%;
        top: 0;
    }
</style>

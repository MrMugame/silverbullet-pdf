import { openMenu, type MenuItem } from "./context-menu.svelte";

export function contextmenu(node: HTMLElement, items: (target: HTMLElement | null) => MenuItem[]) {
    function handler(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        openMenu(e.clientX, e.clientY, items(e.target instanceof HTMLElement ? e.target : null));
    }

    node.addEventListener("contextmenu", handler);

    return {
        destroy() { node.removeEventListener("contextmenu", handler) },
    }
}
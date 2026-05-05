import type { Component } from "svelte"

// TODO: Rewrite this into a class

export type MenuItem = {
    type: "action",
    label: string,
    icon?: Component,
    shortcut?: string,
    children?: MenuItem[],
    disabled?: boolean,
    action?: () => void
} | {
    type: "separator"
}

type MenuState = {
    visible: boolean,
    x: number,
    y: number,
    items: MenuItem[]
}

export const menuState = $state<MenuState>({
    visible: false,
    x: 0,
    y: 0,
    items: []
})

export function openMenu(x: number, y: number, items: MenuItem[]) {
    menuState.visible = true;
    menuState.x = x;
    menuState.y = y;
    menuState.items = items;
}

export function closeMenu() {
    menuState.visible = false;
}
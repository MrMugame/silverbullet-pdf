import "./main.css";
import { mount } from "svelte";
import Main from "./Main.svelte";

// Patch this so the silverbullet package works.
globalThis.syscall = window.silverbullet.syscall;

const main = mount(Main, {
    target: document.getElementById("app")!,
});

export default main;
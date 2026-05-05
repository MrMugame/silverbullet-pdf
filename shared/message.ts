export type Message = {
    type: "zoom-in"
} | {
    type: "zoom-out"
} | {
    type: "zoom-to-fit",
    fit: "width" | "height" | "page"
};
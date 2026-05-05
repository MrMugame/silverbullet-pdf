class CtrlKey {
    private state = $state(false);

    constructor() {
        // We can't catch events which are handled for commands by silverbullet
        // as we never get them, so these bugs will always persist probably.
        window.addEventListener("keydown", (e) => {
            if (e.key == "Control") this.state = true;
        });
        window.addEventListener("keyup", (e) => {
            if (e.key == "Control") this.state = false;
        });
    }

    get isPressed() {
        return this.state;
    }
}

export const ctrlKey = new CtrlKey();

const PIXEL_THRESHOLD = 30;

export function useWheelScroll(onChange: (steps: number) => void) {
    let pixelAccumulator = 0;

    function onWheel(event: WheelEvent) {
        if (!event.ctrlKey) return;

        event.preventDefault();

        if (event.deltaMode == WheelEvent.DOM_DELTA_LINE || event.deltaMode == WheelEvent.DOM_DELTA_PAGE) {
            onChange(-Math.sign(event.deltaY));

        } else {
            // Reset if direction changes
            if ((pixelAccumulator > 0 && event.deltaY < 0) || (pixelAccumulator < 0 && event.deltaY > 0)) {
                pixelAccumulator = 0;
            }

            pixelAccumulator += event.deltaY / PIXEL_THRESHOLD;

            const ticks = Math.trunc(pixelAccumulator);
            pixelAccumulator -= ticks;

            if (ticks > 0) onChange(-ticks);
        }
    }

    function wheelScroll(node: HTMLElement) {
        node.addEventListener("wheel", onWheel, { passive: false });
        return {
            destroy() {
                node.removeEventListener("wheel", onWheel);
            },
        };
    }

    return wheelScroll;
}

type HoverCardState = {
    visible: false,
} | {
    visible: true,
    snippet: string,
    x: number,
    y: number
};

class HoverCard {
    #state = $state<HoverCardState>({ visible: false });

    get value() { return this.#state; }

    showIfNotShown(snippet: string, x: number, y: number) {
        if (this.#state.visible) return;

        this.#state = { visible: true, snippet, x, y };
    }

    hide() {
        this.#state = { visible: false };
    }

    reset() {
        this.hide();
    }
}

export const hoverCard = new HoverCard();
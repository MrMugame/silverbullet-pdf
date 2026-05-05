import type { PDFDocumentProxy } from "pdfjs-dist";
import { clientStore } from "@silverbulletmd/silverbullet/syscalls"

export type Save = {
    scrollTop: number,
    scrollLeft: number,
    scale: number,
    rotation: 0 | 90 | 180 | 270;
}

type Snapshot = {
    fingerprint: string,
} & Save;

type History = {
    history: Snapshot[]
};

const STORE_KEY = "silverbullet-pdf-history";

export class ViewHistory {
    private constructor(private fingerpint: string, private history: History, private snapshot: Snapshot | null) {}

    private static defaultHistory(): History {
        return { history: [] };
    }

    static async loadHistory(pdfDocument: PDFDocumentProxy): Promise<ViewHistory> {
        const fingerprint = pdfDocument.fingerprints[0]!;

        const history = await clientStore.get(STORE_KEY) as History | undefined;
        if (!history) return new ViewHistory(fingerprint, ViewHistory.defaultHistory(), null);

        const snapshot = history.history.find(s => s.fingerprint === fingerprint);
        if (!snapshot) return new ViewHistory(fingerprint, history, null);

        return new ViewHistory(fingerprint, history, snapshot);
    }

    async storeHistory() {
        await clientStore.set(STORE_KEY, this.history);
    }

    async setSave(save: Save) {
        if (this.snapshot) {
            this.snapshot = Object.assign(this.snapshot, save);
        } else {
            this.snapshot = { fingerprint: this.fingerpint, ...save };
            this.history.history.push(this.snapshot);
        }

        await this.storeHistory();
    }

    getSave(): Save | null {
        // Be sure to not return a reference here
        if (!this.snapshot) return null;
        return { ...this.snapshot };
    }
}
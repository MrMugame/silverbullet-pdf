import type { Ref } from "@silverbulletmd/silverbullet/lib/ref";
import type { DocumentMeta } from "@silverbulletmd/silverbullet/type/index";
import type { Message } from "../shared/message"

export type DocumentEditorEvent =
    | { type: "file-open", detail: { data: Uint8Array, meta: DocumentMeta, details: Ref["details"] } }
    | { type: "request-save", detail: undefined }
    | { type: "focus", detail: undefined }
    // This is custom and emitted from the worker
    | { type: "custom", detail: Message };

declare interface SilverbulletEventTarget extends EventTarget {
    addEventListener<
        T extends DocumentEditorEvent["type"],
        E extends DocumentEditorEvent & { type: T }
    >(type: T, callback: (e: Event & E) => void): void;

    addEventListener(
        type: string,
        callback: EventListenerOrEventListenerObject | null,
        options?: EventListenerOptions | boolean
    ): void;

    removeEventListener(type: DocumentEditorEvent["type"]): void;

    syscall(name: string, ...args: any): Promise<any>;
}

declare global {
    function syscall(name: string, ...args: any): Promise<any>;

    interface Window {
        silverbullet: SilverbulletEventTarget;
    }
}
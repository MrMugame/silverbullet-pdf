export {};

declare global {
    // deno-lint-ignore no-explicit-any, no-var
    var silverbullet: DocumentFragment & { sendMessage : (type: string, data: Record<string, any>) => void };
}
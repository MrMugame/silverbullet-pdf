declare module '*.css';

declare module globalThis {
    var silverbullet: DocumentFragment & { sendMessage : (type: string, data: Record<string, any>) => void };
}
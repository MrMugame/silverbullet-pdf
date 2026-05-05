import type { Path } from "@silverbulletmd/silverbullet/lib/ref";

export abstract class LinkTemplate {
    abstract render(variables: { path: Path, name: string, page: number, text: string } & Record<string, string | number>): Promise<string>;
}

export class DefaultLinkTemplate {
    async render({ ref }: { path: Path, name: string, page: number, text: string, ref: string } & Record<string, string | number>): Promise<string> {
        return `[[${ref}]]`
        // return `> **note** [[${ref}|p.${page}]]\n> ${text}`;
    }
}
import type { Path } from "@silverbulletmd/silverbullet/lib/ref";

export abstract class LinkGenerator {
    abstract copyLink(config: { path: Path }): void;
}


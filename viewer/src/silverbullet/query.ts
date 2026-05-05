import { parseToRef, type Path, type Ref } from "@silverbulletmd/silverbullet/lib/ref";
import { lua, index } from "@silverbulletmd/silverbullet/syscalls"
import { parseTextSelectionStr, type TextSelection } from "../pdf/selection-link-generator";

export type Link = {
    source: string,
    sourceSnippet: string,
    page: number,
    selection?: TextSelection;
}

export function parseLinkFromPathAndDetails(source: string, snippet: string, details: Ref["details"]): Link | null {
    if (details?.type !== "header") return null;

    const params = new URLSearchParams(details.header);

    const page = params.get("page");
    if (!page) return null;

    const link: Link = { page: +page, source, sourceSnippet: snippet };

    const selection = params.get("selection");
    if (selection) {
        const parsed = parseTextSelectionStr(selection);
        if (parsed) {
            link.selection = parsed;
        }
    }

    return link;
}

function parseLink(source: string, snippet: string, stringRef: string): Link | null {
    const ref = parseToRef(stringRef);
    if (!ref) return null;

    return parseLinkFromPathAndDetails(source, snippet, ref.details);
}

export async function queryLinks(path: Path): Promise<Link[]> {
    let links = await index.queryLuaObjects(
        "link",
        { objectVariable: "_", where: await lua.parseExpression("_.toFile == __page_path") },
        { "__page_path": path }
    ) as { ref: string, snippet: string, destination: string }[];

    return links.map((link) => parseLink(link.ref, link.snippet, link.destination)).filter((x) => !!x);
}
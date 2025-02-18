import script from "../dist/viewer.js.ts"
import html from "../dist/viewer.html.ts"

// deno-lint-ignore require-await
export async function viewer(): Promise<{ html: string, script: string }> {
    return {
        html: html,
        script: script
    }
}
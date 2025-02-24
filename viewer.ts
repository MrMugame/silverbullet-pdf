import script from "./dist/viewer.iife.js.ts"
import html from "./dist/viewer.html.ts"

export async function viewer(): Promise<{ html: string, script: string }> {
    return {
        html: html,
        script: script
    }
}
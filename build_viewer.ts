import { fileURLToPath } from "node:url";
import { parseArgs } from "@std/cli/parse-args";
import { denoPlugins } from "@luca/esbuild-deno-loader";
import * as esbuild from "esbuild";

const DIST = "dist";
const SRC = "src";
const HTML = "viewer";
const TS = "viewer";
const CSS = "viewer";

async function buildTSFile(dir: string, input: string, output: string) {
  const result = await esbuild.build({
    entryPoints: [
      {
        in: `${input}.ts`,
        out: output,
      },
    ],
    outdir: dir,
    absWorkingDir: Deno.cwd(),
    bundle: true,
    treeShaking: true,
    // sourcemap: "linked",
    metafile: true,
    minify: true,
    plugins: denoPlugins({
      configPath: fileURLToPath(new URL("./deno.json", import.meta.url)),
    }),
  });

  if (result.metafile) {
      console.log("Bundle info", await esbuild.analyzeMetafile(result.metafile));
  }
}

async function buildCSSFile(dir: string, input: string, output: string) {
  await esbuild.build({
    entryPoints: [
      {
        in: `${input}.css`,
        out: output,
      },
    ],
    outdir: dir,
    absWorkingDir: Deno.cwd(),
    bundle: true,
    minify: true,
    plugins: []
  });
}

async function wrapFile(path: string) {
  const content = await Deno.readTextFile(path);

  const text = `export default \`${content.replaceAll("\\", "\\\\").replaceAll("$", "\\$").replaceAll("\`", "\\\`")}\``;

  await Deno.writeTextFile(`${path}.ts`, text);
}

async function build(debug: boolean): Promise<void> {
  await Deno.mkdir(DIST, { recursive: true });

  console.log("Now ESBuilding the pdfviewer plug...");

  // Build JS File
  await buildTSFile(DIST, `${SRC}/${TS}`, TS);
  await buildCSSFile(DIST, `${SRC}/${CSS}`, CSS);
  esbuild.stop();

  // Build HTML file (Probably not really necessary)
  const css = await Deno.readTextFile(`${DIST}/${CSS}.css`);
  const html = await Deno.readTextFile(`${SRC}/${HTML}.html`);
  const content = `<style>${css.replaceAll("\n", "")}</style>\n${html}`
  await Deno.writeTextFile(`${DIST}/${HTML}.html`, content);

  // Export files as strings from Typescript
  await wrapFile(`${DIST}/${TS}.js`);
  await wrapFile(`${DIST}/${HTML}.html`);

  // Build actual main file (We're using the same deno.json for the build script and the plug but this should be fine)
  const cmd = new Deno.Command("silverbullet", { args: ["plug:compile", "--info", "-c", "deno.json"].concat(debug ? ["--debug"] : []).concat(["pdfviewer.plug.yaml"]) });
  const { stdout, stderr } = await cmd.output();
  console.log(new TextDecoder().decode(stdout));
  console.log(new TextDecoder().decode(stderr));
}

if (import.meta.main) {
  const args = parseArgs(Deno.args, {
    boolean: ["debug"],
    alias: { d: "debug" },
    default: {
      debug: false,
    },
  });

  await build(args.debug);
}

#!/bin/bash

set -e

# Functions

wrap_file() {
  local path="$1"
  local out="$2"

  # Read the file content and JSON-encode it with jq -R
  local content
  content=$(deno eval "console.log(JSON.stringify(await Deno.readTextFile('$path')))")

  # Write to the output .ts file
  echo "export default $content" > "${out}.ts"
}

# Global args

root=$(pwd)
build_dir="$root/dist"
pdfjs_dir="$root/pdfjs"

# Parse args

skip_pdfjs=false
skip_check=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-pdfjs)
            skip_pdfjs=true
            shift
            ;;
        --skip-checks)
            skip_check=true
            shift
            ;;
        *)
            echo "Invalid arg: $1"
            exit 1
            ;;
    esac
done

# Start with building pdf.js

if [ $skip_pdfjs == false ]; then
    cd $pdfjs_dir

    echo "Building generic viewer"
    npx gulp generic

    echo "Building minified libraries"
    npx gulp minified

    cd $root
fi

# Copy all the important stuff from the pdf.js build

rm -rf $build_dir

mkdir -p $build_dir
mkdir -p "$build_dir/web"

cp -r "$pdfjs_dir/build/generic/build" "$build_dir/"
cp -r "$pdfjs_dir/build/generic/web/images" "$build_dir/web/images"
cp "$pdfjs_dir/build/generic/web/viewer.html" "$build_dir/web/"
cp "$pdfjs_dir/build/generic/web/viewer.mjs" "$build_dir/web/"
cp "$pdfjs_dir/build/generic/web/viewer.css" "$build_dir/web/"
# Don't copy locale data so it fallbacks to english. locale is a whole mess I don't want to touch

wrap_file "$pdfjs_dir/build/minified/build/pdf.worker.min.mjs" "$build_dir/pdf.worker.wrapped"
cp "$pdfjs_dir/build/minified/build/pdf.min.mjs" "$build_dir/pdf.min.mjs"


# Build the actual client viewer

npx vite build
wrap_file "$root/dist/viewer/dist/web/viewer.html" "$build_dir/viewer.wrapped"

# Build the version file

$root/scripts/update_version.sh

# Check the deno code

deno check -c deno.json

# Build the worker

deno run -A https://github.com/silverbulletmd/silverbullet/releases/download/edge/plug-compile.js --info -c deno.json silverbullet-pdf.plug.yaml
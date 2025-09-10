#!/bin/bash

set -e

pdfjs_version="v5.4.149"
pdfjs_dir="pdfjs"
root=$(pwd)

rm -rf $pdfjs_dir

echo "Downloading pdf.js ..."

git clone -c advice.detachedHead=false --branch $pdfjs_version https://github.com/mozilla/pdf.js $pdfjs_dir

(cd $pdfjs_dir; git apply "$root/pdfjs.patch")

echo "Done!"
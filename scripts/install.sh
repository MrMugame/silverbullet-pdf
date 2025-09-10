#!/bin/bash

set -e

echo "Running \`npm install\` for parent repository"

npm i

echo "Running \`npm install\` for pdf.js"

cd pdfjs && npm i
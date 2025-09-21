#!/bin/bash
version=$(git describe --tags --exact-match HEAD 2>/dev/null || git rev-parse --short HEAD)

echo "Building the version file with version: $version"

echo "export const version = \"$version\";" > ./dist/version.ts
#!/bin/bash
# Generates a TypeScript SDK from the OpenAPI spec.
# Requires: npx (comes with npm) — no global install needed.
#
# Usage: npm run generate-sdk
# Output: ./sdk/ directory with TypeScript client

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SPEC_FILE="$PROJECT_ROOT/openapi.json"
SDK_OUTPUT="$PROJECT_ROOT/sdk"

echo "==> Generating OpenAPI spec..."
npx ts-node "$PROJECT_ROOT/scripts/generate-openapi.ts"

if [ ! -f "$SPEC_FILE" ]; then
  echo "ERROR: openapi.json not found at $SPEC_FILE"
  exit 1
fi

echo "==> Generating TypeScript SDK..."
npx @openapitools/openapi-generator-cli generate \
  -i "$SPEC_FILE" \
  -g typescript-fetch \
  -o "$SDK_OUTPUT" \
  --additional-properties=supportsES6=true,npmName=@fakestore/sdk,npmVersion=1.0.0,typescriptThreePlus=true

echo "==> SDK generated at $SDK_OUTPUT"
echo ""
echo "To use:"
echo "  cd sdk && npm install && npm run build"
echo "  # Then import { ProductsApi, Configuration } from '@fakestore/sdk'"

#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "==> Updating 4chan-API submodule..."
git submodule update --init --remote --merge 4chan-API

echo "==> Submodule updated successfully."
git status --short 4chan-API

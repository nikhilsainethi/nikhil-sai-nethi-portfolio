#!/usr/bin/env bash
# Rebuild public/models/world.glb from tools/blender/build_world.py.
# Needs Blender 4.2+ and network access for npx (set BLENDER to its binary if it is not in the default macOS location).
set -euo pipefail
cd "$(dirname "$0")/../.."
BLENDER="${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}"
RAW="$(mktemp -d)/world.raw.glb"
"$BLENDER" -b --factory-startup --python tools/blender/build_world.py -- \
  --out "$RAW" --samples "${SAMPLES:-192}" ${PREVIEW_DIR:+--preview-dir "$PREVIEW_DIR"} ${PREVIEWS:+--previews "$PREVIEWS"}
# The compressor is fetched on demand at a pinned version rather than installed
# with the project: only this script needs it, and it pulls in ~380 packages.
npx --yes @gltf-transform/cli@4.5.1 meshopt "$RAW" public/models/world.glb
ls -l public/models/world.glb

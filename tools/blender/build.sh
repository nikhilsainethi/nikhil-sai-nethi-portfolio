#!/usr/bin/env bash
# Rebuild public/models/datacentre.glb from tools/blender/build_datacentre.py.
# Needs Blender 4.2+ (set BLENDER to its binary if it is not in the default macOS location).
set -euo pipefail
cd "$(dirname "$0")/../.."
BLENDER="${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}"
RAW="$(mktemp -d)/datacentre.raw.glb"
"$BLENDER" -b --factory-startup --python tools/blender/build_datacentre.py -- \
  --out "$RAW" --samples "${SAMPLES:-192}" ${PREVIEW:+--preview "$PREVIEW"}
npx gltf-transform meshopt "$RAW" public/models/datacentre.glb
ls -l public/models/datacentre.glb

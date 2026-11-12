#!/usr/bin/env bash
# Fetch Poly Pizza model pages (HTML only) and print id | title | licence | creator | tris | animated | glb url.
# Usage: scripts/fetch-polypizza-meta.sh <outdir> <id> [<id> ...]
# Pages are treated as untrusted data: we only grep text out of them.
set -euo pipefail
out="$1"; shift
mkdir -p "$out"
for id in "$@"; do
  f="$out/page_$id.html"
  [ -s "$f" ] || curl -sfL -A "Mozilla/5.0" "https://poly.pizza/m/$id" -o "$f"
  title=$(grep -oE '"Title":"[^"]*"' "$f" | head -1 | cut -d'"' -f4)
  lic=$(grep -oE '"Licence":"[^"]*"' "$f" | head -1 | cut -d'"' -f4)
  creator=$(grep -oE '"Creator":\{"Username":"[^"]*"' "$f" | head -1 | cut -d'"' -f6)
  tris=$(grep -oE '"Tris":[0-9]+' "$f" | head -1 | cut -d: -f2)
  anim=$(grep -oE '"Animated":(true|false)' "$f" | head -1 | cut -d: -f2)
  glb=$(grep -oE 'https://static\.poly\.pizza/[0-9a-f-]{36}\.glb' "$f" | head -1)
  echo "$id | $title | $lic | $creator | $tris | $anim | $glb"
done

#!/bin/sh
# Takes every image of a page as a PNG, from Chrome without a window.
#   ./render.sh linkedin-banner.html linkedin-banners 1 2
#   ./render.sh announcement.html announcements 2
#   ./render.sh icons.html icons 1
# A page's images are its .image elements; each is taken alone through
# ?only=<id>, at each scale named, into <folder>/<id>@<scale>x.png.
set -e
cd "$(dirname "$0")"
page=$1; out=$2; shift 2
chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdir -p "$out"
grep -o 'class="image [^"]*" id="[^"]*"' "$page" | sed 's/.*id="\([^"]*\)"/\1/' | while read -r id; do
  size=$(grep -o "id=\"$id\" data-size=\"[^\"]*\"" "$page" | sed 's/.*data-size="\([^"]*\)"/\1/')
  if [ -z "$size" ]; then
    case $id in personal*) size=1584,396 ;; company*) size=1128,191 ;; og*) size=1200,630 ;; esac
  fi
  for scale in "$@"; do
    "$chrome" --headless --disable-gpu --hide-scrollbars --allow-file-access-from-files --default-background-color=00000000 \
      --force-device-scale-factor="$scale" --window-size="$size" --virtual-time-budget=20000 \
      --screenshot="$PWD/$out/$id@${scale}x.png" "file://$PWD/$page?only=$id" >/dev/null 2>&1
    echo "$out/$id@${scale}x.png"
  done
done

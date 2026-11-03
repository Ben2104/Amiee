#!/usr/bin/env sh
# Builds index.html (a normal standalone web page) from our-little-world.html
# (the Claude artifact source, which has no <html>/<head> wrapper of its own).
cd "$(dirname "$0")"
{
  printf '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
  printf '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
  printf '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style>\n'
  printf '</head>\n<body>\n'
  cat our-little-world.html
  printf '\n</body>\n</html>\n'
} > index.html
echo "Wrote $(pwd)/index.html"

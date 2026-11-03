# Our Little World

An interactive 3D anniversary gift: a sealed envelope opens onto a floating
sunset island. Tap the photo line, flower garden, mailbox, bench, and floating
heart to read the story, love notes, letter, future adventures, and the
anniversary finale.

- `our-little-world.html` is the source. It is a Claude artifact page, so it
  has no `<html>`/`<head>` wrapper of its own.
- `index.html` is the same page as a normal standalone web page, for hosting
  anywhere (for example GitHub Pages). Run `./make-standalone.sh` after you
  edit the source to rebuild it.

## Personalising

Everything personal is in the `GIFT` object near the top of the `<script>`
in `our-little-world.html`: names, start date, colours, song, memories,
love notes, letter, adventure ideas, and interface wording.

Set `showExampleBadges: false` once the sample content has been replaced.

Photos: use a `data:` URI (it travels inside the file) or a relative file name
published next to the page. Claude artifacts block images from other websites.

---
name: verify-ui
description: Use when verifying an Amiee front-end change in a real browser and collecting PR screenshots and recordings.
---

# Verify UI

Start the server for the page being changed. For `our-little-world`, regenerate with `sh our-little-world/make-standalone.sh`, then serve that directory with `python3 -m http.server --bind 127.0.0.1 --directory <absolute-directory> 8765`. The Next.js app uses `npm run dev` instead.

Run `chrome-devtools-axi --help` and `chrome-devtools-axi run --help`. Prefer this browser tool; open the running page, inspect a fresh snapshot, and exercise the changed controls at desktop and phone sizes. Check the console, visual results, and persistence after reload. For seasonal trees, switch through all four seasons, inspect the crown and trunk, and check automatic season selection, Christmas dressing, and the no-WebGL fallback.

When login verification is required, load only `SMOKED_USER` and `SMOKED_PASSWORD` from the gitignored `/Users/kaydee/Developer/firstmate/projects/Amiee/.env`. Pass them directly to browser form filling through a script's stdin. Never print, log, commit, or capture credentials; never read or use other keys. If either key is absent, report the missing key names and stop the login check. Capture only after the login form is closed and its fields are cleared.

Save before/after screenshots and a short recording of the changed flow outside the worktree. Compare against the original default-branch code using the same viewport and camera. Create an MP4 and animated GIF from the captured browser frames when requested; verify playback and keep files below 10 MB. For reference comparisons, keep watermarks intact and never use reference images as application assets or textures.

Run the relevant tests, including `npm test`, and report exact results and unverified limits. Attach screenshots, GIF, and recording to the PR with captions explaining the visible changes. When the task requests a `pr-media/<task>` orphan branch, put only review media there and use commit-pinned `raw.githubusercontent.com` URLs; keep media off the product branch. Stop only the dev server started for this check.

# For Amie — Girlfriend Proposal Site — Design Spec

## Purpose

Single-page personal website used to ask Amie to become the author's girlfriend. Deployed to Vercel, link sent directly to her (not indexed, not discoverable). She opens it on her phone.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** for layout/typography outside the 3D canvas
- **React Three Fiber + drei** for the 3D café diorama
- Plain CSS keyframe animations (ported from the imported mockup) for the love-note flow — no separate animation library needed, the mockup is already fully animated with `@keyframes`
- No backend, no database, no auth. Static/client-rendered.
- `robots: { index: false, follow: false }` in metadata — unlisted link only, no SEO.
- Mobile-first responsive (primary viewing device is her phone).
- No real photos of the couple — fully illustrated/stylized (diorama + note UI + stickers only).

## Source material

Two design references were imported via the Claude Design MCP from project `7d724b9e-296b-41c7-9c85-3ec027147a32` ("Romantic café date proposal website"):

- `Cafe 3D Diorama.dc.html` — a canvas-drawn isometric blueprint for the Three.js scene (not to be used as-is; it's a 2D pixel-art stand-in for the real R3F build).
- `Café Love Note Mockup.dc.html` — a fully-built 3-state HTML/CSS flow (envelope → letter → celebration) with real copy, colors, and animations. This is close to production-ready; port it into React components rather than rewriting from scratch.

Three Giphy stickers, all from the "Tonton Friends" character collective, resolved to direct media URLs:

| Character | Role in mockup | Direct GIF URL |
|---|---|---|
| Chubby YUTA (shiba) | Tonton — opening hop-in | `https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzVyaHRraDIxYXY0dmRpczQ5eXE0dml5cm96cHg5a3Rpa3Zsejg4aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/HWeUBuTIJV73ybn2bd/giphy.gif` |
| Tsundere BELLA (cat) | Tonton — excited (letter reveal) | `https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzN5YjRhdTduc2YyeTExamZod3RjYmVkdmMzaHl3dnRob2VjaWI4dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3i4g2nMtIXT9Y0sUUz/giphy.gif` |
| Chubby TOBI (bunny) | Tonton — dancing (celebration) | `https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3AxNTZ1ZnVyeGcxMWduODkxaXI4NzY3aDlieHJrMXR4dDRqdjU2aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/scGLs3atZgUCevRxn1/giphy.gif` |

All three are embedded as plain `<img>` tags (animated GIF), no Giphy embed script needed. Each also reappears once more elsewhere on the page as small floating decoration (hero corner, diorama section) in addition to its main Tonton role — per the user's choice of "all 3 as Tonton + also decorative."

Note: Giphy URLs can expire/rotate; verify they still resolve at implementation time and re-fetch via the Giphy page if not.

## Page structure (single vertical scroll)

### 1. Hero — new section, onepagelove-inspired

Reference: onepagelove.com/secret-garden-stresa — minimal/editorial luxury style.

- Fonts: Cormorant (headings), Inter (body) — matches the reference site, distinct from the love-note section's Dancing Script/Nunito (intentional contrast: elegant intro → cute payoff).
- Palette: cream/beige, gold, muted green.
- Full viewport, generous whitespace, short eyebrow line + headline, scroll-hint arrow (style matches the mockup's `scrollBounce` hint).
- One Tonton sticker (any of the 3, small, decorative) floats near a corner.

### 2. 3D Café Diorama

Built with React Three Fiber, matching the imported blueprint's exact spec:

- **Composition:** isometric cutaway box, 7m × 7m footprint, 4.8m ceiling, 2-level mezzanine at y=1.4m / z=3.5m split.
- **Scene graph:** floor, mezzanine slab, 6-step stairs, lounge (3 sofas + coffee table w/ candle), bar counter + espresso machine + cups + shelf bottles, 5 café tables each with 4 stools, a small "delivery bot" prop (3-cylinder character, glowing cyan eyes), chalkboard, cat painting, second art frame, wall-mounted TV, front door, string lights along mezzanine ceiling, 4 warm ceiling point lights.
- **Camera:** `OrthographicCamera`, position `(14, 12, 14)`, looking at `(3.5, 1, 3.5)`. Allow limited-range drag-to-orbit (small angle, e.g. ±15°) so it reads as an interactive diorama, not a static render — not a scroll-driven fly-through.
- **Lighting/materials:** ambient `#3A2418` @ 0.4, 4× warm point lights `#FFB030`, plus low string-light points. `MeshStandardMaterial`, roughness 0.9, metalness 0, flat shading — gives the low-poly cutout look from the blueprint.
- **Palette:** `#382010` brick walls, `#B08050` mezzanine wood floor, `#C09494` dusty-rose sofas, `#D2AE60` light-oak furniture, `#FFB030` warm light emission.
- Code-split via `next/dynamic` (`ssr: false`) so the hero paints before the 3D bundle loads.
- **Fallback:** if WebGL is unavailable, swap in a static illustrated image of the diorama instead of the canvas.
- One Tonton sticker sits just outside the canvas edge as a small "regular."

### 3. Café Love Note flow — ported from the imported mockup

Three states, same structure/animations as the source file, adapted to React state instead of raw HTML sections, with these copy edits:

- **State 1 — Opening:** unchanged. "A tiny delivery just arrived for you…", pulsing envelope with heart seal, café-table emoji row, music toggle, scroll hint. Tonton (YUTA/shiba GIF) hops in from the left.
- **State 2 — Letter reveal:** letter card copy edited to fold the girlfriend ask in alongside the date ask:
  > "Hi beautiful,
  > I wanted to ask you this in a cute way because you deserve cute things.
  > So I have one very important question…
  >
  > **Will you go on a date with me — and be my girlfriend?**"
  - Buttons unchanged: "Yes 💕" / "Obviously yes ☕".
  - Tiny static dodge link unchanged: "maybe... no? →" (understated text link, not a chase/gag mechanic — matches the "playful tone, serious ask" choice).
  - Tonton (BELLA/cat GIF) appears excited, bottom right.
- **State 3 — Celebration:** copy edited to confirm girlfriend status, not just a date:
  > "YAYYY!"
  > "It's official 💗" *(was "It's a date 💗")*
  > "Tonton approves. I can't wait to call you mine. 🥹" *(was "...spend time with you.")*
  - Date Plan card unchanged: coffee/dessert item, dress code, "required: your smile."
  - Tonton (TOBI/bunny GIF) dances, top right.

State transitions: tap envelope → state 2; tap either Yes button → state 3. The dodge link is decorative only — no click handler, no cursor-chase logic.

## Deployment

- Vercel, default Next.js build.
- `noindex` meta / robots.
- No environment variables or backend needed — fully static/client content.

## Out of scope

- No CMS, no analytics, no photo gallery, no multi-language, no accessibility beyond `prefers-reduced-motion` respecting the CSS animations and stickers (disable float/bounce loops when set).

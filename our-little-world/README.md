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

## Mochi, our bunny

A little white bunny with a pink bow lives on the island.

- **Walk her around:** tap the grass, or use the arrow keys / WASD (Q and E
  turn the island). Each place has a glowing circle in front of it; hop into
  one and that part of our world opens. Opening a place from the dock sends
  her there too.
- **Take care of her:** the bar under our names shows her tummy and love,
  with Hug and Feed. Her own page (tap the bar, or her name tag) has three
  treats (carrot, strawberry, matcha mochi), who gave the last hug and
  treat, and a way to rename her. Tummy and love go down slowly while we're
  away (about a day from full to empty), and her ears droop when she's
  hungry or lonely. Tapping her on the island is a pat.
- **Our anniversary:** also on her page. Pick the day we started and
  whether to celebrate every month or once a year. On that day the sky
  fills with fireworks and a "Happy 4 months!" banner. "Preview the
  fireworks" shows them any day, and signed in, a plan marked Celebration
  gets fireworks on its day too. The date also drives the days-together
  counter and the calendar's monthly anniversaries.

Her name starts as `GIFT.pet.name`. Her care, her name and the anniversary
are saved in the browser (`localStorage`), so each phone or laptop has its
own Mochi.

## Personalising

Everything personal is in the `GIFT` object near the top of the `<script>`
in `our-little-world.html`: names, start date, colours, song, memories,
love notes, letter, adventure ideas, and interface wording.

Set `showExampleBadges: false` once the sample content has been replaced.

Photos: use a `data:` URI (it travels inside the file) or a relative file name
published next to the page. Claude artifacts block images from other websites.

## Deploying to Vercel

This folder is a static site with no build step. In the Vercel project:

1. Settings → Build and Deployment → **Root Directory**: `our-little-world`
2. **Framework Preset**: Other (the `vercel.json` here already sets this, with
   no install or build command)
3. Redeploy. `index.html` is served at the site's root URL.

Rebuild `index.html` with `./make-standalone.sh` after editing the source.

The Vercel side needs **no changes** for the backend: no environment variables,
no functions, and `vercel.json` stays as it is. The page calls the Neon
Function directly from the browser, and the only setting it needs, the
Function's public URL, is in `GIFT.backend.apiUrl`. That URL is not a secret.
What Vercel's domain does need is to be on the Function's CORS allow-list
(`ALLOWED_ORIGINS`, below).

## Our own content (Neon backend)

Signed in, Ben and Amie can add, edit and delete:

| Content | Fields | Where it shows |
| --- | --- | --- |
| Letters | author, title, body, date | the mailbox, as a list of letters |
| Milestones | date, title, caption, photo | "Our story" and the 3D polaroids |
| Little things | author, text | the flower garden |
| Plans | title, date, optional time, location, note, kind, done | the bench: a month calendar plus Coming up, Someday (no date) and Done together |

Monthly anniversaries are marked on the calendar automatically from
`togetherSince`. Every item shows who wrote it.

Signed out, offline, or inside the Claude artifact preview (which can't reach
the backend), the page uses the content in the `GIFT` block as before. The
opening, island, finale, keyboard access, reduced motion and the no-WebGL
version all work the same in both modes.

### How it fits together

```
browser (static page on Vercel)
   │  HTTPS + Authorization: Bearer <15-minute JWT>
   ▼
Neon Function "api"  (backend/api, Hono)
   ├── Managed Neon Auth   accounts, password hashes, sessions (neon_auth schema)
   ├── Postgres            members, letters, milestones, love_notes, events
   └── Object Storage      private "photos" bucket
```

Everything Neon provisions is declared in `neon.ts` at the repo root:
`auth: true`, the `api` function and the private `photos` bucket.
The schema is in `backend/db/migrations/`.

- **Postgres** is reached through a single `pg` pool created at module scope
  (max 5 connections, `attachDatabasePool`), as the Neon Functions skill
  recommends for long-lived isolates. It uses the pooled `DATABASE_URL`, which
  Neon injects.
- **Photos** are shrunk in the browser to at most 1600 px (JPEG) and uploaded
  to the API, which checks the file type and stores the file in the private
  bucket under a random key. The bucket is never public: photos are only served
  back through the API to a signed-in member, and deleting a milestone deletes
  its photo.

### Why this sign-in

The Neon skills recommend **Managed Neon Auth** when an app has no login yet,
and a **JWT verified against the Neon Auth JWKS** at the top of a Function that
browsers call directly. That's what this uses:

- We sign in with a **username and password**. Neon Auth accounts are keyed by
  email, so the API maps a username to `<username>@login.our-little-world.invalid`.
  `.invalid` is a reserved domain, so no mail is ever sent to it.
- We share **one login**. The sign-in form asks "Who's signing in? Ben / Amie",
  and that name is saved as the author of everything you add in that session.
  To switch, sign out and back in. A personal login fixed to one name also
  works (`--name`, below).
- Accounts and password hashes live in Neon Auth, never in our tables. Sign-up
  is **disabled** once the login exists, so nobody else can register.
- On top of that, the API only accepts accounts listed in the `members` table.
  Any other valid account gets `403`.
- Every data route verifies the JWT's signature, issuer and audience against
  the Neon Auth JWKS before it touches Postgres or the bucket. Without a token
  every route returns `401`, including the photo download.

One adjustment: Neon Auth keeps its session in a cookie on its own domain.
From our Vercel page that would be a third-party cookie, which Safari (so every
iPhone) blocks. So the Function relays sign-in to Neon Auth server-to-server
and gives the page two tokens. The first is the 15-minute JWT, kept only in
memory. The second is the Neon Auth session token, kept in `localStorage`, and
its only use is minting new JWTs. Signing out revokes that session in Neon
Auth. Sign-in attempts are also rate-limited per visitor.

## Setting up the backend

All commands run from the **repo root**. You need Node 20.19+ and a Neon API key
for the org that owns project `cool-mode-83922959`. In a cloud container,
browser `neon login` doesn't work, so use the key:

```bash
export NEON_API_KEY=napi_...      # never commit this
npm install
```

1. **Link the folder** (once per checkout; `.neon` is gitignored):

   ```bash
   npx neonctl link --project-id cool-mode-83922959 --branch production
   ```

2. **Allow the page's origins.** Put this line in `.env.local` (also
   gitignored), adding any custom domain you use:

   ```bash
   ALLOWED_ORIGINS=https://amiee-sigma.vercel.app,https://amiee-khoi-dos-projects-cd46277e.vercel.app,https://amiee-*-khoi-dos-projects-cd46277e.vercel.app,http://localhost:*,http://127.0.0.1:*
   ```

   `*` matches any characters within the host, so the last Vercel entry
   covers preview deployments. Our live site is `https://amiee-sigma.vercel.app`.
   (`amiee.vercel.app` is someone else's site, so don't add it.) If the page
   says "We couldn't reach our little server", the address you opened is
   probably missing from this list.

3. **Deploy the Neon services** (Auth, the `api` function and the `photos`
   bucket). This also writes `DATABASE_URL`, `NEON_AUTH_*`, `AWS_*` and
   `NEON_FUNCTION_API_BASE_URL` into `.env.local`:

   ```bash
   npm run neon:deploy
   ```

   It prints the function URL. If it ever changes, update
   `GIFT.backend.apiUrl` in `our-little-world.html`. After a deploy, isolates
   that are already warm can keep serving the old code for a minute.
   `curl <function URL>` shows the `version` that is answering.

4. **Create the tables:**

   ```bash
   npm run db:migrate
   ```

   Each file in `backend/db/migrations/` runs once, in order, inside a
   transaction. Add new changes as new numbered files; never edit an applied one.

5. **Create the login.** Our shared login already exists. To add another one,
   or to recreate it on a new branch, turn sign-up on for a minute, add the
   login, then turn sign-up off again:

   ```bash
   npx neonctl neon-auth config email-password update --disable-sign-up false
   ```

   ```bash
   MEMBER_PASSWORD='the-password' npm run db:add-member -- --username our-username
   ```

   ```bash
   npx neonctl neon-auth config email-password update --disable-sign-up true
   ```

   Usernames are 3 to 32 characters (`a-z 0-9 . _ -`) and not case-sensitive;
   passwords need 8 or more. Add `--name Ben` or `--name Amie` for a personal
   login that always writes as that person. An existing username is linked
   as-is. To change a password, delete the user with
   `npx neonctl neon-auth user delete <user-id>` (the id is in the Neon Console,
   or `select id, email from neon_auth."user"`), then add it again.

6. **Publish the page:** run `./make-standalone.sh` in this folder if you edited
   the source, then push. Vercel redeploys the static files.

### Checking it

```bash
E2E_USERNAME=… E2E_PASSWORD=… npm run test:e2e
```

This runs 83 checks against the deployed API, signing in once as Ben and once
as Amie: sign-in and sign-out, refusal of wrong passwords, unknown usernames,
signed-out and forged requests, and writes that don't say who wrote them, create/read/update/delete for every content
type, photo upload and download, and that the bucket isn't public. It deletes
everything it creates.

To try the page locally against the real backend, serve this folder on
`localhost` (for example `python3 -m http.server 5173`) and open
`http://localhost:5173/`.

### Files

- `neon.ts`: the Neon services (repo root)
- `backend/api/`: the Function (`index.ts` routes, `auth.ts`, `db.ts`,
  `storage.ts`, `resources.ts`)
- `backend/db/migrations/`: SQL schema
- `backend/scripts/`: `migrate.mjs`, `add-member.mjs` and `e2e.mjs`. These
  talk to Postgres over Neon's HTTPS SQL endpoint, so they also work on
  networks that block port 5432.

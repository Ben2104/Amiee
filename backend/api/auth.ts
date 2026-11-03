import { createRemoteJWKSet, jwtVerify } from "jose";
import { query } from "./db";

// Managed Neon Auth (Better Auth) holds the accounts, password hashes and sessions.
// The browser never talks to Neon Auth directly: its session cookie would be a
// third-party cookie on our page, which Safari blocks. Instead this Function relays
// sign-in server-to-server and hands the page two things:
//   - accessToken: Neon Auth's 15-minute EdDSA JWT, verified below against the JWKS
//   - refreshToken: the opaque Neon Auth session token, used only to mint new JWTs
// Every data route then requires a valid JWT whose user is in the members table.

const AUTH_BASE = process.env.NEON_AUTH_BASE_URL;
const JWKS_URL = process.env.NEON_AUTH_JWKS_URL;
if (!AUTH_BASE || !JWKS_URL) throw new Error("Neon Auth is not enabled on this branch");
const AUTH_ORIGIN = new URL(AUTH_BASE).origin;
const COOKIE = "__Secure-neon-auth.session_token";
const jwks = createRemoteJWKSet(new URL(JWKS_URL));

export type Name = "Ben" | "Amie";
// name is null for a shared login: whoever signs in picks Ben or Amie.
export type Member = { userId: string; name: Name | null };

// Neon Auth accounts are keyed by email. We sign in with a username instead and map
// it to an address on the reserved .invalid domain, which never receives mail.
export const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,31}$/;
export const LOGIN_DOMAIN = "login.our-little-world.invalid";
export const usernameEmail = (u: string) => `${u}@${LOGIN_DOMAIN}`;
export class AuthError extends Error {
  constructor(public status: 401 | 403 | 429 | 502, message: string) {
    super(message);
  }
}

const memberCache = new Map<string, { member: Member | null; at: number }>();
async function memberFor(userId: string): Promise<Member | null> {
  const hit = memberCache.get(userId);
  if (hit && Date.now() - hit.at < 60_000) return hit.member;
  const [row] = await query<{ display_name: Name | null }>(
    "select display_name from members where user_id = $1",
    [userId],
  );
  const member = row ? { userId, name: row.display_name } : null;
  // Cache only confirmed members, so a newly added login works straight away.
  if (member) memberCache.set(userId, { member, at: Date.now() });
  else memberCache.delete(userId);
  return member;
}

/** Verifies a bearer JWT and returns the member, or throws AuthError. */
export async function requireMember(authorization: string | undefined): Promise<Member> {
  if (!authorization?.toLowerCase().startsWith("bearer ")) throw new AuthError(401, "Please sign in");
  let sub: string | undefined;
  try {
    const { payload } = await jwtVerify(authorization.slice(7).trim(), jwks, {
      issuer: AUTH_ORIGIN,
      audience: AUTH_ORIGIN,
    });
    sub = payload.sub;
  } catch {
    throw new AuthError(401, "Your sign-in expired");
  }
  if (!sub) throw new AuthError(401, "Please sign in");
  const member = await memberFor(sub);
  if (!member) throw new AuthError(403, "This account is not one of ours");
  return member;
}

// Session tokens are opaque Better Auth values: allow only cookie-safe characters.
const TOKEN_RE = /^[A-Za-z0-9._~%+/=-]{20,600}$/;
function cookieHeader(refreshToken: string) {
  if (!TOKEN_RE.test(refreshToken)) throw new AuthError(401, "Please sign in again");
  return `${COOKIE}=${refreshToken}`;
}
function sessionFrom(res: Response): string | null {
  for (const line of res.headers.getSetCookie()) {
    const m = new RegExp(`^${COOKIE.replace(/[.]/g, "\\.")}=([^;]*)`).exec(line);
    if (m) return m[1] || null;
  }
  return null;
}
function relayHeaders(clientIp: string | undefined, extra: Record<string, string> = {}) {
  const h: Record<string, string> = { origin: AUTH_ORIGIN, ...extra };
  if (clientIp) h["x-forwarded-for"] = clientIp; // keeps Neon Auth's rate limits per visitor
  return h;
}

async function mintToken(refreshToken: string, clientIp?: string) {
  const res = await fetch(`${AUTH_BASE}/token`, {
    headers: relayHeaders(clientIp, { cookie: cookieHeader(refreshToken) }),
  });
  if (res.status === 401 || res.status === 403) throw new AuthError(401, "Please sign in again");
  if (!res.ok) throw new AuthError(502, "Sign-in service is unavailable");
  const { token } = (await res.json()) as { token: string };
  // Better Auth may roll the session forward; pass the new value back if so.
  return { accessToken: token, refreshToken: sessionFrom(res) || refreshToken };
}

export async function signIn(username: string, password: string, clientIp?: string) {
  const res = await fetch(`${AUTH_BASE}/sign-in/email`, {
    method: "POST",
    headers: relayHeaders(clientIp, { "content-type": "application/json" }),
    body: JSON.stringify({ email: usernameEmail(username), password }),
  });
  if (res.status === 429) throw new AuthError(429, "Too many tries. Wait a minute and try again.");
  if (res.status === 401 || res.status === 400 || res.status === 403)
    throw new AuthError(401, "That username and password don't match");
  if (!res.ok) throw new AuthError(502, "Sign-in service is unavailable");
  const session = sessionFrom(res);
  if (!session) throw new AuthError(502, "Sign-in service returned no session");
  const tokens = await mintToken(session, clientIp);
  const member = await requireMember(`Bearer ${tokens.accessToken}`).catch(async (err) => {
    await signOut(tokens.refreshToken, clientIp).catch(() => {});
    throw err;
  });
  return { ...tokens, member };
}

export async function refresh(refreshToken: string, clientIp?: string) {
  const tokens = await mintToken(refreshToken, clientIp);
  const member = await requireMember(`Bearer ${tokens.accessToken}`);
  return { ...tokens, member };
}

export async function signOut(refreshToken: string, clientIp?: string) {
  await fetch(`${AUTH_BASE}/sign-out`, {
    method: "POST",
    headers: relayHeaders(clientIp, { cookie: cookieHeader(refreshToken), "content-type": "application/json" }),
    body: "{}",
  });
}

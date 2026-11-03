import { defineConfig } from "@neon/config/v1";

// Neon services for "Our Little World" (our-little-world/).
// Apply with:  npx neonctl deploy --env .env.local
export default defineConfig({
  // Managed Better Auth: email + password logins for Ben and Amie only.
  auth: true,
  functions: {
    // REST API the gift page calls from the browser (Hono + pg).
    api: {
      name: "Our Little World API",
      source: "./backend/api/index.ts",
      env: {
        // Comma-separated browser origins allowed by CORS, e.g.
        // "https://our-little-world.vercel.app,http://localhost:*"
        ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS!,
      },
    },
  },
  buckets: {
    // Private: photos are only ever served through the authenticated API.
    photos: { access: "private" },
  },
  // Branch policy: per-branch tuning
  branch: (branch) => {
    if (branch.isDefault) {
      // Default branch: no overrides, uses project defaults
      return {};
    }
    if (!branch.exists) {
      // New non-default branches: auto-expire
      // Run `neon checkout <name>` to create a new branch with these settings
      return { ttl: "7d" };
    }
    // Existing branch: no changes
    return {};
  },
});

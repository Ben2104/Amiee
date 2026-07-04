# For Amie Proposal Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and ship a single-page Next.js site that walks Amie through an onepagelove-styled hero, an interactive Three.js café diorama, and a 3-state love-note flow that asks her to be the user's girlfriend, deployed to Vercel.

**Architecture:** Next.js 14 App Router + TypeScript + Tailwind for layout/typography; React Three Fiber + drei for the 3D diorama, code-split client-only; plain Tailwind-driven CSS keyframe animations (ported from the imported mockup) for the love-note flow; Vitest + Testing Library + `@react-three/test-renderer` for tests. No backend.

**Tech Stack:** next@14.2.5, react@18.3.1, three@0.165.0, @react-three/fiber@8.16.8, @react-three/drei@9.108.3, tailwindcss@3.4.4, vitest@1.6.0, @testing-library/react@16.0.0, @react-three/test-renderer@8.2.0.

## Global Constraints

- No real photos of the couple — fully illustrated/3D + stickers only.
- `robots: noindex, nofollow` — this is an unlisted link, not meant to be discoverable.
- Mobile-first: primary device is her phone.
- The dodge link in the letter state ("maybe... no? →") is decorative only — no click handler, no cursor-chase logic.
- Diorama camera is a fixed-angle interactive orthographic view (limited-range orbit), not a scroll-driven fly-through.
- Tonton stickers: Chubby Yuta (shiba) = opening state, Tsundere Bella (cat) = letter state, Chubby Tobi (bunny) = celebration state — each also reused once more elsewhere on the page as decoration.
- Path alias `@/*` maps to the project root (configured in Task 1).

---

### Task 1: Project scaffold — Next.js, Tailwind, base layout

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `next-env.d.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Create: `.gitignore`

**Interfaces:**
- Produces: Tailwind utility classes `animate-pulse-glow`, `animate-float-a`, `animate-float-b`, `animate-twinkle`, `animate-float-up`, `animate-bounce-btn`, `animate-dance-tonton`, `animate-scroll-bounce` (used by Tasks 3, 5–7). Font CSS vars `--font-cormorant`, `--font-inter`, `--font-dancing-script`, `--font-nunito` (used by Tasks 4–7). Path alias `@/*`.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "for-amie",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "three": "0.165.0",
    "@react-three/fiber": "8.16.8",
    "@react-three/drei": "9.108.3"
  },
  "devDependencies": {
    "typescript": "5.5.4",
    "@types/node": "20.14.2",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "@types/three": "0.165.0",
    "tailwindcss": "3.4.4",
    "postcss": "8.4.38",
    "autoprefixer": "10.4.19",
    "vitest": "1.6.0",
    "@vitejs/plugin-react": "4.3.1",
    "jsdom": "24.1.0",
    "@testing-library/react": "16.0.0",
    "@testing-library/jest-dom": "6.4.6",
    "@react-three/test-renderer": "8.2.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: lockfile created, no errors.

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Write `next.config.mjs`**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

- [ ] **Step 5: Write `tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "amie-cream": "#FFF7EC",
        "amie-gold": "#D2AE60",
        "amie-green": "#3A5828",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        script: ["var(--font-dancing-script)", "cursive"],
        note: ["var(--font-nunito)", "sans-serif"],
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { filter: "drop-shadow(0 0 12px rgba(232,106,146,0.35))", transform: "scale(1)" },
          "50%": { filter: "drop-shadow(0 0 32px rgba(232,106,146,0.72))", transform: "scale(1.05)" },
        },
        "float-a": {
          "0%, 100%": { transform: "translateY(0) rotate(-5deg)" },
          "50%": { transform: "translateY(-12px) rotate(5deg)" },
        },
        "float-b": {
          "0%, 100%": { transform: "translateY(-5px) rotate(3deg)" },
          "50%": { transform: "translateY(7px) rotate(-4deg)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.1", transform: "scale(0.5)" },
        },
        "float-up": {
          "0%": { transform: "translateY(0) rotate(-12deg)", opacity: "0.9" },
          "65%": { opacity: "0.4" },
          "100%": { transform: "translateY(-110vh) rotate(16deg)", opacity: "0" },
        },
        "bounce-btn": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-4px) scale(1.02)" },
        },
        "dance-tonton": {
          "0%, 100%": { transform: "translateY(0) rotate(-7deg) scale(1)" },
          "25%": { transform: "translateY(-18px) rotate(9deg) scale(1.08)" },
          "50%": { transform: "translateY(-2px) rotate(-5deg) scale(0.95)" },
          "75%": { transform: "translateY(-14px) rotate(11deg) scale(1.05)" },
        },
        "scroll-bounce": {
          "0%, 100%": { transform: "translateY(0)", opacity: "0.6" },
          "50%": { transform: "translateY(6px)", opacity: "1" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        "float-a": "float-a 3s ease-in-out infinite",
        "float-b": "float-b 3.6s ease-in-out infinite",
        twinkle: "twinkle 2.3s ease-in-out infinite",
        "float-up": "float-up 2.8s ease-out infinite",
        "bounce-btn": "bounce-btn 2.2s ease-in-out infinite",
        "dance-tonton": "dance-tonton 1.1s ease-in-out infinite",
        "scroll-bounce": "scroll-bounce 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 6: Write `postcss.config.js`**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 7: Write `next-env.d.ts`**

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

- [ ] **Step 8: Write `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@media (prefers-reduced-motion: reduce) {
  .animate-pulse-glow,
  .animate-float-a,
  .animate-float-b,
  .animate-twinkle,
  .animate-float-up,
  .animate-bounce-btn,
  .animate-dance-tonton,
  .animate-scroll-bounce {
    animation: none !important;
  }
}
```

- [ ] **Step 9: Write `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Cormorant, Inter, Dancing_Script, Nunito } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-cormorant" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-inter" });
const dancingScript = Dancing_Script({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-dancing-script" });
const nunito = Nunito({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: "For Amie",
  robots: { index: false, follow: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${inter.variable} ${dancingScript.variable} ${nunito.variable}`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 10: Write placeholder `app/page.tsx`**

```tsx
export default function Home() {
  return (
    <main>
      <h1 className="font-display text-4xl">For Amie</h1>
    </main>
  );
}
```

- [ ] **Step 11: Write `.gitignore`**

```
node_modules
.next
.vercel
*.log
```

- [ ] **Step 12: Verify production build**

Run: `npm run build`
Expected: build completes successfully with no type or compile errors.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "Scaffold Next.js + Tailwind project"
```

---

### Task 2: Testing framework setup

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `lib/__tests__/smoke.test.ts`

**Interfaces:**
- Produces: `vitest run` command, jsdom test environment, `@testing-library/jest-dom` matchers available in every test file.

- [ ] **Step 1: Write `vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 2: Write `vitest.setup.ts`**

```typescript
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Write the failing smoke test**

```typescript
import { describe, it, expect } from "vitest";

describe("test environment", () => {
  it("runs in jsdom with a document global", () => {
    expect(typeof document).toBe("object");
  });
});
```

- [ ] **Step 4: Run the test**

Run: `npm run test`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts vitest.setup.ts lib/__tests__/smoke.test.ts
git commit -m "Add Vitest + Testing Library setup"
```

---

### Task 3: Tonton sticker data + StickerFloat component

**Files:**
- Create: `lib/tonton.ts`
- Create: `lib/__tests__/tonton.test.ts`
- Create: `components/StickerFloat.tsx`
- Create: `components/__tests__/StickerFloat.test.tsx`

**Interfaces:**
- Consumes: Tailwind animation classes from Task 1 (`animate-float-a`, `animate-float-b`, `animate-twinkle`).
- Produces: `TontonSticker` type, `TONTON_STICKERS` array, `tontonById(id)` (used by Tasks 5–8, 13). `StickerFloat` component with props `{ sticker: TontonSticker; variant?: "float-a" | "float-b" | "twinkle"; className?: string; size?: number }` (used by Tasks 4, 8, 13).

- [ ] **Step 1: Write the failing test for tonton data**

```typescript
import { describe, it, expect } from "vitest";
import { TONTON_STICKERS, tontonById } from "@/lib/tonton";

describe("tonton data", () => {
  it("has exactly the three Tonton Friends characters", () => {
    expect(TONTON_STICKERS.map((s) => s.id)).toEqual(["yuta", "bella", "tobi"]);
  });

  it("looks up a sticker by id", () => {
    const yuta = tontonById("yuta");
    expect(yuta.src).toContain("HWeUBuTIJV73ybn2bd");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- lib/__tests__/tonton.test.ts`
Expected: FAIL — `Cannot find module '@/lib/tonton'`.

- [ ] **Step 3: Write `lib/tonton.ts`**

```typescript
export interface TontonSticker {
  id: "yuta" | "bella" | "tobi";
  label: string;
  src: string;
}

export const TONTON_STICKERS: TontonSticker[] = [
  {
    id: "yuta",
    label: "Chubby Yuta the shiba",
    src: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzVyaHRraDIxYXY0dmRpczQ5eXE0dml5cm96cHg5a3Rpa3Zsejg4aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/HWeUBuTIJV73ybn2bd/giphy.gif",
  },
  {
    id: "bella",
    label: "Tsundere Bella the cat",
    src: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzN5YjRhdTduc2YyeTExamZod3RjYmVkdmMzaHl3dnRob2VjaWI4dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3i4g2nMtIXT9Y0sUUz/giphy.gif",
  },
  {
    id: "tobi",
    label: "Chubby Tobi the bunny",
    src: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3AxNTZ1ZnVyeGcxMWduODkxaXI4NzY3aDlieHJrMXR4dDRqdjU2aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/scGLs3atZgUCevRxn1/giphy.gif",
  },
];

export function tontonById(id: TontonSticker["id"]): TontonSticker {
  const found = TONTON_STICKERS.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown tonton id: ${id}`);
  return found;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- lib/__tests__/tonton.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Write the failing test for StickerFloat**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StickerFloat } from "@/components/StickerFloat";
import { tontonById } from "@/lib/tonton";

describe("StickerFloat", () => {
  it("renders the sticker image with correct alt text and animation class", () => {
    render(<StickerFloat sticker={tontonById("tobi")} variant="float-b" />);
    const img = screen.getByAltText("Chubby Tobi the bunny");
    expect(img).toHaveAttribute("src", expect.stringContaining("scGLs3atZgUCevRxn1"));
    expect(img).toHaveClass("animate-float-b");
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm run test -- components/__tests__/StickerFloat.test.tsx`
Expected: FAIL — `Cannot find module '@/components/StickerFloat'`.

- [ ] **Step 7: Write `components/StickerFloat.tsx`**

```tsx
import type { TontonSticker } from "@/lib/tonton";

type FloatVariant = "float-a" | "float-b" | "twinkle";

const VARIANT_CLASS: Record<FloatVariant, string> = {
  "float-a": "animate-float-a",
  "float-b": "animate-float-b",
  twinkle: "animate-twinkle",
};

interface StickerFloatProps {
  sticker: TontonSticker;
  variant?: FloatVariant;
  className?: string;
  size?: number;
}

export function StickerFloat({ sticker, variant = "float-a", className = "", size = 64 }: StickerFloatProps) {
  return (
    <img
      src={sticker.src}
      alt={sticker.label}
      width={size}
      height={size}
      className={`pointer-events-none select-none ${VARIANT_CLASS[variant]} ${className}`}
    />
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm run test -- components/__tests__/StickerFloat.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 9: Commit**

```bash
git add lib/tonton.ts lib/__tests__/tonton.test.ts components/StickerFloat.tsx components/__tests__/StickerFloat.test.tsx
git commit -m "Add Tonton sticker data and StickerFloat component"
```

---

### Task 4: Hero section

**Files:**
- Create: `components/Hero.tsx`
- Create: `components/__tests__/Hero.test.tsx`

**Interfaces:**
- Consumes: `StickerFloat` (Task 3), `tontonById` (Task 3), font classes `font-display`/`font-body` (Task 1).
- Produces: `Hero` component (used by Task 13).

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/Hero";

describe("Hero", () => {
  it("renders the headline and a decorative sticker", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/for you, amie/i);
    expect(screen.getByAltText(/chubby yuta the shiba/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- components/__tests__/Hero.test.tsx`
Expected: FAIL — `Cannot find module '@/components/Hero'`.

- [ ] **Step 3: Write `components/Hero.tsx`**

```tsx
import { StickerFloat } from "@/components/StickerFloat";
import { tontonById } from "@/lib/tonton";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-amie-cream px-6 text-center">
      <p className="font-body text-xs uppercase tracking-[0.3em] text-amie-green/70">a little something for</p>
      <h1 className="font-display mt-4 text-5xl font-semibold text-[#3A2418] sm:text-6xl">For You, Amie</h1>
      <p className="font-body mt-4 max-w-md text-sm text-amie-green/80">
        Scroll down. There&apos;s a café, a note, and a question waiting for you.
      </p>

      <div className="absolute bottom-10 right-8">
        <StickerFloat sticker={tontonById("yuta")} variant="float-a" size={72} />
      </div>

      <div className="absolute bottom-6 flex flex-col items-center gap-1 text-amie-green/50 animate-scroll-bounce">
        <span className="font-body text-[10px] uppercase tracking-[0.2em]">scroll</span>
        <span>↓</span>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- components/__tests__/Hero.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add components/Hero.tsx components/__tests__/Hero.test.tsx
git commit -m "Add onepagelove-styled hero section"
```

---

### Task 5: LoveNote opening state

**Files:**
- Create: `components/lovenote/OpeningState.tsx`
- Create: `components/lovenote/__tests__/OpeningState.test.tsx`

**Interfaces:**
- Consumes: `StickerFloat`, `tontonById("yuta")` (Task 3).
- Produces: `OpeningState` component with props `{ onOpen: () => void }` (used by Task 8).

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OpeningState } from "@/components/lovenote/OpeningState";

describe("OpeningState", () => {
  it("calls onOpen when the envelope is tapped", async () => {
    const onOpen = vi.fn();
    render(<OpeningState onOpen={onOpen} />);
    await userEvent.click(screen.getByRole("button", { name: /open/i }));
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("shows the opening copy and the shiba Tonton", () => {
    render(<OpeningState onOpen={() => {}} />);
    expect(screen.getByText(/a tiny delivery/i)).toBeInTheDocument();
    expect(screen.getByAltText(/chubby yuta the shiba/i)).toBeInTheDocument();
  });
});
```

Note: `@testing-library/user-event` ships as a transitive dependency of `@testing-library/react` v16's peer set — add it explicitly.

- [ ] **Step 2: Add `@testing-library/user-event` to `package.json` devDependencies**

```json
"@testing-library/user-event": "14.5.2"
```

Run: `npm install`

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test -- components/lovenote/__tests__/OpeningState.test.tsx`
Expected: FAIL — `Cannot find module '@/components/lovenote/OpeningState'`.

- [ ] **Step 4: Write `components/lovenote/OpeningState.tsx`**

```tsx
import { StickerFloat } from "@/components/StickerFloat";
import { tontonById } from "@/lib/tonton";

interface OpeningStateProps {
  onOpen: () => void;
}

export function OpeningState({ onOpen }: OpeningStateProps) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFF7EC] via-[#FFEEDD] to-[#FFE5CC] px-6 text-center">
      <div className="absolute bottom-[22vh] left-10">
        <StickerFloat sticker={tontonById("yuta")} variant="float-a" size={90} />
      </div>

      <p className="font-script text-3xl text-[#8B5E3C] sm:text-4xl">
        A tiny delivery
        <br />
        just arrived for you…
      </p>

      <button
        type="button"
        onClick={onOpen}
        aria-label="Open the envelope"
        className="animate-pulse-glow mt-8 h-32 w-44 rounded-[6px_6px_14px_14px] bg-gradient-to-br from-[#FFEAF3] to-[#FFD8EA] shadow-lg"
      >
        <span className="text-3xl">❤️</span>
      </button>

      <p className="font-note mt-6 text-sm text-[#A0785A]">Tap the envelope to open it.</p>
    </section>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test -- components/lovenote/__tests__/OpeningState.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json components/lovenote/OpeningState.tsx components/lovenote/__tests__/OpeningState.test.tsx
git commit -m "Add LoveNote opening state"
```

---

### Task 6: LoveNote letter state

**Files:**
- Create: `components/lovenote/LetterState.tsx`
- Create: `components/lovenote/__tests__/LetterState.test.tsx`

**Interfaces:**
- Consumes: `StickerFloat`, `tontonById("bella")` (Task 3).
- Produces: `LetterState` component with props `{ onYes: () => void }` (used by Task 8).

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LetterState } from "@/components/lovenote/LetterState";

describe("LetterState", () => {
  it("asks both the date question and the girlfriend question", () => {
    render(<LetterState onYes={() => {}} />);
    expect(screen.getByText(/will you go on a date with me/i)).toBeInTheDocument();
    expect(screen.getByText(/be my girlfriend/i)).toBeInTheDocument();
  });

  it("calls onYes when either yes button is clicked", async () => {
    const onYes = vi.fn();
    render(<LetterState onYes={onYes} />);
    await userEvent.click(screen.getByRole("button", { name: /^yes/i }));
    expect(onYes).toHaveBeenCalledOnce();
  });

  it("renders the dodge link with no click handler", () => {
    render(<LetterState onYes={() => {}} />);
    const dodge = screen.getByText(/maybe\.\.\. no\?/i);
    expect(dodge.tagName).toBe("SPAN");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- components/lovenote/__tests__/LetterState.test.tsx`
Expected: FAIL — `Cannot find module '@/components/lovenote/LetterState'`.

- [ ] **Step 3: Write `components/lovenote/LetterState.tsx`**

```tsx
import { StickerFloat } from "@/components/StickerFloat";
import { tontonById } from "@/lib/tonton";

interface LetterStateProps {
  onYes: () => void;
}

export function LetterState({ onYes }: LetterStateProps) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFF2E8] via-[#FFE8D5] to-[#FFD8C0] px-6 py-20 text-center">
      <div className="absolute bottom-32 right-10">
        <StickerFloat sticker={tontonById("bella")} variant="float-b" size={80} />
      </div>

      <div className="relative z-10 w-full max-w-xl rounded-[28px] bg-white px-8 py-10 shadow-xl">
        <p className="font-note text-base italic leading-relaxed text-[#5C3D2E]">
          Hi beautiful,
          <br />
          I wanted to ask you this in a cute way because you deserve cute things.
          <br />
          So I have one very important question…
        </p>

        <p className="font-script mt-6 text-3xl font-bold leading-tight text-[#E86A92] sm:text-4xl">
          Will you go on a date with me
          <br />— and be my girlfriend?
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onYes}
            className="animate-bounce-btn rounded-full bg-gradient-to-br from-[#E86A92] to-[#D45880] px-9 py-3 font-note font-bold text-white shadow-lg"
          >
            Yes 💕
          </button>
          <button
            type="button"
            onClick={onYes}
            className="animate-bounce-btn rounded-full bg-gradient-to-br from-[#8B5E3C] to-[#7A5030] px-9 py-3 font-note font-bold text-[#FFE8D5] shadow-lg"
          >
            Obviously yes ☕
          </button>
        </div>

        <span className="mt-4 block cursor-default font-note text-xs italic text-[#C4A080] underline decoration-dotted underline-offset-4">
          maybe... no? →
        </span>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- components/lovenote/__tests__/LetterState.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add components/lovenote/LetterState.tsx components/lovenote/__tests__/LetterState.test.tsx
git commit -m "Add LoveNote letter state"
```

---

### Task 7: LoveNote celebration state

**Files:**
- Create: `components/lovenote/CelebrationState.tsx`
- Create: `components/lovenote/__tests__/CelebrationState.test.tsx`

**Interfaces:**
- Consumes: `StickerFloat`, `tontonById("tobi")` (Task 3).
- Produces: `CelebrationState` component, no props (used by Task 8).

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CelebrationState } from "@/components/lovenote/CelebrationState";

describe("CelebrationState", () => {
  it("confirms girlfriend status, not just a date", () => {
    render(<CelebrationState />);
    expect(screen.getByText(/it's official/i)).toBeInTheDocument();
    expect(screen.getByText(/call you mine/i)).toBeInTheDocument();
    expect(screen.getByAltText(/chubby tobi the bunny/i)).toBeInTheDocument();
  });

  it("still shows the date plan card", () => {
    render(<CelebrationState />);
    expect(screen.getByText(/coffee, dessert/i)).toBeInTheDocument();
    expect(screen.getByText(/required: your smile/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- components/lovenote/__tests__/CelebrationState.test.tsx`
Expected: FAIL — `Cannot find module '@/components/lovenote/CelebrationState'`.

- [ ] **Step 3: Write `components/lovenote/CelebrationState.tsx`**

```tsx
import { StickerFloat } from "@/components/StickerFloat";
import { tontonById } from "@/lib/tonton";

export function CelebrationState() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFE8F0] via-[#FFD6E7] to-[#FFBDD0] px-6 py-20 text-center">
      <div className="absolute right-10 top-20">
        <StickerFloat sticker={tontonById("tobi")} variant="float-b" size={90} className="animate-dance-tonton" />
      </div>

      <h1 className="font-script text-6xl font-bold text-[#BF4060] sm:text-8xl">YAYYY!</h1>
      <p className="font-script mt-2 text-3xl font-semibold text-[#E86A92] sm:text-4xl">It&apos;s official 💗</p>
      <p className="font-note mt-4 max-w-md text-sm text-[#8B2A50]">
        Tonton approves. I can&apos;t wait to call you mine. 🥹
      </p>

      <div className="mt-8 w-full max-w-md rounded-[28px] bg-white/90 px-9 py-8 shadow-xl">
        <p className="font-script text-2xl font-bold text-[#BF4060]">Date Plan</p>
        <div className="mt-4 flex flex-col gap-3 text-left">
          <p className="font-note text-sm font-semibold text-[#5C3D2E]">☕ Coffee, dessert, and your favorite person</p>
          <hr className="border-[#D8B89A]/30" />
          <p className="font-note text-sm text-[#5C3D2E]">👗 Dress code: cute and comfy</p>
          <hr className="border-[#D8B89A]/30" />
          <p className="font-note text-sm text-[#5C3D2E]">😊 Required: your smile</p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- components/lovenote/__tests__/CelebrationState.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add components/lovenote/CelebrationState.tsx components/lovenote/__tests__/CelebrationState.test.tsx
git commit -m "Add LoveNote celebration state"
```

---

### Task 8: Wire the LoveNote state machine

**Files:**
- Create: `components/lovenote/LoveNoteFlow.tsx`
- Create: `components/lovenote/__tests__/LoveNoteFlow.test.tsx`

**Interfaces:**
- Consumes: `OpeningState` (Task 5), `LetterState` (Task 6), `CelebrationState` (Task 7).
- Produces: `LoveNoteFlow` component, no props (used by Task 13).

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoveNoteFlow } from "@/components/lovenote/LoveNoteFlow";

describe("LoveNoteFlow", () => {
  it("walks from opening to letter to celebration", async () => {
    render(<LoveNoteFlow />);

    expect(screen.getByText(/a tiny delivery/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /open/i }));
    expect(screen.getByText(/will you go on a date with me/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^yes/i }));
    expect(screen.getByText(/it's official/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- components/lovenote/__tests__/LoveNoteFlow.test.tsx`
Expected: FAIL — `Cannot find module '@/components/lovenote/LoveNoteFlow'`.

- [ ] **Step 3: Write `components/lovenote/LoveNoteFlow.tsx`**

```tsx
"use client";

import { useState } from "react";
import { OpeningState } from "./OpeningState";
import { LetterState } from "./LetterState";
import { CelebrationState } from "./CelebrationState";

type FlowState = "opening" | "letter" | "celebration";

export function LoveNoteFlow() {
  const [state, setState] = useState<FlowState>("opening");

  if (state === "opening") return <OpeningState onOpen={() => setState("letter")} />;
  if (state === "letter") return <LetterState onYes={() => setState("celebration")} />;
  return <CelebrationState />;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- components/lovenote/__tests__/LoveNoteFlow.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add components/lovenote/LoveNoteFlow.tsx components/lovenote/__tests__/LoveNoteFlow.test.tsx
git commit -m "Wire LoveNote state machine"
```

---

### Task 9: WebGL detection + diorama constants

**Files:**
- Create: `lib/webgl.ts`
- Create: `lib/__tests__/webgl.test.ts`
- Create: `lib/diorama.ts`
- Create: `lib/__tests__/diorama.test.ts`

**Interfaces:**
- Produces: `hasWebGL(): boolean` (used by Task 12). `ROOM`, `MEZZANINE`, `PALETTE`, `CAMERA` constants (used by Tasks 10, 11).

- [ ] **Step 1: Write the failing test for `hasWebGL`**

```typescript
import { describe, it, expect, vi, afterEach } from "vitest";
import { hasWebGL } from "@/lib/webgl";

describe("hasWebGL", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns true when the canvas can produce a webgl context", () => {
    vi.spyOn(document, "createElement").mockReturnValue({
      getContext: () => ({}),
    } as unknown as HTMLCanvasElement);
    expect(hasWebGL()).toBe(true);
  });

  it("returns false when the canvas cannot produce a webgl context", () => {
    vi.spyOn(document, "createElement").mockReturnValue({
      getContext: () => null,
    } as unknown as HTMLCanvasElement);
    expect(hasWebGL()).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- lib/__tests__/webgl.test.ts`
Expected: FAIL — `Cannot find module '@/lib/webgl'`.

- [ ] **Step 3: Write `lib/webgl.ts`**

```typescript
export function hasWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return !!context;
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- lib/__tests__/webgl.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Write the failing test for diorama constants**

```typescript
import { describe, it, expect } from "vitest";
import { ROOM, MEZZANINE, PALETTE, CAMERA } from "@/lib/diorama";

describe("diorama constants", () => {
  it("matches the imported blueprint's room dimensions", () => {
    expect(ROOM).toEqual({ width: 7, height: 4.8, depth: 7 });
  });

  it("matches the blueprint's mezzanine split", () => {
    expect(MEZZANINE).toEqual({ y: 1.4, depth: 3.5 });
  });

  it("matches the blueprint's material palette", () => {
    expect(PALETTE.brick).toBe("#382010");
    expect(PALETTE.mezzanineFloor).toBe("#B08050");
    expect(PALETTE.sofa).toBe("#C09494");
    expect(PALETTE.furniture).toBe("#D2AE60");
    expect(PALETTE.warmLight).toBe("#FFB030");
  });

  it("matches the blueprint's camera position and look-at target", () => {
    expect(CAMERA.position).toEqual([14, 12, 14]);
    expect(CAMERA.lookAt).toEqual([3.5, 1, 3.5]);
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm run test -- lib/__tests__/diorama.test.ts`
Expected: FAIL — `Cannot find module '@/lib/diorama'`.

- [ ] **Step 7: Write `lib/diorama.ts`**

```typescript
export const ROOM = { width: 7, height: 4.8, depth: 7 } as const;

export const MEZZANINE = { y: 1.4, depth: 3.5 } as const;

export const PALETTE = {
  brick: "#382010",
  mezzanineFloor: "#B08050",
  sofa: "#C09494",
  furniture: "#D2AE60",
  warmLight: "#FFB030",
} as const;

export const CAMERA = {
  position: [14, 12, 14] as [number, number, number],
  lookAt: [3.5, 1, 3.5] as [number, number, number],
} as const;
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm run test -- lib/__tests__/diorama.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 9: Commit**

```bash
git add lib/webgl.ts lib/__tests__/webgl.test.ts lib/diorama.ts lib/__tests__/diorama.test.ts
git commit -m "Add WebGL detection and diorama constants"
```

---

### Task 10: Café scene-graph data + CafeModel

**Files:**
- Create: `components/diorama/cafeData.ts`
- Create: `components/diorama/CafeModel.tsx`
- Create: `components/diorama/__tests__/CafeModel.test.tsx`

**Interfaces:**
- Consumes: `PALETTE` (Task 9).
- Produces: `BoxSpec` type, `ROOM_SHELL`/`FLOOR`/`MEZZANINE_FLOOR`/`STAIRS`/`LOUNGE`/`BAR`/`TABLES`/`DELIVERY_BOT`/`DECOR` arrays (used only within this task). `CafeModel` component, no props (used by Task 11).

- [ ] **Step 1: Add `@react-three/test-renderer` to devDependencies (already in Task 1's package.json) — confirm install**

Run: `npm install`
Expected: `@react-three/test-renderer` present in `node_modules`.

- [ ] **Step 2: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import ReactThreeTestRenderer from "@react-three/test-renderer";
import { CafeModel } from "@/components/diorama/CafeModel";

describe("CafeModel", () => {
  it("renders every expected scene-graph group exactly once", async () => {
    const renderer = await ReactThreeTestRenderer.create(<CafeModel />);
    const graph = JSON.stringify(renderer.toGraph());

    const expectedGroups = [
      "room",
      "floor",
      "mezzanine",
      "stairs",
      "lounge",
      "bar",
      "tables",
      "deliveryBot",
      "decor",
    ];

    for (const name of expectedGroups) {
      expect(graph).toContain(`"${name}"`);
    }
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test -- components/diorama/__tests__/CafeModel.test.tsx`
Expected: FAIL — `Cannot find module '@/components/diorama/CafeModel'`.

- [ ] **Step 4: Write `components/diorama/cafeData.ts`**

```typescript
import { PALETTE } from "@/lib/diorama";

export interface BoxSpec {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}

export const ROOM_SHELL: BoxSpec[] = [
  { position: [3.5, 2.4, -0.1], size: [7, 4.8, 0.2], color: PALETTE.brick },
  { position: [-0.1, 2.4, 3.5], size: [0.2, 4.8, 7], color: PALETTE.brick },
];

export const FLOOR: BoxSpec[] = [{ position: [3.5, -0.1, 3.5], size: [7, 0.2, 7], color: "#1E1206" }];

export const MEZZANINE_FLOOR: BoxSpec[] = [
  { position: [3.5, 1.4, 1.75], size: [7, 0.14, 3.5], color: PALETTE.mezzanineFloor },
];

export const STAIRS: BoxSpec[] = Array.from({ length: 6 }, (_, i) => ({
  position: [5.0, (1.4 / 6) * i, 3.5 + 0.42 * (6 - i)] as [number, number, number],
  size: [1.6, 1.4 / 6 + 0.05, 0.45] as [number, number, number],
  color: "#C8A87A",
}));

export const LOUNGE: BoxSpec[] = [
  { position: [0.8, 1.83, 1.93], size: [1.0, 0.86, 2.9], color: PALETTE.sofa },
  { position: [2.4, 1.83, 0.86], size: [2.3, 0.86, 0.95], color: PALETTE.sofa },
  { position: [3.9, 1.83, 1.68], size: [0.9, 0.86, 2.6], color: PALETTE.sofa },
  { position: [2.25, 1.61, 1.9], size: [1.8, 0.42, 1.5], color: "#D4A0A8" },
];

export const BAR: BoxSpec[] = [
  { position: [5.8, 1.9, 0.98], size: [2.4, 1.0, 1.85], color: "#6A4A1E" },
  { position: [5.05, 2.15, 0.36], size: [0.52, 0.5, 0.48], color: "#242424" },
];

export const TABLES: BoxSpec[] = [
  { position: [1.25, 0.76, 4.1], size: [0.76, 0.07, 0.76], color: PALETTE.furniture },
  { position: [3.5, 0.76, 4.05], size: [0.76, 0.07, 0.76], color: PALETTE.furniture },
  { position: [5.6, 0.76, 4.0], size: [0.76, 0.07, 0.76], color: PALETTE.furniture },
  { position: [1.85, 0.76, 5.55], size: [0.76, 0.07, 0.76], color: PALETTE.furniture },
  { position: [4.3, 0.76, 5.5], size: [0.76, 0.07, 0.76], color: PALETTE.furniture },
];

export const DELIVERY_BOT: BoxSpec[] = [
  { position: [2.85, 0.04, 4.72], size: [0.6, 0.08, 0.6], color: "#4A5870" },
  { position: [2.85, 0.6, 4.72], size: [0.46, 1.05, 0.46], color: "#5C6A82" },
  { position: [2.85, 1.25, 4.72], size: [0.34, 0.25, 0.34], color: "#6A7890" },
];

export const DECOR: BoxSpec[] = [
  { position: [3.0, 2.9, -0.09], size: [3, 1.5, 0.02], color: "#1B2418" },
  { position: [0.15, 3.0, 1.45], size: [0.02, 1.85, 1.9], color: "#3A5880" },
  { position: [0.15, 2.68, 3.13], size: [0.02, 1.15, 0.95], color: "#9B4020" },
];
```

- [ ] **Step 5: Write `components/diorama/CafeModel.tsx`**

```tsx
import {
  ROOM_SHELL,
  FLOOR,
  MEZZANINE_FLOOR,
  STAIRS,
  LOUNGE,
  BAR,
  TABLES,
  DELIVERY_BOT,
  DECOR,
  type BoxSpec,
} from "./cafeData";
import { PALETTE } from "@/lib/diorama";

function Boxes({ specs }: { specs: BoxSpec[] }) {
  return (
    <>
      {specs.map((spec, i) => (
        <mesh key={i} position={spec.position}>
          <boxGeometry args={spec.size} />
          <meshStandardMaterial color={spec.color} roughness={0.9} metalness={0} flatShading />
        </mesh>
      ))}
    </>
  );
}

export function CafeModel() {
  return (
    <group name="cafe-model">
      <group name="room">
        <Boxes specs={ROOM_SHELL} />
      </group>
      <group name="floor">
        <Boxes specs={FLOOR} />
      </group>
      <group name="mezzanine">
        <Boxes specs={MEZZANINE_FLOOR} />
      </group>
      <group name="stairs">
        <Boxes specs={STAIRS} />
      </group>
      <group name="lounge">
        <Boxes specs={LOUNGE} />
      </group>
      <group name="bar">
        <Boxes specs={BAR} />
      </group>
      <group name="tables">
        <Boxes specs={TABLES} />
      </group>
      <group name="deliveryBot">
        <Boxes specs={DELIVERY_BOT} />
      </group>
      <group name="decor">
        <Boxes specs={DECOR} />
      </group>
      <pointLight position={[2.5, 4.8, 1.0]} color={PALETTE.warmLight} intensity={1.2} />
      <pointLight position={[5.0, 4.8, 1.0]} color={PALETTE.warmLight} intensity={1.2} />
      <pointLight position={[2.4, 4.8, 3.2]} color={PALETTE.warmLight} intensity={1.2} />
      <pointLight position={[5.2, 4.8, 3.4]} color={PALETTE.warmLight} intensity={1.2} />
    </group>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm run test -- components/diorama/__tests__/CafeModel.test.tsx`
Expected: PASS (1 test). If `toGraph()` does not serialize `name` the way expected, fall back to inspecting `renderer.scene` children directly via `renderer.scene.children.map(c => c.instance.name)` and adjust the assertion accordingly — the group names themselves (Step 5) are the source of truth, not the exact inspection method.

- [ ] **Step 7: Commit**

```bash
git add components/diorama/cafeData.ts components/diorama/CafeModel.tsx components/diorama/__tests__/CafeModel.test.tsx
git commit -m "Add café scene-graph data and CafeModel"
```

---

### Task 11: DioramaScene — camera, lights, limited orbit

**Files:**
- Create: `components/diorama/DioramaScene.tsx`
- Create: `components/diorama/__tests__/DioramaScene.test.tsx`

**Interfaces:**
- Consumes: `CafeModel` (Task 10), `CAMERA` (Task 9).
- Produces: `DioramaScene` component, no props (used by Task 12).

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import ReactThreeTestRenderer from "@react-three/test-renderer";
import { DioramaScene } from "@/components/diorama/DioramaScene";

describe("DioramaScene", () => {
  it("renders without throwing and includes the orthographic camera", async () => {
    const renderer = await ReactThreeTestRenderer.create(<DioramaScene />);
    const graph = JSON.stringify(renderer.toGraph());
    expect(graph.toLowerCase()).toContain("orthographiccamera");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- components/diorama/__tests__/DioramaScene.test.tsx`
Expected: FAIL — `Cannot find module '@/components/diorama/DioramaScene'`.

- [ ] **Step 3: Write `components/diorama/DioramaScene.tsx`**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import type * as THREE from "three";
import { CafeModel } from "./CafeModel";
import { CAMERA } from "@/lib/diorama";

function CameraRig() {
  const camRef = useRef<THREE.OrthographicCamera>(null);

  useEffect(() => {
    camRef.current?.lookAt(...CAMERA.lookAt);
  }, []);

  return <OrthographicCamera ref={camRef} makeDefault position={CAMERA.position} zoom={60} near={0.1} far={100} />;
}

export function DioramaScene() {
  return (
    <Canvas dpr={[1, 2]}>
      <ambientLight color="#3A2418" intensity={0.4} />
      <CameraRig />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2 - 0.35}
        maxPolarAngle={Math.PI / 2 + 0.1}
        minAzimuthAngle={-0.26}
        maxAzimuthAngle={0.26}
      />
      <CafeModel />
    </Canvas>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- components/diorama/__tests__/DioramaScene.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add components/diorama/DioramaScene.tsx components/diorama/__tests__/DioramaScene.test.tsx
git commit -m "Add DioramaScene with fixed-angle limited-orbit camera"
```

---

### Task 12: DioramaSection — fallback + code-split wrapper

**Files:**
- Create: `components/diorama/DioramaSection.tsx`
- Create: `components/diorama/__tests__/DioramaSection.test.tsx`
- Create: `public/diorama-fallback.png` (placeholder binary asset — see Step 3)

**Interfaces:**
- Consumes: `hasWebGL` (Task 9), `DioramaScene` (Task 11, dynamically imported).
- Produces: `DioramaSection` component, no props (used by Task 13).

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import * as webgl from "@/lib/webgl";

vi.mock("@/components/diorama/DioramaScene", () => ({
  DioramaScene: () => <div data-testid="diorama-scene-mock" />,
}));

describe("DioramaSection", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the 3D scene when WebGL is available", async () => {
    vi.spyOn(webgl, "hasWebGL").mockReturnValue(true);
    const { DioramaSection } = await import("@/components/diorama/DioramaSection");
    render(<DioramaSection />);
    await waitFor(() => expect(screen.getByTestId("diorama-scene-mock")).toBeInTheDocument());
  });

  it("renders the static fallback image when WebGL is unavailable", async () => {
    vi.spyOn(webgl, "hasWebGL").mockReturnValue(false);
    const { DioramaSection } = await import("@/components/diorama/DioramaSection");
    render(<DioramaSection />);
    await waitFor(() => expect(screen.getByAltText(/illustrated view of the café diorama/i)).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- components/diorama/__tests__/DioramaSection.test.tsx`
Expected: FAIL — `Cannot find module '@/components/diorama/DioramaSection'`.

- [ ] **Step 3: Add a placeholder fallback image**

Create `public/diorama-fallback.png` — any illustrated stand-in image of the café diorama (a simple exported still frame from the imported `Cafe 3D Diorama.dc.html` canvas works well here; grab it with a screenshot tool and save it at this path). This is a real asset requirement, not a code placeholder — the test only checks the `<img>` markup, not the file's pixel content.

- [ ] **Step 4: Write `components/diorama/DioramaSection.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { hasWebGL } from "@/lib/webgl";

const DioramaScene = dynamic(() => import("./DioramaScene").then((m) => m.DioramaScene), { ssr: false });

export function DioramaSection() {
  const [webglOk, setWebglOk] = useState<boolean | null>(null);

  useEffect(() => {
    setWebglOk(hasWebGL());
  }, []);

  if (webglOk === null) return null;

  return (
    <section className="relative h-[150vh] w-full bg-[#0B0608]">
      <div className="sticky top-0 h-screen w-full">
        {webglOk ? (
          <DioramaScene />
        ) : (
          <img
            src="/diorama-fallback.png"
            alt="Illustrated view of the café diorama"
            className="h-full w-full object-cover"
          />
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test -- components/diorama/__tests__/DioramaSection.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add components/diorama/DioramaSection.tsx components/diorama/__tests__/DioramaSection.test.tsx public/diorama-fallback.png
git commit -m "Add DioramaSection with WebGL fallback and code splitting"
```

---

### Task 13: Assemble the page

**Files:**
- Modify: `app/page.tsx`
- Create: `app/__tests__/page.test.tsx`

**Interfaces:**
- Consumes: `Hero` (Task 4), `DioramaSection` (Task 12), `LoveNoteFlow` (Task 8), `StickerFloat`/`tontonById` (Task 3).

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/diorama/DioramaSection", () => ({
  DioramaSection: () => <div data-testid="diorama-section-mock" />,
}));

import Home from "@/app/page";

describe("Home page", () => {
  it("renders the hero, diorama section, and love note flow in order", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/for you, amie/i);
    expect(screen.getByTestId("diorama-section-mock")).toBeInTheDocument();
    expect(screen.getByText(/a tiny delivery/i)).toBeInTheDocument();
  });

  it("includes at least one extra decorative sticker outside the love note flow", () => {
    render(<Home />);
    const stickers = screen.getAllByRole("img").filter((img) => img.getAttribute("alt")?.includes("Tonton") === false);
    expect(stickers.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- app/__tests__/page.test.tsx`
Expected: FAIL — current `app/page.tsx` only renders a bare `<h1>`, no diorama/love-note content.

- [ ] **Step 3: Rewrite `app/page.tsx`**

```tsx
import { Hero } from "@/components/Hero";
import { DioramaSection } from "@/components/diorama/DioramaSection";
import { LoveNoteFlow } from "@/components/lovenote/LoveNoteFlow";
import { StickerFloat } from "@/components/StickerFloat";
import { tontonById } from "@/lib/tonton";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <DioramaSection />
      <div className="relative">
        <div className="pointer-events-none absolute left-6 top-10 z-10">
          <StickerFloat sticker={tontonById("bella")} variant="twinkle" size={56} />
        </div>
        <div className="pointer-events-none absolute right-6 top-1/2 z-10">
          <StickerFloat sticker={tontonById("tobi")} variant="float-a" size={56} />
        </div>
        <LoveNoteFlow />
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- app/__tests__/page.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Run the full test suite and the production build**

Run: `npm run test`
Expected: all tests across every task pass.

Run: `npm run build`
Expected: build completes successfully.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/__tests__/page.test.tsx
git commit -m "Assemble hero, diorama, and love note flow into the page"
```

---

### Task 14: Manual QA and Vercel deploy

**Files:** none (verification-only task).

- [ ] **Step 1: Run the dev server**

Run: `npm run dev`
Expected: server starts on `http://localhost:3000` with no console errors.

- [ ] **Step 2: Manual walkthrough at mobile viewport**

Open `http://localhost:3000` in a browser resized to ~390×844 (iPhone-sized viewport, matching "mobile-first" from the spec). Confirm:
- Hero renders with headline, scroll hint, and one sticker.
- Scrolling into the diorama section shows the 3D café and responds to drag with a small limited orbit (no full spin, no zoom/pan).
- Continuing to scroll reaches the envelope; tapping it reveals the letter with both the date and girlfriend copy.
- Clicking either "Yes" button shows the celebration state with "It's official 💗" and the Date Plan card.
- All three Tonton stickers (shiba/cat/bunny) appear somewhere across the page, each also once as a standalone decorative sticker beyond its main flow role.

- [ ] **Step 3: Check `prefers-reduced-motion`**

In browser dev tools, enable "Emulate CSS prefers-reduced-motion: reduce" (Chrome DevTools → Rendering tab). Reload and confirm the floating/pulsing/dancing sticker and button animations stop, while the page otherwise still functions.

- [ ] **Step 4: Deploy to Vercel**

Run: `npx vercel --prod` (requires the user to authenticate their own Vercel account interactively — this step is run by the user, not automated). Confirm the deployed URL loads and repeats the Step 2 walkthrough on the live URL from a phone.

- [ ] **Step 5: Send the link**

No code change — hand the deployed URL to Amie.

---

## Self-Review Notes

- **Spec coverage:** Hero (Task 4), diorama (Tasks 9–12), love-note 3-state flow with edited copy (Tasks 5–8), Tonton sticker mapping + extra decorative placements (Tasks 3, 4, 13), `noindex`/mobile/no-photos constraints (Task 1, 14), reduced-motion (Task 1, 14), Vercel deploy (Task 14) — all covered.
- **Placeholder scan:** the only non-code placeholder is the fallback PNG asset in Task 12, which is an explicit real-asset-creation step (screenshot/export), not a deferred code stub.
- **Type consistency:** `TontonSticker["id"]` used consistently across Tasks 3, 4–8, 13; `BoxSpec` used consistently in Task 10; `CAMERA`/`PALETTE`/`ROOM`/`MEZZANINE` from Task 9 used identically in Tasks 10–11.

# DevToysWeb — Agent Notes

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build` (must pass both; typecheck-then-build)
- `npm run lint` — ESLint (react-hooks recommended rules + react-refresh)
- `npm run preview` — preview production build
- **Node must be on PATH**: `export PATH="/mnt/d/Program Files/nodejs:$PATH"` before any npm/npx command on this machine.

No test framework is configured.

## Architecture

- **Vite + React 19 + TypeScript** SPA (not Next.js). The other project is in `../source/`.
- **React Router v7** for `/:toolId` routes. Tool state persists across page refreshes.
- Path alias `@/` → `src/`, configured in `vite.config.ts` and `tsconfig.app.json`.
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin — no `tailwind.config.js`. Theme lives in `src/index.css` `@theme { }` blocks.
- **Dark mode**: `@custom-variant dark (&:is(.dark *));` enables `dark:` variant via `.dark` class on `<html>`. Plain CSS variables in `.dark {}` override `:root`. **Never use `@theme inline`** — it hardcodes values and breaks dark mode variable overrides.
- **shadcn/ui**: hand-maintained in `src/components/ui/` (not via CLI). `src/lib/utils.ts` has `cn()` (clsx + tailwind-merge).

## Tool System

- All tools registered in `src/tools/registry.ts` as `ToolDefinition` objects (`id`, `label`, `description`, `icon`, `component`).
- Tool directories: `src/tools/{converters,encoders,formatters,generators,text,extras,media,web}/`. Shared logic goes in `src/tools/extras/utils.ts`.
- Shared layouts: `EncoderDecoderLayout.tsx` (encode/decode with swap), `FormatterLayout.tsx` (format/minify with indent options).
- Shared UI: `src/components/ui/shared.tsx` → `Textarea`, `ReadOnlyTextarea`, `Select`. `src/components/ui/error-banner.tsx` → `ErrorBanner`. `src/hooks/useCopyToClipboard.ts` for copy buttons.
- Adding a new tool requires updating **5 places** (missing any causes silent breakage):
  1. Create component in the correct tool subdirectory
  2. Import + add `ToolDefinition` to `registry.ts`
  3. Add per-tool SEO metadata in `src/lib/seo.ts` (Helmet falls back to defaults otherwise)
  4. Add the toolId to the `toolIds` array in `vite.config.ts` (missing = no sitemap entry)
  5. Add translated label/desc keys in both `en` and `zh` objects in `src/i18n/locales.ts`, AND entries in the `toolLabelKeys` / `toolDescKeys` maps in `App.tsx` (these are separate from registry labels — they drive the sidebar/welcome page translations)

## SEO & Sitemap

- `src/lib/seo.ts` stores per-tool SEO metadata (title, description, keywords). Exported as `getSeoMeta(slug)` and `getHomepageSeoMeta()`.
- `react-helmet-async` is used in `main.tsx` (`<HelmetProvider>` wraps the app) and `App.tsx` (`<Helmet>` sets `<title>`, `<meta description>`, `<meta keywords>`, `<link canonical>`, `og:*`, `twitter:*` per tool).
- **JSON-LD structured data** is rendered in `App.tsx` inside `<Helmet>`: `WebSite` schema for homepage, `WebApplication` schema for tool pages (with `applicationCategory`, `operatingSystem`, `offers: price=0`).
- Sitemap is auto-generated at build time by a custom Vite plugin in `vite.config.ts`. The `toolIds` array there is **completely separate** from the registry — adding a new tool to registry but not to `toolIds` silently excludes it from the sitemap.
- **`public/robots.txt`** points to the sitemap and allows all crawlers.

## Cloudflare Pages Deployment

- `public/_redirects` — `/*  /index.html  200` is the SPA catch-all. **The `/*` rule previously intercepted `/sitemap.xml` and `/robots.txt`**, causing Google to report "Sitemap is HTML". Explicit rules for those paths must precede the catch-all.
- `public/_headers` — security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) and caching (immutable on `/assets/*`, short TTLs on sitemap/robots).
- `public/404.html` — Cloudflare Pages serves this for unmatched paths. It redirects to `/` so the SPA router takes over.
- Site deployed at `https://devtoysweb.cn` (hardcoded in `vite.config.ts`, `index.html`, `robots.txt`, and `App.tsx`). **`devtoysweb.pages.dev` is not a public endpoint** — all canonical URLs, OG tags, and sitemap reference `devtoysweb.cn`.

## TypeScript & ESLint Gotchas

These are enforced and will fail build or lint:

- **`noUnusedLocals` / `noUnusedParameters`** — unused imports/vars cause type errors. Remove them.
- **`verbatimModuleSyntax`** — type-only exports must use `export type { X }`, not `export { X }`.
- **`erasableSyntaxOnly`** — `enum` and `namespace` are banned; use `const` objects instead.
- **`react-hooks/static-components`** — never define a React component inside another component's render. Extract it to module scope.
- **`react-hooks/set-state-in-render`** — use `useState(() => compute())` lazy initializer instead of `useEffect(() => setState(compute()), [])`.
- **`react-hooks/set-state-in-effect`** — don't call `setState` synchronously inside `useEffect`. Use `useMemo` for derived state or `useCallback` for event-driven updates.
- **`react-hooks/refs`** — don't access or mutate `ref.current` during render. Move ref access into event handlers or effects.
- **`no-useless-assignment`** — don't assign a value to a `let` and then unconditionally reassign before reading. Use `const` or restructure.
- **`preserve-caught-error`** — when re-throwing, use `throw new Error(msg, { cause: e })`.
- **`filter(Boolean)` doesn't narrow** — use `.filter((t): t is T => t !== undefined)`.
- **Custom type declarations** for packages without `@types` go in `src/types/` (e.g., `xml-formatter.d.ts`).

## Key Conventions

- Default theme is dark (`.dark` on `<html>` in `App.tsx`).
- Font: Plus Jakarta Sans (Google Fonts import in `index.css`).
- Color palette: indigo primary (`#6366f1` light / `#818cf8` dark).
- Icons: `lucide-react` only (no emoji icons). Always verify the icon name exists before using.
- Sidebar: collapsible on desktop, drawer on mobile. Category labels use `text-[13px] font-semibold`. Tool items use `text-[13px] font-medium`. No uppercase or tracking-wide anywhere.
- "All Tools" link replaces "Recent" as the first sidebar item.
- No code comments unless explicitly requested.
- No `zustand`; state is `useState` + `localStorage`.
- i18n: `src/i18n/locales.ts` has `en` and `zh` translations. Use `useLocale()` hook to access `t(key)` for translated strings. New UI text must be added to both `en` and `zh` objects.

## Build Warning

- Chunk size >700KB warning is expected (all tools are in one bundle). Can be fixed later with `React.lazy` / dynamic imports.
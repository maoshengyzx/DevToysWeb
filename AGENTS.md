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
- Adding a new tool: (1) create component in the right directory, (2) import in `registry.ts`, (3) add `ToolDefinition` entry with a `lucide-react` icon.

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
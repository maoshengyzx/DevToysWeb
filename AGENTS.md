# DevToysWeb — Agent Notes

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build` (typecheck then build; must pass both)
- `npm run lint` — ESLint only
- `npm run preview` — preview production build

No test framework is configured yet.

## Architecture

- **Vite + React 19 + TypeScript** SPA (not Next.js). That project is in `../source/`.
- **React Router v7** for URL-based navigation (`/:toolId` routes). Tool state persists across page refreshes.
- Path alias `@/` → `src/`, configured in both `vite.config.ts` and `tsconfig.app.json`.
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin — no `tailwind.config.js`. Theme is defined inline in `src/index.css` using `@theme { }` blocks.
- **Dark mode**: `@custom-variant dark (&:is(.dark *));` in `index.css` enables Tailwind's `dark:` variant via `.dark` class on `<html>`. Plain CSS variables in `.dark {}` override `:root` theme. **Do not use `@theme inline`** — it hardcodes values and breaks dark mode variable overrides.
- **shadcn/ui components** are hand-maintained in `src/components/ui/` (not via CLI). `src/lib/utils.ts` provides the `cn()` utility (clsx + tailwind-merge).

## Tool System

- All tools are registered in `src/tools/registry.ts` as `ToolDefinition` objects with `id`, `label`, `description`, `icon`, `component`.
- Each tool category is defined as a `ToolCategory` with `title`, `icon`, and `tools[]`.
- Tool components live in `src/tools/{converters,encoders,formatters,generators,text,extras}/`.
- Shared layouts: `EncoderDecoderLayout.tsx` (encode/decode with swap), `FormatterLayout.tsx` (format/minify with indent options).
- Tools use real-time conversion (output updates on every keystroke), copy-to-clipboard, and localStorage for recent/favorites.

## Key Conventions

- Default theme is dark (`.dark` added on mount in `App.tsx`).
- Font: Plus Jakarta Sans (Google Fonts import in `index.css`).
- Color palette: indigo primary (`#6366f1` light / `#818cf8` dark).
- Icons: `lucide-react` (no emoji icons).
- Sidebar is collapsible on desktop, hidden with back button on mobile.
- `noUnusedLocals` and `noUnusedParameters` are enabled — unused imports cause build errors.

## Gotchas

- `tsconfig.app.json` has `ignoreDeprecations: "6.0"` because `baseUrl`/`paths` are deprecated in TS 7+. Needed for `@/` alias.
- Node is available at `/mnt/d/Program Files/nodejs/` on this machine. Add to `$PATH` before running npm/npx commands.
- Key dependencies: `js-yaml` (JSON↔YAML), `sql-formatter` (SQL formatting), `marked` (Markdown rendering), `react-router-dom` (routing).
- The `filter(Boolean)` pattern doesn't narrow types in strict TS — use `.filter((t): t is T => t !== undefined)` instead.
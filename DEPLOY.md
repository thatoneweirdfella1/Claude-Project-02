# DEPLOY — Step 12.3

Divergence.AI deploys as a single Vercel project: the Vite static build plus five
Edge Function API routes (`api/*.ts`), all same-origin so the browser never needs
CORS and never holds a provider API key.

## One-time Vercel setup (operator)

1. **Import the repo.** In the Vercel dashboard: New Project → Import Git
   Repository → `thatoneweirdfella1/claude-project-02`.
2. **Framework preset:** Vite (auto-detected). Defaults are correct and don't need
   overriding:
   - Build command: `npm run build` (runs `tsc -b && vite build`)
   - Output directory: `dist`
   - Install command: `npm install`
3. **Production branch:** set to `build`, not `main`. This repo's convention
   (CLAUDE.md) is that all work happens on `build`; nothing pushes to `main`
   automatically. Pointing Vercel's Production Branch at `build` means every
   push there ships, with no separate merge-to-main step required. (If a
   `main`-based release process is wanted instead, that's a separate decision —
   flag it and it can be set up as an explicit later step, not assumed here.)
4. **Environment variables** — add all five as encrypted secrets (Project
   Settings → Environment Variables), each server-side only, never exposed to
   the client bundle:

   | Variable | Consumed by | Provider |
   |---|---|---|
   | `ANTHROPIC_API_KEY` | `api/proxy.ts` | Anthropic (main pipeline: translation, routing, technique composition, answers) |
   | `OPENAI_API_KEY` | `api/proxy-openai.ts` | OpenAI (debate partner) |
   | `XAI_API_KEY` | `api/proxy-xai.ts` | xAI (debate partner) |
   | `DEEPSEEK_API_KEY` | `api/proxy-deepseek.ts` | DeepSeek (debate partner) |
   | `GOOGLE_API_KEY` | `api/proxy-google.ts` | Google (debate partner) |

   `api/fetch-url.ts` (URL-context fetch) needs no key.

5. **Deploy.** Vercel builds and assigns a `*.vercel.app` production URL.

## Why no vercel.json

Zero-config is intentional, not an oversight: Vercel auto-detects Vite for the
static build, and each `api/*.ts` file already declares
`export const config = { runtime: "edge" }` inline — that's how Vercel picks up
the Edge runtime per-route without a root config file. Adding a vercel.json here
would duplicate settings Vercel already infers correctly, the opposite of this
build's "don't add config for what's already handled" convention.

## Post-deploy verification (do this once the URL exists)

Confirm the full pipeline end to end against the live URL, not just that it
loads:
- Type a question, hit TRANSLATE & ASK, confirm a real streamed Claude answer
  (this is the first genuine network call in the entire build — every prior
  session ran in a no-network sandbox against stubs; see BUILD-LOG.md's
  standing "parked for 12.3" residuals).
- Trigger a Multi-AI debate action and confirm at least one partner responds
  (proves a second provider key resolves correctly, not just Anthropic's).
- Confirm State Detection pills populate from a real Haiku classification.
- Reload mid-session and confirm autosave restores (exercises IndexedDB on the
  real deployed origin, not just in tests).

Record the resulting URL and this checklist's outcome in BUILD-LOG.md — that's
Step 12.3's own DELIVERABLE requirement, not optional cleanup.

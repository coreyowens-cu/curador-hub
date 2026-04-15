# MarketingOS (curador-hub)

## What This Is
MarketingOS is a marketing operations platform for CURADOR Brands. It manages marketing strategy, campaigns, initiatives, brands, team coordination, digital asset management, and AI-assisted planning.

It is a standalone app being integrated into the broader CuradorOS ecosystem. It lives at `marketing.curadoros.com` (production) and `staging-marketing.curadoros.com` (staging).

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript + JSX (legacy components are .jsx, new code should be .ts/.tsx)
- **Styling:** Tailwind CSS v4
- **Auth:** NextAuth v5 with Google OAuth (restricted to @curadorbrands.com + individual allowlist)
- **Database:** PostgreSQL via Drizzle ORM
- **Deployment:** Railway (Nixpacks)
- **AI:** Claude API (Anthropic) via /api/claude route
- **Icons:** Lucide React

## Project Structure
```
app/
  layout.jsx          - Root layout with SessionProvider
  page.jsx            - Main app entry (MarketingHub + AIAssistant)
  login/page.jsx      - Google sign-in page
  campaign-timeline/  - Campaign timeline view
  api/
    auth/[...nextauth]/route.ts - NextAuth handler
    store/route.ts    - Key-value store API (PostgreSQL)
    claude/route.js   - AI chat proxy
components/
  MarketingHub.jsx    - Core marketing ops UI (7,751 lines - handle with care)
  DAMPanel.jsx        - Digital asset management panel
  AssetLibrary.jsx    - Asset browsing/organization
  AIAssistant.jsx     - AI chat sidebar
lib/
  auth.ts             - NextAuth v5 configuration
  db/
    index.ts          - Drizzle client
    schema.ts         - Database schema (users, kv_store)
    migrations/       - Drizzle migrations
  storage.js          - localStorage-based storage helper
  systemPrompt.js     - AI assistant system prompt
```

## Database
- **users** - Auth + identity. Fields: id (uuid), name, email, googleSub, role, marketingRole, active, imageUrl, deletedAt, createdAt
- **kv_store** - Shared state storage. Fields: key (PK), value (text/JSON), updatedAt, updatedBy

## Auth
- Google OAuth only, restricted to `@curadorbrands.com` domain + individual email allowlist
- Auto-creates user on first sign-in
- Blocks deactivated users (active=false or deletedAt set)
- Session includes: id, name, email, role, marketingRole
- First-time users pick a marketing role via MarketingHub's WhoModal

## Environments
| Env | URL | Branch | Railway Service |
|-----|-----|--------|-----------------|
| Staging | staging-marketing.curadoros.com | staging | marketingos-staging |
| Production | marketing.curadoros.com | main | marketingos-production |

## Branch Strategy
- Feature branches -> merge into `staging` -> test -> merge into `main`
- Never push to `upstream` (original repo: seanmatw-glitch/curador-hub)

## Key Patterns
- **localStorage is still primary storage** for MarketingHub state. The /api/store endpoint syncs shared keys to PostgreSQL. This is intentional for Phase 1 - Phase 2 migrates to proper relational tables.
- **Large components:** MarketingHub.jsx is 7,751 lines. Do not refactor unless explicitly asked. Make surgical edits only.
- **Dark theme:** Background #07070f, text #ede8df, muted #8a87a8, green accent #3bb54a, gold accent #c9a84c
- **Font:** DM Sans (body), use system monospace for code

## Commands
```bash
npm run dev          # Local dev server
npm run build        # Production build
npm run lint         # ESLint
npx drizzle-kit push # Push schema to database (local dev)
npx drizzle-kit generate # Generate migrations
```

## Before You Code
1. Read this file
2. Check the actual schema in lib/db/schema.ts
3. Check existing UI patterns in the component you're modifying
4. Check auth/session handling in lib/auth.ts
5. If touching MarketingHub.jsx, grep for the specific section - don't try to read the whole file

## Parent Platform
MarketingOS is being integrated into CuradorOS (curadoros.com). Phase 2 work includes shared database, unified auth, Hastronaut AI access, Domo integration, and eventual codebase absorption. All Phase 1 decisions should avoid blocking these future integrations.

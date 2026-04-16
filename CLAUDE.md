# curador-hub — MarketingOS

## What this project is

curador-hub is the codebase behind CuradorOS — Curador Brands' internal operating system.
This Claude Code project is connected to Curador's GitHub fork of the repository.

The **MarketingOS** section of the app handles Curador's marketing operations: campaign
tracking, content workflows, brand asset management, and related marketing intelligence.

Curador is a cannabis manufacturing company based in Missouri with two primary brands:
- **Headchange** — concentrates and hash holes
- **SafeBet** — vapes and infused pre-rolls/blunts (sub-brands: Bubbles fruity vapes, Airo licensed pod system)

---

## Environments

| Environment | Branch  | Purpose                                      |
|-------------|---------|----------------------------------------------|
| Staging     | staging | Testing — safe to break, developers only     |
| Production  | main    | Live app used by Curador's team every day    |

## Branch Strategy
- Feature branches -> merge into `staging` -> test -> merge into `main`
- Never push to `upstream` (original repo: seanmatw-glitch/curador-hub)

**Staging URL:** https://staging-marketing.curadoros.com
**Production URL:** https://marketing.curadoros.com

> Always deploy to **staging** first. Test. Then merge staging → main to go to production.
> Never push untested changes directly to main.

---

## Deployment

- Platform: **Railway** (not Vercel — that was the original dev setup)
- Deployments trigger automatically when you push to `staging` or `main`
- Environment variables are managed in the Railway dashboard under each service's Variables tab
- **Never commit secrets or env vars to the code** — they belong in Railway only

---

## Key environment variables

These live in Railway's dashboard. Do not put them in code or commit them to GitHub.
Ask CO (cowens@curadorbrands.com) if you need access to Railway to view or update them.

These are the exact variables in use (ask CO for the values):
- `ANTHROPIC_API_KEY` — Anthropic API key for Claude integration
- `AUTH_TRUST_HOST` — set to TRUE in Railway
- `DATABASE_URL` — Postgres connection string (Railway provides this automatically)
- `GOOGLE_CLIENT_ID` — Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` — Google OAuth client secret
- `NEXTAUTH_SECRET` — NextAuth session secret
- `NEXTAUTH_URL` — set to the environment's public URL (staging or production)

---

## MarketingOS — where to find things

- Main section directory: `/app/marketingos/` (or `/src/app/marketingos/`)
- Components specific to MarketingOS live under this path
- Shared components (used across the whole app) are likely in `/components/` or `/src/components/`
- API routes: `/app/api/` or `/pages/api/`

---

## How to run locally

```bash
npm install
npm run dev
```

App will be available at http://localhost:3000

If environment variables are needed locally, create a `.env.local` file in the project root.
**Do not commit `.env.local` to GitHub.** Ask CO for the values you need for local development.

---

## Key business context

**Brands:**
- **Headchange** — concentrates and hash holes
- **SafeBet** — vapes, infused pre-rolls, blunts
- **Bubbles** (fruity vapes), 
- **Airo** (licensed pod and AIO system)

**Decision-first mindset:**
- Features should answer: what action should we take?
- Avoid building things that are interesting but not actionable

---

## Git workflow

```bash
# Start work
git checkout staging
git pull

# Make changes with Claude Code, then commit
git add .
git commit -m "describe what you changed"

# Deploy to staging for testing
git push origin staging

# After testing, promote to production
git checkout main
git merge staging
git push origin main
```

---

## Things to know / gotchas

- This repo is a fork. The original was built and deployed to Vercel by the original dev.
  Curador's version runs on Railway. The code is the same; the infrastructure differs.
- CO (cowens@curadorbrands.com) is the primary contact for access, Railway credentials,
  environment variables, and questions about Curador's business context.
- If something breaks on production: revert first, fix second. Ping CO immediately.
- The `staging` branch is the safety net — it is expected and acceptable to break things there.

---

## Contact

**CO — Curador Brands**
cowens@curadorbrands.com

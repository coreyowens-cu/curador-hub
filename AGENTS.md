<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-rules -->
# MarketingOS Project Rules

- All new files must be TypeScript (.ts/.tsx). Existing .jsx files stay as-is unless explicitly being migrated.
- Never push to `upstream` remote. Only push to `origin` (coreyowens-cu/curador-hub).
- Never refactor MarketingHub.jsx, DAMPanel.jsx, AssetLibrary.jsx, or AIAssistant.jsx unless explicitly asked. These are large working components — make targeted edits only.
- Auth is required on all routes except /login and /api/auth/*. Use the middleware pattern.
- All /api routes must check session auth before processing.
- Database changes require a Drizzle migration. Run `npx drizzle-kit generate` after schema changes.
- Use the existing dark theme tokens (see CLAUDE.md) for any new UI work.
- Test on staging before merging to main.
<!-- END:project-rules -->

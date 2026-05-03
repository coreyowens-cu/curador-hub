/**
 * /app/api/claude/route.js
 * Server-side proxy for the Anthropic API.
 *
 * Hardening:
 *  - Requires an authenticated session (defense-in-depth beyond middleware)
 *  - Enforces same-origin requests (CSRF defense beyond SameSite=Lax)
 *  - Allowlists model + caps max_tokens + bounds total request body size
 *  - Rate-limits per user.id (in-memory; OK for single Railway instance)
 */

import { auth } from "@/lib/auth";
import { isOriginAllowed, rateLimit } from "@/lib/security";

const ALLOWED_MODELS = new Set([
  "claude-sonnet-4-20250514",
  "claude-sonnet-4-5",
  "claude-opus-4-5",
  "claude-haiku-4-5",
]);
const DEFAULT_MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS_CAP = 4096;
const MAX_BODY_BYTES = 1 * 1024 * 1024; // 1 MB request body
const RATE_LIMIT = 60; // requests
const RATE_WINDOW_MS = 5 * 60 * 1000; // per 5 minutes

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return json({ error: "Unauthorized" }, 401);
  }
  if (!isOriginAllowed(request)) {
    return json({ error: "Forbidden origin" }, 403);
  }

  const rl = rateLimit(`claude:${session.user.id}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!rl.ok) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded", retryAfterSec: rl.retryAfterSec }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(rl.retryAfterSec ?? 60),
        },
      }
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return json({ error: "Request body too large" }, 413);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json({ error: "ANTHROPIC_API_KEY not configured" }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  // Defensive size check on parsed body if Content-Length was missing/lying
  const bodyStr = JSON.stringify(body ?? {});
  if (Buffer.byteLength(bodyStr, "utf8") > MAX_BODY_BYTES) {
    return json({ error: "Request body too large" }, 413);
  }

  const requestedModel = typeof body.model === "string" ? body.model : DEFAULT_MODEL;
  const model = ALLOWED_MODELS.has(requestedModel) ? requestedModel : DEFAULT_MODEL;

  const requestedMax = Number(body.max_tokens);
  const max_tokens =
    Number.isFinite(requestedMax) && requestedMax > 0
      ? Math.min(requestedMax, MAX_TOKENS_CAP)
      : 2048;

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return json({ error: "messages array is required" }, 400);
  }

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "pdfs-2024-09-25",
      },
      body: JSON.stringify({
        model,
        max_tokens,
        system: body.system,
        messages: body.messages,
        ...(body.stream ? { stream: true } : {}),
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.text();
      return new Response(err, {
        status: anthropicRes.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (body.stream) {
      return new Response(anthropicRes.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    }

    const data = await anthropicRes.json();
    return json(data, 200);
  } catch (err) {
    console.error("[/api/claude] proxy error:", err);
    return json({ error: "Upstream error" }, 502);
  }
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

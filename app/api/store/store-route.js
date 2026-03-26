import { NextResponse } from "next/server";

// Use Vercel KV if available, otherwise fall back to a module-level Map
// The Map persists within a single serverless function instance
// For production persistence, run: npm install @vercel/kv
// Then add KV_URL and KV_REST_API_TOKEN to Vercel environment variables

let kv;
try {
  const vercelKv = await import("@vercel/kv");
  kv = vercelKv.kv;
} catch {
  // Fallback: module-level map (persists within warm function, resets on cold start)
  const globalStore = global.__curador_store || (global.__curador_store = new Map());
  kv = {
    get: async (key) => globalStore.get(key) ?? null,
    set: async (key, value) => { globalStore.set(key, value); return "OK"; },
    del: async (key) => { globalStore.delete(key); return 1; },
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  if (!key) return NextResponse.json({ error: "No key" }, { status: 400 });
  try {
    const value = await kv.get(key);
    return NextResponse.json({ key, value: value ?? null });
  } catch {
    return NextResponse.json({ key, value: null });
  }
}

export async function POST(request) {
  const { key, value } = await request.json();
  if (!key) return NextResponse.json({ error: "No key" }, { status: 400 });
  try {
    await kv.set(key, value);
    return NextResponse.json({ key, ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  try {
    await kv.del(key);
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ deleted: false });
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  if (!key) return NextResponse.json({ error: "No key" }, { status: 400 });
  try {
    const { data, error } = await supabase
      .from("kv_store")
      .select("value")
      .eq("key", key)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return NextResponse.json({ key, value: data?.value ?? null });
  } catch (e) {
    console.error("GET store error:", e);
    return NextResponse.json({ key, value: null });
  }
}

export async function POST(request) {
  const { key, value } = await request.json();
  if (!key) return NextResponse.json({ error: "No key" }, { status: 400 });
  try {
    const { error } = await supabase
      .from("kv_store")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw error;
    return NextResponse.json({ key, ok: true });
  } catch (e) {
    console.error("POST store error:", e);
    return NextResponse.json({ ok: false });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  try {
    await supabase.from("kv_store").delete().eq("key", key);
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ deleted: false });
  }
}

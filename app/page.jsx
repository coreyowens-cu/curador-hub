"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { storage } from "../lib/storage";

const MarketingHub = dynamic(() => import("../components/MarketingHub"), { ssr: false });
const AIAssistant = dynamic(() => import("../components/AIAssistant"), { ssr: false });

export default function Page() {
  const { data: session, status } = useSession();
  const [aiOpen, setAiOpen] = useState(false);
  const [hubState, setHubState] = useState({});

  useEffect(() => {
    window.storage = storage;
  }, []);

  const syncState = useCallback(async () => {
    try {
      const [s, i, co, br, ca, tm] = await Promise.all([
        storage.get("ns-strategy", true),
        storage.get("ns-initiatives", true),
        storage.get("ns-company", true),
        storage.get("ns-brands", true),
        storage.get("ns-campaigns", true),
        storage.get("ns-team", true),
      ]);
      setHubState({
        strategy:    s  ? JSON.parse(s.value)  : null,
        initiatives: i  ? JSON.parse(i.value)  : [],
        company:     co ? JSON.parse(co.value) : null,
        brands:      br ? JSON.parse(br.value) : null,
        campaigns:   ca ? JSON.parse(ca.value) : [],
        teamMembers: tm ? JSON.parse(tm.value) : [],
      });
    } catch {}
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    syncState();
    window.addEventListener("hub-updated", syncState);
    return () => window.removeEventListener("hub-updated", syncState);
  }, [status, syncState]);

  const handleAction = useCallback(async (action) => {
    if (!action?.type) return;
    const { type, payload } = action;
    switch (type) {
      case "ADD_INITIATIVE": {
        const existing = await storage.get("ns-initiatives", true);
        const list = existing ? JSON.parse(existing.value) : [];
        await storage.set("ns-initiatives", JSON.stringify([...list, {
          id: `init-ai-${Date.now()}`, title: payload.title || "Untitled",
          description: payload.description || "", owner: payload.owner || "Brand Team",
          channel: payload.channel || "06 · Social Media Strategy",
          brandId: payload.brandId || null, startDate: payload.startDate || "",
          endDate: payload.endDate || "", revolving: !!payload.revolving,
          fileUrl: null, fileName: null, _brief: null,
        }]), true);
        break;
      }
      case "ADD_CAMPAIGN": {
        const existing = await storage.get("ns-campaigns", true);
        const list = existing ? JSON.parse(existing.value) : [];
        await storage.set("ns-campaigns", JSON.stringify([{
          id: `cmp-ai-${Date.now()}`, title: payload.title || "Untitled",
          brand: payload.brand || "CÚRADOR", concept: payload.concept || "",
          status: payload.status || "brief", brief: payload.brief || null,
          createdAt: new Date().toISOString(),
        }, ...list]), true);
        break;
      }
      case "UPDATE_STRATEGY": {
        const existing = await storage.get("ns-strategy", true);
        const strat = existing ? JSON.parse(existing.value) : {};
        await storage.set("ns-strategy", JSON.stringify({ ...strat, ...payload }), true);
        break;
      }
      default: console.log("AI action:", type, payload);
    }
    window.dispatchEvent(new CustomEvent("hub-updated", { detail: { type } }));
  }, []);

  // Show nothing while loading session (middleware handles unauthenticated redirect)
  if (status === "loading") {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#07070f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#8a87a8", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>Loading...</div>
      </div>
    );
  }

  if (status !== "authenticated" || !session?.user) return null;

  return (
    <>
      <MarketingHub initialUserName={session.user.name} isSessionAdmin={session.user.isAdmin} />
      <AIAssistant hubState={hubState} onAction={handleAction} isOpen={aiOpen} onToggle={() => setAiOpen(o => !o)} />
    </>
  );
}

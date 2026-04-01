"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { storage } from "../lib/storage";

const MarketingHub = dynamic(() => import("../components/MarketingHub"), { ssr: false });
const AIAssistant = dynamic(() => import("../components/AIAssistant"), { ssr: false });

const SITE_PASSWORD = "curador2026";

function PasswordGate({ onUnlock }) {
  const [val, setVal] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [step, setStep] = useState("password"); // "password" | "name"
  const [selectedName, setSelectedName] = useState("");

  const attempt = () => {
    if (val.trim().toLowerCase() === SITE_PASSWORD) {
      sessionStorage.setItem("ch-auth", "1");
      setStep("name");
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setError(false), 2000);
      setVal("");
    }
  };

  const enterAs = () => {
    if (!selectedName) return;
    sessionStorage.setItem("ch-user", selectedName);
    onUnlock(selectedName);
  };

  return (
    <div style={{ position:"fixed",inset:0,background:"#07070f",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ marginBottom:40,textAlign:"center" }}>
        <div style={{ fontSize:32,fontWeight:700,letterSpacing:".14em",color:"#ede8df",textTransform:"uppercase",marginBottom:6 }}>
          C<span style={{ color:"#3bb54a" }}>Ú</span>RADOR
        </div>
        <div style={{ fontSize:11,letterSpacing:".22em",textTransform:"uppercase",color:"#8a87a8" }}>Marketing OS</div>
      </div>
      <div style={{ background:"#0d0d1a",border:"1px solid rgba(255,255,255,.08)",borderRadius:16,padding:"32px 36px",width:340,boxShadow:"0 24px 64px rgba(0,0,0,.5)",animation:shake?"shake .4s ease":"none" }}>
        {step === "password" ? (
          <>
            <div style={{ fontSize:14,color:"#ede8df",fontWeight:500,marginBottom:6 }}>Enter password to continue</div>
            <div style={{ fontSize:12,color:"#8a87a8",marginBottom:20 }}>This site is private to the CÚRADOR team.</div>
            <input type="password" value={val} autoFocus placeholder="Password"
              onChange={e => { setVal(e.target.value); setError(false); }}
              onKeyDown={e => e.key === "Enter" && attempt()}
              style={{ width:"100%",padding:"11px 14px",borderRadius:9,marginBottom:10,background:"rgba(255,255,255,.04)",border:`1px solid ${error?"#e07b6a":"rgba(255,255,255,.1)"}`,color:"#ede8df",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box" }} />
            {error && <div style={{ fontSize:11,color:"#e07b6a",marginBottom:8 }}>Incorrect password — try again.</div>}
            <button onClick={attempt} style={{ width:"100%",padding:"11px",borderRadius:9,border:"none",background:"linear-gradient(135deg,#c9a84c,#a07030)",color:"#07070f",fontFamily:"inherit",fontSize:13,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",cursor:"pointer" }}>Enter →</button>
          </>
        ) : (
          <>
            <div style={{ fontSize:14,color:"#ede8df",fontWeight:500,marginBottom:6 }}>What's your name?</div>
            <div style={{ fontSize:12,color:"#8a87a8",marginBottom:20 }}>Enter your name to continue.</div>
            <input type="text" value={selectedName} onChange={e => setSelectedName(e.target.value)} autoFocus
              placeholder="Your name"
              onKeyDown={e => e.key === "Enter" && enterAs()}
              style={{ width:"100%",padding:"11px 14px",borderRadius:9,marginBottom:14,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",color:"#ede8df",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box" }} />
            <button onClick={enterAs} disabled={!selectedName.trim()}
              style={{ width:"100%",padding:"11px",borderRadius:9,border:"none",background:selectedName.trim()?"linear-gradient(135deg,#c9a84c,#a07030)":"rgba(255,255,255,.06)",color:selectedName.trim()?"#07070f":"#8a87a8",fontFamily:"inherit",fontSize:13,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",cursor:selectedName.trim()?"pointer":"not-allowed",transition:"all .15s" }}>Continue →</button>
          </>
        )}
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}`}</style>
    </div>
  );
}

export default function Page() {
  const [unlocked, setUnlocked] = useState(false);
  const [userName, setUserName] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [hubState, setHubState] = useState({});

  useEffect(() => {
    window.storage = storage;
    if (sessionStorage.getItem("ch-auth") === "1") {
      setUnlocked(true);
      const saved = sessionStorage.getItem("ch-user");
      if (saved) setUserName(saved);
    }
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
    if (!unlocked) return;
    syncState();
    // Sync state for AI but DON'T remount MarketingHub
    window.addEventListener("hub-updated", syncState);
    return () => window.removeEventListener("hub-updated", syncState);
  }, [unlocked, syncState]);

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

  if (!unlocked) return <PasswordGate onUnlock={(name) => { window.storage = storage; setUserName(name); setUnlocked(true); }} />;

  return (
    <>
      <MarketingHub initialUserName={userName} />
      <AIAssistant hubState={hubState} onAction={handleAction} isOpen={aiOpen} onToggle={() => setAiOpen(o => !o)} />
    </>
  );
}

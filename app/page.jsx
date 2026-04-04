"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { storage } from "../lib/storage";

const MarketingHub = dynamic(() => import("../components/MarketingHub"), { ssr: false });
const AIAssistant = dynamic(() => import("../components/AIAssistant"), { ssr: false });

const SITE_PASSWORD = "curador2026";

// Matches colorForName in MarketingHub — same colors, same hash
const USER_COLORS = [
  {bg:"#e8c547",text:"#1a1400",label:"Amber"},
  {bg:"#7ec8a4",text:"#0a1f14",label:"Sage"},
  {bg:"#e07b6a",text:"#1f0b08",label:"Coral"},
  {bg:"#89a8e0",text:"#080f20",label:"Slate"},
  {bg:"#c47eb5",text:"#1a0b18",label:"Mauve"},
  {bg:"#68c4c4",text:"#062020",label:"Teal"},
  {bg:"#e09e5a",text:"#1f1008",label:"Ochre"},
  {bg:"#a8c46a",text:"#111a04",label:"Fern"},
];
function colorForName(n) { let h=0; for(let i=0;i<n.length;i++) h=(h*31+n.charCodeAt(i))%USER_COLORS.length; return USER_COLORS[h]; }
function initials(n) { return n.trim().split(/\s+/).map(w=>w[0]).join("").toUpperCase().slice(0,2); }

const GATE_ROLES = [
  {id:"ceo",          title:"CEO"},
  {id:"founder",      title:"Founder"},
  {id:"creative",     title:"Creative Director"},
  {id:"content",      title:"Content Creator"},
  {id:"coordinator",  title:"Marketing Coordinator"},
  {id:"sales",        title:"Sales Lead"},
  {id:"field",        title:"Field Team"},
  {id:"agencies",     title:"Agency Partner"},
  {id:"packaging",    title:"Packaging"},
  {id:"other",        title:"Other…"},
];

const INPUT_STYLE = { width:"100%", padding:"11px 14px", borderRadius:9, background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", color:"#ede8df", fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box" };
const BTN_GOLD = { width:"100%", padding:"11px", borderRadius:9, border:"none", background:"linear-gradient(135deg,#c9a84c,#a07030)", color:"#07070f", fontFamily:"inherit", fontSize:13, fontWeight:700, letterSpacing:".06em", textTransform:"uppercase", cursor:"pointer" };

function PasswordGate({ onUnlock }) {
  const [val, setVal]           = useState("");
  const [error, setError]       = useState(false);
  const [shake, setShake]       = useState(false);
  // steps: "password" | "select" | "create"
  const [step, setStep]         = useState("password");
  const [members, setMembers]   = useState([]);
  const [picked, setPicked]     = useState("");
  // create-new form
  const [newName, setNewName]     = useState("");
  const [newRole, setNewRole]     = useState("content");
  const [otherTitle, setOtherTitle] = useState("");

  const attempt = async () => {
    if (val.trim().toLowerCase() === SITE_PASSWORD) {
      sessionStorage.setItem("ch-auth", "1");
      try {
        // Check localStorage first, then fall back to Supabase
        let saved = [];
        const raw = localStorage.getItem("shared_ns_ns-team");
        if (raw) {
          saved = JSON.parse(raw);
        } else {
          try {
            const res = await fetch("/api/store?key=ns-team");
            const data = await res.json();
            if (data.value) {
              saved = JSON.parse(data.value);
              localStorage.setItem("shared_ns_ns-team", JSON.stringify(saved));
            }
          } catch {}
        }
        setMembers(saved);
        setStep(saved.length > 0 ? "select" : "create");
      } catch {
        setStep("create");
      }
    } else {
      setError(true); setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setError(false), 2000);
      setVal("");
    }
  };

  const selectAndEnter = () => {
    if (!picked) return;
    sessionStorage.setItem("ch-user", picked);
    // Also save to localStorage so MarketingHub skips its own identity modal
    const member = members.find(m => m.name === picked);
    if (member) {
      const color = member.color || colorForName(picked);
      try { localStorage.setItem("ns_ns-user", JSON.stringify({ name: picked, color, role: member.role || "content" })); } catch {}
    }
    onUnlock(picked);
  };

  const createAndEnter = () => {
    const name = newName.trim();
    if (!name) return;
    if (newRole === "other" && !otherTitle.trim()) return;
    const color = colorForName(name);
    const resolvedRole = newRole === "other" ? "other" : newRole;
    const resolvedTitle = newRole === "other" ? otherTitle.trim() : "";
    const member = { name, color, role: resolvedRole, title: resolvedTitle, bio: "", strengths: [], skills: [], keyPoints: [], joinedAt: new Date().toISOString() };
    // Save to shared team list (localStorage + Supabase)
    try {
      const raw = localStorage.getItem("shared_ns_ns-team");
      const existing = raw ? JSON.parse(raw) : [];
      const alreadyExists = existing.find(m => m.name.toLowerCase() === name.toLowerCase());
      const updated = alreadyExists
        ? existing.map(m => m.name.toLowerCase() === name.toLowerCase() ? { ...m, color, role: newRole } : m)
        : [...existing, member];
      localStorage.setItem("shared_ns_ns-team", JSON.stringify(updated));
      // Sync to Supabase so the card is visible to all users
      fetch("/api/store", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "ns-team", value: JSON.stringify(updated) }) }).catch(() => {});
    } catch {}
    sessionStorage.setItem("ch-user", name);
    // Also save to localStorage so MarketingHub skips its own identity modal
    try { localStorage.setItem("ns_ns-user", JSON.stringify({ name, color, role: resolvedRole })); } catch {}
    onUnlock(name);
  };

  const preview = newName.trim() ? colorForName(newName.trim()) : null;

  return (
    <div style={{ position:"fixed", inset:0, background:"#07070f", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif" }}>
      {/* Logo */}
      <div style={{ marginBottom:36, textAlign:"center" }}>
        <div style={{ fontSize:32, fontWeight:700, letterSpacing:".14em", color:"#ede8df", textTransform:"uppercase", marginBottom:6 }}>
          C<span style={{ color:"#3bb54a" }}>Ú</span>RADOR
        </div>
        <div style={{ fontSize:11, letterSpacing:".22em", textTransform:"uppercase", color:"#8a87a8" }}>Marketing OS</div>
      </div>

      <div style={{ background:"#0d0d1a", border:"1px solid rgba(255,255,255,.08)", borderRadius:16, padding:"32px 36px", width:360, boxShadow:"0 24px 64px rgba(0,0,0,.5)", animation:shake?"shake .4s ease":"none" }}>

        {/* ── STEP 1: Password ── */}
        {step === "password" && (
          <>
            <div style={{ fontSize:14, color:"#ede8df", fontWeight:600, marginBottom:4 }}>Enter password to continue</div>
            <div style={{ fontSize:12, color:"#8a87a8", marginBottom:20 }}>This site is private to the CÚRADOR team.</div>
            <input type="password" value={val} autoFocus placeholder="Password"
              onChange={e => { setVal(e.target.value); setError(false); }}
              onKeyDown={e => e.key === "Enter" && attempt()}
              style={{ ...INPUT_STYLE, marginBottom:10, border:`1px solid ${error?"#e07b6a":"rgba(255,255,255,.1)"}` }} />
            {error && <div style={{ fontSize:11, color:"#e07b6a", marginBottom:8 }}>Incorrect password — try again.</div>}
            <button onClick={attempt} style={BTN_GOLD}>Enter →</button>
          </>
        )}

        {/* ── STEP 2: Select existing member ── */}
        {step === "select" && (
          <>
            <div style={{ fontSize:14, color:"#ede8df", fontWeight:600, marginBottom:4 }}>Who are you?</div>
            <div style={{ fontSize:12, color:"#8a87a8", marginBottom:18 }}>Select your profile or create a new one.</div>

            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
              {members.map(m => {
                const c = m.color || colorForName(m.name);
                const active = picked === m.name;
                return (
                  <button key={m.name} onClick={() => setPicked(m.name)}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:10, border:`1px solid ${active?"#c9a84c":"rgba(255,255,255,.08)"}`, background:active?"rgba(201,168,76,.08)":"rgba(255,255,255,.03)", cursor:"pointer", transition:"all .13s", textAlign:"left" }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:c.bg, color:c.text, display:"grid", placeItems:"center", fontSize:13, fontWeight:700, flexShrink:0 }}>{initials(m.name)}</div>
                    <div>
                      <div style={{ fontSize:13, color:"#ede8df", fontWeight:600 }}>{m.name}</div>
                      <div style={{ fontSize:11, color:"#8a87a8" }}>{GATE_ROLES.find(r=>r.id===m.role)?.title || m.role || "Team Member"}</div>
                    </div>
                    {active && <div style={{ marginLeft:"auto", color:"#c9a84c", fontSize:16 }}>✓</div>}
                  </button>
                );
              })}
            </div>

            <button onClick={selectAndEnter} disabled={!picked}
              style={{ ...BTN_GOLD, marginBottom:10, opacity:picked?1:.45, cursor:picked?"pointer":"not-allowed" }}>
              Enter as {picked || "…"} →
            </button>

            <button onClick={() => { setStep("create"); setNewName(""); setNewRole("content"); }}
              style={{ width:"100%", padding:"9px", borderRadius:9, border:"1px solid rgba(255,255,255,.1)", background:"transparent", color:"#8a87a8", fontFamily:"inherit", fontSize:12, cursor:"pointer", letterSpacing:".04em" }}>
              + Create new profile
            </button>
          </>
        )}

        {/* ── STEP 3: Create new team member ── */}
        {step === "create" && (
          <>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
              {members.length > 0 && (
                <button onClick={() => setStep("select")} style={{ background:"none", border:"none", color:"#8a87a8", cursor:"pointer", fontSize:18, padding:0, lineHeight:1 }}>←</button>
              )}
              <div>
                <div style={{ fontSize:14, color:"#ede8df", fontWeight:600 }}>Create your profile</div>
                <div style={{ fontSize:12, color:"#8a87a8" }}>You'll appear on the team board.</div>
              </div>
            </div>

            {/* Avatar preview */}
            <div style={{ textAlign:"center", marginBottom:16 }}>
              <div style={{ width:52, height:52, borderRadius:"50%", background:preview?preview.bg:"rgba(255,255,255,.08)", color:preview?preview.text:"#8a87a8", display:"grid", placeItems:"center", fontSize:preview?18:22, fontWeight:700, margin:"0 auto", border:"2px solid rgba(255,255,255,.06)", transition:"all .2s" }}>
                {preview ? initials(newName.trim()) : "👤"}
              </div>
            </div>

            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, color:"#8a87a8", letterSpacing:".06em", textTransform:"uppercase", marginBottom:6 }}>Your Name</div>
              <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && createAndEnter()}
                placeholder="e.g. Jordan Lee"
                style={{ ...INPUT_STYLE }} />
            </div>

            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:11, color:"#8a87a8", letterSpacing:".06em", textTransform:"uppercase", marginBottom:8 }}>Your Role</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                {GATE_ROLES.map(r => (
                  <button key={r.id} onClick={() => setNewRole(r.id)}
                    style={{ padding:"8px 10px", borderRadius:8, border:`1px solid ${newRole===r.id?"#c9a84c":"rgba(255,255,255,.08)"}`, background:newRole===r.id?"rgba(201,168,76,.1)":"rgba(255,255,255,.02)", color:newRole===r.id?"#c9a84c":"#8a87a8", fontFamily:"inherit", fontSize:11, cursor:"pointer", textAlign:"left", fontWeight:newRole===r.id?600:400, transition:"all .12s" }}>
                    {r.title}
                  </button>
                ))}
              </div>
              {newRole === "other" && (
                <input
                  autoFocus
                  value={otherTitle}
                  onChange={e => setOtherTitle(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && createAndEnter()}
                  placeholder="Enter your title…"
                  style={{ ...INPUT_STYLE, marginTop:8, fontSize:13 }}
                />
              )}
            </div>

            <button onClick={createAndEnter}
              disabled={!newName.trim() || (newRole === "other" && !otherTitle.trim())}
              style={{ ...BTN_GOLD, opacity:(newName.trim() && (newRole !== "other" || otherTitle.trim()))?1:.45, cursor:(newName.trim() && (newRole !== "other" || otherTitle.trim()))?"pointer":"not-allowed" }}>
              Join Team →
            </button>
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

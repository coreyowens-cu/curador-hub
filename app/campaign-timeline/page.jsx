"use client";
import { useState, useEffect, useRef } from "react";

/* ── helpers ── */
function fmtDate(d) {
  if (!d) return "";
  try {
    const dt = new Date(d + "T12:00:00");
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
  } catch { return d; }
}

function fmtCost(v) {
  const n = parseFloat(String(v).replace(/[^0-9.]/g, "")) || 0;
  if (n === 0) return "$0";
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function totalCost(entry) {
  const base = parseFloat(String(entry.cost).replace(/[^0-9.]/g, "")) || 0;
  const elTotal = (entry.elements || []).reduce((s, el) => s + (parseFloat(String(el.cost).replace(/[^0-9.]/g, "")) || 0), 0);
  return base + elTotal;
}

/* ── Timeline component (standalone) ── */
function TimelineGrid({ campaignTimeline, setCampaignTimeline, brands }) {
  const dragRef = useRef(null);

  const now = new Date();
  const windowStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const months = [];
  for (let m = 0; m < 12; m++) {
    const d = new Date(windowStart.getFullYear(), windowStart.getMonth() + m, 1);
    months.push(d);
  }
  const rangeStart = months[0].getTime();
  const rangeEnd = new Date(months[11].getFullYear(), months[11].getMonth() + 1, 0, 23, 59, 59).getTime();
  const rangeDur = rangeEnd - rangeStart || 1;

  const dateToPercent = (dateStr) => {
    if (!dateStr) return 0;
    const t = new Date(dateStr + "T12:00:00").getTime();
    return Math.max(0, Math.min(100, ((t - rangeStart) / rangeDur) * 100));
  };
  const percentToDate = (pct) => {
    const t = rangeStart + (pct / 100) * rangeDur;
    return new Date(t).toISOString().slice(0, 10);
  };

  const updateEntry = (id, patch) => setCampaignTimeline(p => p.map(e => e.id === id ? { ...e, ...patch } : e));
  const updateElement = (entryId, elId, patch) => setCampaignTimeline(p => p.map(e => e.id !== entryId ? e : { ...e, elements: e.elements.map(el => el.id === elId ? { ...el, ...patch } : el) }));
  const deleteElement = (entryId, elId) => setCampaignTimeline(p => p.map(e => e.id !== entryId ? e : { ...e, elements: e.elements.filter(el => el.id !== elId) }));
  const addElement = (entryId) => {
    setCampaignTimeline(p => p.map(e => {
      if (e.id !== entryId) return e;
      return { ...e, elements: [...e.elements, { id: `el-${Date.now()}`, label: "New Element", startDate: e.startDate, endDate: e.endDate, cost: 0 }] };
    }));
  };

  const startDrag = (e, entryId, elId, handle) => {
    e.preventDefault();
    const track = e.currentTarget.closest(".po-bar-track");
    if (!track) return;
    const rect = track.getBoundingClientRect();
    dragRef.current = { entryId, elId, handle, rect };
    const onMove = (mv) => {
      if (!dragRef.current) return;
      const { entryId: eid, elId: kid, handle: h, rect: r } = dragRef.current;
      const rawPct = ((mv.clientX - r.left) / r.width) * 100;
      const pct = Math.max(0, Math.min(100, rawPct));
      const newDate = percentToDate(pct);
      if (kid) {
        setCampaignTimeline(p => p.map(en => {
          if (en.id !== eid) return en;
          return { ...en, elements: en.elements.map(el => {
            if (el.id !== kid) return el;
            if (h === "start") { const ep = dateToPercent(el.endDate); if (pct >= ep) return el; return { ...el, startDate: newDate }; }
            else { const sp = dateToPercent(el.startDate); if (pct <= sp) return el; return { ...el, endDate: newDate }; }
          })};
        }));
      } else {
        setCampaignTimeline(p => p.map(en => {
          if (en.id !== eid) return en;
          if (h === "start") { const ep = dateToPercent(en.endDate); if (pct >= ep) return en; return { ...en, startDate: newDate }; }
          else { const sp = dateToPercent(en.startDate); if (pct <= sp) return en; return { ...en, endDate: newDate }; }
        }));
      }
    };
    const onUp = () => { dragRef.current = null; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const renderBar = (color, startDate, endDate, entryId, elId = null) => {
    const leftPct = dateToPercent(startDate);
    const rightPct = dateToPercent(endDate);
    const widthPct = Math.max(0.5, rightPct - leftPct);
    const barColor = elId ? color + "bb" : color;
    return (
      <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", left: `${leftPct}%`, width: `${widthPct}%`, height: elId ? 16 : 24, borderRadius: elId ? 4 : 5, background: barColor, display: "flex", alignItems: "center", userSelect: "none", opacity: elId ? 0.85 : 1 }}>
        <div onMouseDown={e => startDrag(e, entryId, elId, "start")} style={{ position: "absolute", left: -1, top: 0, bottom: 0, width: 10, cursor: "ew-resize", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, background: "rgba(0,0,0,.25)", borderRadius: "4px 0 0 4px" }}>
          <div style={{ width: 2, height: 12, background: "rgba(255,255,255,.55)", borderRadius: 1 }} />
        </div>
        <div onMouseDown={e => startDrag(e, entryId, elId, "end")} style={{ position: "absolute", right: -1, top: 0, bottom: 0, width: 10, cursor: "ew-resize", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, background: "rgba(0,0,0,.25)", borderRadius: "0 4px 4px 0" }}>
          <div style={{ width: 2, height: 12, background: "rgba(255,255,255,.55)", borderRadius: 1 }} />
        </div>
      </div>
    );
  };

  if (campaignTimeline.length === 0) {
    return (
      <div style={{ padding: "64px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 14, opacity: .3 }}>📅</div>
        <div style={{ fontSize: 16, color: "#8a87a8" }}>No timeline entries yet</div>
        <div style={{ fontSize: 13, color: "#8a87a8", marginTop: 6 }}>Add campaigns in the main hub to populate the timeline</div>
      </div>
    );
  }

  const LABEL_W = 300;
  const COST_W = 150;
  const STRIPE = "rgba(255,255,255,.008)";
  const BORDER = "rgba(255,255,255,.07)";
  const BORDER2 = "rgba(255,255,255,.04)";

  return (
    <div style={{ display: "flex", flexDirection: "column", background: "#0d0d1a", border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, background: "#0d0d1a", position: "sticky", top: 0, zIndex: 5 }}>
        <div style={{ width: LABEL_W, flexShrink: 0, padding: "11px 18px", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#8a87a8", fontWeight: 500, borderRight: `1px solid ${BORDER}` }}>Campaign</div>
        <div style={{ width: COST_W, flexShrink: 0, padding: "11px 16px", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "#8a87a8", fontWeight: 500, textAlign: "right", borderRight: `1px solid ${BORDER}` }}>Budget</div>
        <div style={{ flex: 1, display: "flex" }}>
          {months.map((m, i) => (
            <div key={i} style={{ flex: 1, padding: "11px 0", fontSize: 11, textAlign: "center", color: "#8a87a8", letterSpacing: ".06em", textTransform: "uppercase", borderRight: i < 11 ? `1px solid ${BORDER2}` : "none", fontWeight: 500 }}>
              {m.toLocaleString("en", { month: "short" })} <span style={{ opacity: .5 }}>{String(m.getFullYear()).slice(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      {campaignTimeline.map(entry => {
        const brand = Object.values(brands).find(b => b.name === entry.brand);
        const color = entry.color || brand?.color || "#c9a84c";
        const tc = totalCost(entry);
        return (
          <div key={entry.id}>
            {/* Campaign row */}
            <div style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${BORDER2}`, minHeight: 60, borderLeft: `3px solid ${color}` }}>
              <div style={{ width: LABEL_W, flexShrink: 0, padding: "10px 18px", borderRight: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 9, minHeight: "inherit" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 14, fontWeight: 500, color: "#ede8df", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={entry.title}>{entry.title}</span>
                <button onClick={() => addElement(entry.id)} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, border: "1px dashed rgba(255,255,255,.1)", background: "transparent", color: "#8a87a8", cursor: "pointer", flexShrink: 0 }}>+</button>
              </div>
              <div style={{ width: COST_W, flexShrink: 0, borderRight: `1px solid ${BORDER}`, padding: "5px 14px", textAlign: "right" }}>
                {tc > 0 && <div style={{ fontSize: 10, color: "#8a87a8", marginBottom: 2 }}>{fmtCost(tc)}</div>}
                <input value={entry.cost || ""} onChange={e => updateEntry(entry.id, { cost: e.target.value })} placeholder="$0"
                  style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "#c9a84c", fontFamily: "inherit", fontSize: 14, fontWeight: 600, textAlign: "right" }} />
              </div>
              <div className="po-bar-track" style={{ flex: 1, position: "relative", height: "100%", minHeight: 60, cursor: "default", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", pointerEvents: "none" }}>
                  {months.map((_, i) => <div key={i} style={{ flex: 1, borderRight: i < 11 ? `1px solid ${BORDER2}` : "none", background: i % 2 === 1 ? STRIPE : "transparent" }} />)}
                </div>
                {entry.startDate && entry.endDate && renderBar(color, entry.startDate, entry.endDate, entry.id)}
                {entry.startDate && entry.endDate && (
                  <div style={{ position: "absolute", bottom: 3, left: `${dateToPercent(entry.startDate)}%`, fontSize: 10, color: "#8a87a8", pointerEvents: "none", whiteSpace: "nowrap", paddingLeft: 5 }}>
                    {fmtDate(entry.startDate)} – {fmtDate(entry.endDate)}
                  </div>
                )}
              </div>
            </div>

            {/* Element rows */}
            {(entry.elements || []).map(el => (
              <div key={el.id} style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${BORDER2}`, minHeight: 48, borderLeft: `3px solid ${color}55`, background: "rgba(255,255,255,.005)" }}>
                <div style={{ width: LABEL_W, flexShrink: 0, padding: "8px 18px 8px 36px", borderRight: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8, minHeight: "inherit" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, opacity: .5, flexShrink: 0 }} />
                  <input value={el.label} onChange={e => updateElement(entry.id, el.id, { label: e.target.value })}
                    style={{ background: "transparent", border: "none", outline: "none", color: "#a09dbf", fontFamily: "inherit", fontSize: 13, flex: 1 }} />
                  <button onClick={() => deleteElement(entry.id, el.id)} style={{ width: 22, height: 22, borderRadius: 4, border: "1px solid rgba(224,123,106,.25)", background: "transparent", color: "rgba(224,123,106,.5)", cursor: "pointer", fontSize: 12, display: "grid", placeItems: "center", flexShrink: 0 }}>×</button>
                </div>
                <div style={{ width: COST_W, flexShrink: 0, borderRight: `1px solid ${BORDER}`, padding: "5px 14px", textAlign: "right" }}>
                  <input value={el.cost || ""} onChange={e => updateElement(entry.id, el.id, { cost: e.target.value })} placeholder="$0"
                    style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "#c9a84c", fontFamily: "inherit", fontSize: 13, fontWeight: 600, textAlign: "right" }} />
                </div>
                <div className="po-bar-track" style={{ flex: 1, position: "relative", height: "100%", minHeight: 48, overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, display: "flex", pointerEvents: "none" }}>
                    {months.map((_, i) => <div key={i} style={{ flex: 1, borderRight: i < 11 ? `1px solid ${BORDER2}` : "none", background: i % 2 === 1 ? STRIPE : "transparent" }} />)}
                  </div>
                  {el.startDate && el.endDate && renderBar(color, el.startDate, el.endDate, entry.id, el.id)}
                  {el.startDate && el.endDate && (
                    <div style={{ position: "absolute", bottom: 2, left: `${dateToPercent(el.startDate)}%`, fontSize: 9, color: "#8a87a8", pointerEvents: "none", whiteSpace: "nowrap", paddingLeft: 4 }}>
                      {fmtDate(el.startDate)} – {fmtDate(el.endDate)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* ── Page ── */
export default function CampaignTimelinePage() {
  const [campaignTimeline, setCampaignTimeline] = useState([]);
  const [brands, setBrands] = useState({});
  const [loaded, setLoaded] = useState(false);

  // Load data from localStorage (same origin as the hub)
  useEffect(() => {
    try {
      const ctlRaw = localStorage.getItem("shared_ns_ns-camp-timeline");
      if (ctlRaw) setCampaignTimeline(JSON.parse(ctlRaw));
    } catch {}
    try {
      const brRaw = localStorage.getItem("shared_ns_ns-brands");
      if (brRaw) setBrands(JSON.parse(brRaw));
    } catch {}
    setLoaded(true);
  }, []);

  // Persist changes back to localStorage so they sync if the main window refreshes
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem("shared_ns_ns-camp-timeline", JSON.stringify(campaignTimeline)); } catch {}
  }, [campaignTimeline, loaded]);

  return (
    <div style={{ minHeight: "100vh", background: "#07070f", color: "#ede8df", fontFamily: "'DM Sans', sans-serif", padding: 0, margin: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 32px", borderBottom: "1px solid rgba(255,255,255,.07)", background: "#0a0a14" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: ".14em", color: "#ede8df", textTransform: "uppercase" }}>
            C<span style={{ color: "#3bb54a" }}>Ú</span>RADOR
          </div>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,.1)" }} />
          <div style={{ fontSize: 13, color: "#8a87a8", letterSpacing: ".08em" }}>📅 Campaign Timeline</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 11, color: "#8a87a8" }}>
            {campaignTimeline.length} campaign{campaignTimeline.length !== 1 ? "s" : ""}
          </div>
          <button onClick={() => window.close()} style={{ padding: "5px 14px", borderRadius: 7, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "#8a87a8", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>
            Close
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ padding: "28px 32px" }}>
        {loaded && (
          <TimelineGrid
            campaignTimeline={campaignTimeline}
            setCampaignTimeline={setCampaignTimeline}
            brands={brands}
          />
        )}
      </div>

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 3px; }
        input::placeholder { color: #5a5880; }
      `}</style>
    </div>
  );
}

"use client";
import { useState, useEffect, useCallback, useRef } from "react";

// ════════════════════════════════════════════════════════════════════════════
// ASSET LIBRARY — native hub component
// ════════════════════════════════════════════════════════════════════════════

const DAM_ASSET_CATS = [
  { id:"all",        label:"All Assets",          icon:"◈" },
  { id:"logo",       label:"Logos & Brand ID",    icon:"◉" },
  { id:"photo",      label:"Photography",          icon:"⬚" },
  { id:"photo-product",   label:"Product Photography", icon:"📷", sub:true, parent:"photo" },
  { id:"photo-lifestyle", label:"Lifestyle",           icon:"🌿", sub:true, parent:"photo" },
  { id:"social-img", label:"Social Media Images",  icon:"▣" },
  { id:"social-vid", label:"Social / Video",       icon:"▶" },
  { id:"event",      label:"Events",               icon:"🎪" },
  { id:"event-photo", label:"Photography",         icon:"📷", sub:true, parent:"event" },
  { id:"event-video", label:"Videos",              icon:"🎬", sub:true, parent:"event" },
  { id:"print",          label:"Retail Assets",          icon:"🏪" },
  { id:"print-display",  label:"Displays",               icon:"🖼", sub:true, parent:"print" },
  { id:"print-sticker",  label:"Stickers",               icon:"🏷", sub:true, parent:"print" },
  { id:"print-info",     label:"Product Info Cards",      icon:"📇", sub:true, parent:"print" },
  { id:"print-poster",   label:"Posters",                icon:"📰", sub:true, parent:"print" },
  { id:"print-video",    label:"Video",                  icon:"🎬", sub:true, parent:"print" },
  { id:"education",  label:"Budtender Education",  icon:"◎" },
  { id:"menu",       label:"Menu Assets",          icon:"≡" },
  { id:"web",            label:"Website / Digital",    icon:"⬡" },
  { id:"web-newsletter", label:"Newsletter",           icon:"📧", sub:true, parent:"web" },
  { id:"web-ads",        label:"Digital Ads",           icon:"📢", sub:true, parent:"web" },
  { id:"brief",      label:"Briefs & Docs",        icon:"▤" },
  { id:"concept",    label:"HTML Concepts",        icon:"✦" },
];

const DAM_MERCH_CATS = [
  { id:"merch",          label:"Merch",    icon:"🛍" },
  { id:"merch-tee",      label:"Tees",     icon:"👕" },
  { id:"merch-hoodie",   label:"Hoodies",  icon:"🧥" },
  { id:"merch-hat",      label:"Hats",     icon:"🧢" },
  { id:"merch-sticker",  label:"Stickers", icon:"🏷" },
  { id:"merch-lanyard",  label:"Lanyards", icon:"🪪" },
  { id:"merch-other",    label:"Other",    icon:"✦" },
];

// Brand-specific packaging subcategories
const DAM_PACKAGING = {
  headchange: [
    { id:"pkg-hc-conc-box",    label:"Concentrate Box" },
    { id:"pkg-hc-conc-case",   label:"Concentrate Case" },
    { id:"pkg-hc-box-sticker", label:"Box Sticker" },
    { id:"pkg-hc-jar-wrap",    label:"Jar Wrap" },
    { id:"pkg-hc-jar-lid",     label:"Jar Lid" },
    { id:"pkg-hc-jar-qr",      label:"Jar QR" },
    { id:"pkg-hc-510-cart",    label:"510 Cart Package" },
    { id:"pkg-hc-510-case",    label:"510 Cart Case" },
    { id:"pkg-hc-aio-cart",    label:"All-in-One Cart Package" },
    { id:"pkg-hc-aio-case",    label:"All-in-One Cart Case" },
    { id:"pkg-hc-lr-cart",       label:"Live Rosin Cart" },
    { id:"pkg-hc-lresin-aio",   label:"Live Resin AIO" },
    { id:"pkg-hc-lrosin-aio",   label:"Live Rosin AIO" },
    { id:"pkg-hc-mini-hash",    label:"Mini Hash Holes" },
  ],
  safebet: [
    { id:"pkg-sb-preroll",     label:"Pre-Roll Package" },
    { id:"pkg-sb-510-cart",    label:"510 Cart Package" },
    { id:"pkg-sb-510-case",    label:"510 Cart Case" },
    { id:"pkg-sb-aio-cart",    label:"All-in-One Cart Package" },
    { id:"pkg-sb-aio-case",    label:"All-in-One Cart Case" },
    { id:"pkg-sb-feco",        label:"FECO Package" },
    { id:"pkg-sb-feco-case",   label:"FECO Case" },
    { id:"pkg-sb-qr-sticker",  label:"QR Sticker" },
    { id:"pkg-sb-inf-preroll",      label:"Infused Pre Rolls" },
    { id:"pkg-sb-bubble-inf",       label:"Bubble Hash Infused" },
    { id:"pkg-sb-lresin-inf",       label:"Live Resin Infused" },
    { id:"pkg-sb-diamond-inf",      label:"Diamond Infused" },
    { id:"pkg-sb-1g-aio",           label:"Safe Bet 1g All in One" },
    { id:"pkg-sb-feco-cbn",         label:"FECO Plus CBN" },
    { id:"pkg-sb-1g-blunt",         label:"1g Blunt" },
    { id:"pkg-sb-1g-bubble-blunt",  label:"1g Bubble Hash Infused Blunt" },
  ],
  bubbles: [
    { id:"pkg-bub-sku1",       label:"Cart SKU 1 Package" },
    { id:"pkg-bub-sku1-case",  label:"Cart SKU 1 Case" },
    { id:"pkg-bub-sku2",       label:"Cart SKU 2 Package" },
    { id:"pkg-bub-sku2-case",  label:"Cart SKU 2 Case" },
    { id:"pkg-bub-sku3",       label:"Cart SKU 3 Package" },
    { id:"pkg-bub-sku3-case",  label:"Cart SKU 3 Case" },
    { id:"pkg-bub-sku4",       label:"Cart SKU 4 Package" },
    { id:"pkg-bub-sku4-case",  label:"Cart SKU 4 Case" },
  ],
  // all brands combined (shown when activeBrand === "all")
  all: [],
};
// Flatten all packaging IDs for easy lookup
const ALL_PKG_IDS = new Set(Object.values(DAM_PACKAGING).flat().map(p=>p.id));

const DAM_ALL_TYPES = [
  {id:"logo",label:"Logos & Brand ID"},{id:"photo",label:"Photography"},
  {id:"photo-product",label:"Product Photography"},{id:"photo-lifestyle",label:"Lifestyle"},
  {id:"event",label:"Events"},{id:"event-photo",label:"Event Photography"},{id:"event-video",label:"Event Videos"},
  {id:"social-img",label:"Social Media Images"},{id:"social-vid",label:"Social / Video"},
  {id:"print",label:"Retail Assets"},{id:"print-display",label:"Displays"},{id:"print-sticker",label:"Stickers"},{id:"print-info",label:"Product Info Cards"},{id:"print-poster",label:"Posters"},{id:"print-video",label:"Video"},{id:"education",label:"Budtender Education"},
  {id:"menu",label:"Menu Assets"},{id:"web",label:"Website / Digital"},{id:"web-newsletter",label:"Newsletter"},{id:"web-ads",label:"Digital Ads"},
  {id:"brief",label:"Briefs & Docs"},{id:"concept",label:"HTML Concepts"},
  {id:"merch-tee",label:"Tee"},{id:"merch-hoodie",label:"Hoodie"},
  {id:"merch-hat",label:"Hat"},{id:"merch-sticker",label:"Sticker"},
  {id:"merch-lanyard",label:"Lanyard"},{id:"merch-other",label:"Other Merch"},
  // packaging
  ...Object.values(DAM_PACKAGING).flat().map(p=>({id:p.id,label:p.label})),
];

const DAM_TYPE_EMOJI = {
  logo:"🎨",photo:"🖼️","photo-product":"📷","photo-lifestyle":"🌿","social-img":"📸","social-vid":"🎬",event:"🎪","event-photo":"📷","event-video":"🎬",print:"🏪",
  "print-display":"🖼","print-sticker":"🏷","print-info":"📇","print-poster":"📰","print-video":"🎬",
  education:"📚",menu:"🍃",web:"🌐","web-newsletter":"📧","web-ads":"📢",brief:"📄",concept:"✦",merch:"🛍",
  "merch-tee":"👕","merch-hoodie":"🧥","merch-hat":"🧢",
  "merch-sticker":"🏷","merch-lanyard":"🪪","merch-other":"✦",
  // packaging — generic box emoji for all pkg types
  ...Object.fromEntries(Object.values(DAM_PACKAGING).flat().map(p=>[p.id,"📦"])),
};

const DAM_BRANDS_DEFAULT = [
  { id:"all",        name:"All Brands",  color:"#c9a84c" },
  { id:"curador",    name:"CÚRADOR",     color:"#4d9e8e" },
  { id:"headchange", name:"Head Change", color:"#c9a84c" },
  { id:"safebet",    name:"Safe Bet",    color:"#8b7fc0" },
  { id:"bubbles",    name:"Bubbles",     color:"#7ec8c8" },
  { id:"airo",       name:"Airo",        color:"#a0c878" },
];

function damGetDriveId(url) {
  if (!url) return null;
  let m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  return null;
}
function damThumb(asset) {
  if (asset.thumbnailUrl) return asset.thumbnailUrl;
  const id = damGetDriveId(asset.driveUrl);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w400` : null;
}
function damEmbed(url) {
  const id = damGetDriveId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : null;
}
function damFmtDate(ts) {
  return new Date(ts).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
}

export default function AssetLibrary({
  assets, setAssets, driveAssets, setDriveAssets,
  activeType, setActiveType, activeBrand, setActiveBrand,
  search, setSearch, view, setView,
  merchOpen, setMerchOpen, packagingOpen, setPackagingOpen, addOpen, setAddOpen,
  preview, setPreview, config, setConfig,
  folders, setFolders, connected, setConnected,
  syncing, setSyncing, settingsOpen, setSettingsOpen,
  currentUser, hubBrands, hubCampaigns, onNote,
}) {
  const isAdmin = currentUser?.name === "Sean";
  const [photoOpen, setPhotoOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [webOpen, setWebOpen] = useState(false);

  const damBrands = useCallback(() => {
    if (!hubBrands) return DAM_BRANDS_DEFAULT;
    const hubList = Object.values(hubBrands).map(b => ({ id:b.id, name:b.name, color:b.color||"#c9a84c" }));
    const hasCurador = hubList.some(b => b.id === "curador" || b.name?.toLowerCase().includes("curador"));
    return [
      { id:"all", name:"All Brands", color:"#c9a84c" },
      ...(!hasCurador ? [{ id:"curador", name:"CÚRADOR", color:"#4d9e8e" }] : []),
      ...hubList,
    ];
  }, [hubBrands]);

  const resolvedBrands = damBrands();
  const campaignList = hubCampaigns?.length
    ? hubCampaigns.map(c => c.title || c.name || c).filter(Boolean)
    : ["General","BudDrops","HashNotes","Hash HQ","Safe Bet Launch","Bubbles Social","How To Hash"];

  // Merge drive + manual
  const allAssets = useCallback(() => {
    const map = new Map();
    assets.forEach(a => map.set(a.id, a));
    driveAssets.forEach(a => map.set(a.id, a));
    return Array.from(map.values());
  }, [assets, driveAssets])();

  const filtered = allAssets.filter(a => {
    if (activeBrand !== "all" && a.brandId !== activeBrand) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!a.name.toLowerCase().includes(q) && !(a.tags||"").toLowerCase().includes(q)) return false;
    }
    if (activeType === "all") return true;
    if (activeType === "merch") return a.type.startsWith("merch-");
    if (activeType === "packaging") return ALL_PKG_IDS.has(a.type);
    if (activeType === "photo") return a.type === "photo" || a.type.startsWith("photo-");
    if (activeType === "event") return a.type === "event" || a.type.startsWith("event-");
    return a.type === activeType;
  });

  const countFor = (id) => {
    const base = allAssets.filter(a => activeBrand==="all"||a.brandId===activeBrand);
    if (id==="all") return base.length;
    if (id==="merch") return base.filter(a=>a.type.startsWith("merch-")).length;
    if (id==="packaging") return base.filter(a=>ALL_PKG_IDS.has(a.type)).length;
    if (id==="photo") return base.filter(a=>a.type==="photo"||a.type.startsWith("photo-")).length;
    if (id==="event") return base.filter(a=>a.type==="event"||a.type.startsWith("event-")).length;
    if (id==="print") return base.filter(a=>a.type==="print"||a.type.startsWith("print-")).length;
    if (id==="web") return base.filter(a=>a.type==="web"||a.type.startsWith("web-")).length;
    return base.filter(a=>a.type===id).length;
  };

  // Which packaging subcategories to show in sidebar
  const pkgCats = (() => {
    if (activeBrand === "all") {
      return Object.values(DAM_PACKAGING).flat();
    }
    // match on brand id — normalize to lowercase key
    const key = activeBrand?.toLowerCase().replace(/[^a-z]/g,"");
    for (const [k, v] of Object.entries(DAM_PACKAGING)) {
      if (key?.includes(k) || k.includes(key)) return v;
    }
    return [];
  })();

  const getBrandColor = (id) => resolvedBrands.find(b=>b.id===id)?.color||"#c9a84c";
  const getBrandName  = (id) => resolvedBrands.find(b=>b.id===id)?.name||id;

  const addAsset = (a) => { setAssets(p => [a,...p]); setAddOpen(false); };
  const delAsset = (id) => {
    if (!confirm("Remove this asset?")) return;
    setAssets(p=>p.filter(a=>a.id!==id));
    setDriveAssets(p=>p.filter(a=>a.id!==id));
  };

  return (
    <div className="dam-wrap">
      {/* Sidebar */}
      <div className="dam-sb">
        <div className="dam-sb-hdr">Brands</div>
        {resolvedBrands.map(b => (
          <button key={b.id} className={`dam-sb-btn ${activeBrand===b.id?"on":""}`}
            onClick={() => setActiveBrand(b.id)}>
            <div style={{width:7,height:7,borderRadius:"50%",background:b.color,opacity:activeBrand===b.id?1:.35,flexShrink:0}}/>
            {b.name}
            {b.id!=="all" && <span className="dam-sb-cnt">{allAssets.filter(a=>a.brandId===b.id).length||""}</span>}
          </button>
        ))}

        <div className="dam-sb-div"/>
        <div className="dam-sb-hdr">Asset Type</div>
        {DAM_ASSET_CATS.map(t => {
          if (t.id === "photo") return (
            <button key={t.id} className={`dam-sb-btn ${activeType==="photo"||activeType.startsWith("photo-")?"on":""}`}
              onClick={() => { setPhotoOpen(o=>!o); setActiveType("photo"); }}>
              <span className="dam-sb-ico">{t.icon}</span>
              {t.label}
              <span className="dam-sb-cnt">{countFor("photo")||""}</span>
              <span className={`dam-chev ${photoOpen?"open":""}`}>▶</span>
            </button>
          );
          if (t.id === "event") return (
            <button key={t.id} className={`dam-sb-btn ${activeType==="event"||activeType.startsWith("event-")?"on":""}`}
              onClick={() => { setEventOpen(o=>!o); setActiveType("event"); }}>
              <span className="dam-sb-ico">{t.icon}</span>
              {t.label}
              <span className="dam-sb-cnt">{countFor("event")||""}</span>
              <span className={`dam-chev ${eventOpen?"open":""}`}>▶</span>
            </button>
          );
          if (t.id === "print") return (
            <button key={t.id} className={`dam-sb-btn ${activeType==="print"||activeType.startsWith("print-")?"on":""}`}
              onClick={() => { setPrintOpen(o=>!o); setActiveType("print"); }}>
              <span className="dam-sb-ico">{t.icon}</span>
              {t.label}
              <span className="dam-sb-cnt">{countFor("print")||""}</span>
              <span className={`dam-chev ${printOpen?"open":""}`}>▶</span>
            </button>
          );
          if (t.id === "web") return (
            <button key={t.id} className={`dam-sb-btn ${activeType==="web"||activeType.startsWith("web-")?"on":""}`}
              onClick={() => { setWebOpen(o=>!o); setActiveType("web"); }}>
              <span className="dam-sb-ico">{t.icon}</span>
              {t.label}
              <span className="dam-sb-cnt">{countFor("web")||""}</span>
              <span className={`dam-chev ${webOpen?"open":""}`}>▶</span>
            </button>
          );
          if (t.sub) {
            const isOpen = t.parent === "event" ? eventOpen : t.parent === "print" ? printOpen : t.parent === "web" ? webOpen : photoOpen;
            return isOpen ? (
              <button key={t.id} className={`dam-sb-btn sub ${activeType===t.id?"on":""}`}
                onClick={() => setActiveType(t.id)}>
                <span className="dam-sb-ico">{t.icon}</span>
                {t.label}
                <span className="dam-sb-cnt">{countFor(t.id)||""}</span>
              </button>
            ) : null;
          }
          return (
            <button key={t.id} className={`dam-sb-btn ${activeType===t.id?"on":""}`}
              onClick={() => setActiveType(t.id)}>
              <span className="dam-sb-ico">{t.icon}</span>
              {t.label}
              {t.id!=="all" && <span className="dam-sb-cnt">{countFor(t.id)||""}</span>}
            </button>
          );
        })}

        <div className="dam-sb-div"/>
        <button className={`dam-sb-btn ${activeType==="merch"||activeType.startsWith("merch-")?"on":""}`}
          onClick={() => { setMerchOpen(o=>!o); setActiveType("merch"); }}>
          <span className="dam-sb-ico">🛍</span>
          Merch
          <span className="dam-sb-cnt">{countFor("merch")||""}</span>
          <span className={`dam-chev ${merchOpen?"open":""}`}>▶</span>
        </button>
        {merchOpen && DAM_MERCH_CATS.filter(m=>m.id!=="merch").map(m => (
          <button key={m.id} className={`dam-sb-btn sub ${activeType===m.id?"on":""}`}
            onClick={() => setActiveType(m.id)}>
            <span className="dam-sb-ico">{m.icon}</span>
            {m.label}
            <span className="dam-sb-cnt">{countFor(m.id)||""}</span>
          </button>
        ))}

        {/* Packaging — brand-specific */}
        <div className="dam-sb-div"/>
        <button className={`dam-sb-btn ${activeType==="packaging"||ALL_PKG_IDS.has(activeType)?"on":""}`}
          onClick={() => { setPackagingOpen(o=>!o); setActiveType("packaging"); }}>
          <span className="dam-sb-ico">📦</span>
          Packaging
          <span className="dam-sb-cnt">{countFor("packaging")||""}</span>
          <span className={`dam-chev ${packagingOpen?"open":""}`}>▶</span>
        </button>
        {packagingOpen && pkgCats.length > 0 && pkgCats.map(p => (
          <button key={p.id} className={`dam-sb-btn sub ${activeType===p.id?"on":""}`}
            onClick={() => setActiveType(p.id)}>
            <span className="dam-sb-ico">📦</span>
            {p.label}
            <span className="dam-sb-cnt">{countFor(p.id)||""}</span>
          </button>
        ))}
        {packagingOpen && pkgCats.length === 0 && (
          <div style={{padding:"6px 16px 4px 28px",fontSize:10,color:"var(--text-muted)",fontStyle:"italic"}}>
            Select a brand to see packaging types
          </div>
        )}
      </div>

      {/* Main */}
      <div className="dam-main">
        <div className="dam-bar">
          <div className="dam-sw">
            <span className="dam-si">⌕</span>
            <input className="dam-search" placeholder="Search name, tags…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className={`dam-vbtn ${view==="grid"?"on":""}`} onClick={() => setView("grid")}>⊞</button>
          <button className={`dam-vbtn ${view==="list"?"on":""}`} onClick={() => setView("list")}>☰</button>
          <button className="dam-add" onClick={() => setAddOpen(true)}>+ Add Asset</button>
        </div>

        <div className="dam-body">
          {filtered.length > 0 && <div className="dam-cnt">{filtered.length} asset{filtered.length!==1?"s":""}</div>}

          {allAssets.length === 0 ? (
            <div className="dam-empty">
              <div style={{fontSize:44,opacity:.18}}>◈</div>
              <div style={{fontSize:14,color:"var(--text-dim)"}}>No assets yet</div>
              <div style={{fontSize:11,color:"var(--text-muted)",maxWidth:260,lineHeight:1.75}}>
                Click + Add Asset and paste a Google Drive link to get started.
              </div>
              <button className="dam-add" style={{marginTop:4}} onClick={() => setAddOpen(true)}>+ Add First Asset</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="dam-empty">
              <div style={{fontSize:44,opacity:.18}}>⌕</div>
              <div style={{fontSize:13,color:"var(--text-dim)"}}>No assets match</div>
            </div>
          ) : view === "grid" ? (
            <div className="dam-grid">
              {filtered.map(a => (
                <div key={a.id} className="dam-card" onClick={() => setPreview(a)}>
                  <div className="dam-card-thumb">
                    {damThumb(a) && <img src={damThumb(a)} alt={a.name} onError={e=>{e.target.style.display="none";}} />}
                    <span className="dam-card-fb">{DAM_TYPE_EMOJI[a.type]||"📁"}</span>
                    <div className="dam-card-acts">
                      {onNote && <button className="dam-iact" onClick={e=>{e.stopPropagation();onNote({section:"Asset Library",type:"Asset",label:a.name,id:a.id});}}>✎</button>}
                      <button className="dam-iact" onClick={e=>{e.stopPropagation();window.open(a.driveUrl,"_blank");}}>↗</button>
                      {isAdmin && <button className="dam-iact del" onClick={e=>{e.stopPropagation();delAsset(a.id);}}>✕</button>}
                    </div>
                  </div>
                  <div className="dam-card-body">
                    <div className="dam-card-name" title={a.name}>{a.name}</div>
                    <div className="dam-card-meta">
                      <span className="dam-bchip" style={{background:getBrandColor(a.brandId)+"18",color:getBrandColor(a.brandId)}}>{getBrandName(a.brandId)}</span>
                      {a.fromDrive && <span style={{fontSize:8,padding:"1px 5px",borderRadius:3,background:"rgba(77,158,142,.12)",color:"#4d9e8e"}}>Drive</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dam-list">
              {filtered.map(a => {
                const td = DAM_ALL_TYPES.find(t=>t.id===a.type);
                return (
                  <div key={a.id} className="dam-row" onClick={() => setPreview(a)}>
                    <div className="dam-row-thumb">
                      {damThumb(a) && <img src={damThumb(a)} alt="" onError={e=>{e.target.style.display="none";}} />}
                      <span style={{position:"relative",zIndex:1}}>{DAM_TYPE_EMOJI[a.type]||"📁"}</span>
                    </div>
                    <div className="dam-row-name" title={a.name}>{a.name}</div>
                    <span className="dam-bchip" style={{background:getBrandColor(a.brandId)+"18",color:getBrandColor(a.brandId),fontSize:8,padding:"2px 6px",borderRadius:3,fontWeight:700,letterSpacing:".05em",textTransform:"uppercase"}}>{getBrandName(a.brandId)}</span>
                    <div className="dam-row-type">{td?.label||a.type}</div>
                    <div className="dam-row-date">{damFmtDate(a.addedAt)}</div>
                    <div className="dam-row-acts" onClick={e=>e.stopPropagation()}>
                      {onNote && <button className="dam-iact" onClick={()=>onNote({section:"Asset Library",type:"Asset",label:a.name,id:a.id})}>✎</button>}
                      <button className="dam-iact" onClick={()=>window.open(a.driveUrl,"_blank")}>↗</button>
                      {isAdmin && <button className="dam-iact del" onClick={()=>delAsset(a.id)}>✕</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add modal */}
      {addOpen && (
        <div className="dam-overlay" onClick={() => setAddOpen(false)}>
          <div className="dam-modal" onClick={e=>e.stopPropagation()}>
            <div className="dam-mhdr">
              <div className="dam-mtitle">Add Asset</div>
              <button className="dam-mclose" onClick={() => setAddOpen(false)}>×</button>
            </div>
            <DamAddForm
              brands={resolvedBrands} campaigns={campaignList}
              defaultType={activeType==="merch"?"merch-tee":activeType==="photo"?"photo-product":activeType==="all"||activeType==="packaging"?"photo":activeType}
              defaultBrand={activeBrand==="all"?"curador":activeBrand}
              currentUser={currentUser}
              onSave={addAsset} onCancel={() => setAddOpen(false)} />
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <DamPreview asset={preview} onClose={() => setPreview(null)}
          onNote={onNote}
          onDel={isAdmin ? () => { delAsset(preview.id); setPreview(null); } : null} />
      )}
    </div>
  );
}

function DamAddForm({ brands, campaigns, defaultType, defaultBrand, currentUser, onSave, onCancel }) {
  const [form, setForm] = useState({
    name:"", driveUrl:"", brandId:defaultBrand||"curador",
    type:defaultType||"photo", campaign:"", tags:"", notes:""
  });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const valid = form.name.trim() && form.driveUrl.trim();
  const save = () => onSave({
    id:`dam-${Date.now()}`,...form,
    name:form.name.trim(), driveUrl:form.driveUrl.trim(),
    addedBy:currentUser?.name||"Team", addedAt:new Date().toISOString()
  });
  return (
    <>
      <div className="dam-field"><label>Asset Name *</label>
        <input className="dam-fi" autoFocus placeholder="e.g. Head Change Logo – Full Color" value={form.name} onChange={e=>set("name",e.target.value)} />
      </div>
      <div className="dam-field"><label>Google Drive Link *</label>
        <input className="dam-fi" placeholder="https://drive.google.com/file/d/…" value={form.driveUrl} onChange={e=>set("driveUrl",e.target.value)} />
      </div>
      <div className="dam-frow">
        <div className="dam-field"><label>Brand</label>
          <select className="dam-fsel" value={form.brandId} onChange={e=>set("brandId",e.target.value)}>
            {brands.filter(b=>b.id!=="all").map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="dam-field"><label>Asset Type</label>
          <select className="dam-fsel" value={form.type} onChange={e=>set("type",e.target.value)}>
            <optgroup label="Digital Assets">
              {DAM_ASSET_CATS.filter(t=>t.id!=="all").map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
            </optgroup>
            <optgroup label="Merch">
              {DAM_MERCH_CATS.filter(m=>m.id!=="merch").map(m=><option key={m.id} value={m.id}>{m.label}</option>)}
            </optgroup>
            <optgroup label="Head Change Packaging">
              {DAM_PACKAGING.headchange.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
            </optgroup>
            <optgroup label="Safe Bet Packaging">
              {DAM_PACKAGING.safebet.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
            </optgroup>
            <optgroup label="Bubbles Packaging">
              {DAM_PACKAGING.bubbles.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
            </optgroup>
          </select>
        </div>
      </div>
      <div className="dam-frow">
        <div className="dam-field"><label>Campaign</label>
          <select className="dam-fsel" value={form.campaign} onChange={e=>set("campaign",e.target.value)}>
            <option value="">None</option>
            {campaigns.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="dam-field"><label>Tags</label>
          <input className="dam-fi" placeholder="launch, Q2, print…" value={form.tags} onChange={e=>set("tags",e.target.value)} />
        </div>
      </div>
      <div className="dam-field"><label>Notes</label>
        <textarea className="dam-fta" rows={2} placeholder="Usage notes, specs…" value={form.notes} onChange={e=>set("notes",e.target.value)} />
      </div>
      <div className="dam-mfoot">
        <button className="dam-btn" onClick={onCancel}>Cancel</button>
        <button className="dam-btn dam-btn-gold" disabled={!valid} onClick={save}>Save Asset</button>
      </div>
    </>
  );
}

function DamPreview({ asset, onClose, onNote, onDel }) {
  const [loaded,   setLoaded]   = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const bc    = (DAM_BRANDS_DEFAULT.find(b=>b.id===asset.brandId)?.color)||"#c9a84c";
  const td    = DAM_ALL_TYPES.find(t=>t.id===asset.type);
  const thumb = (() => { if (asset.thumbnailUrl) return asset.thumbnailUrl; const id = damGetDriveId(asset.driveUrl); return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w1200` : null; })();
  const embed = damEmbed(asset.driveUrl);

  const postNote = () => {
    if (!noteText.trim()||!onNote) return;
    onNote({section:"Asset Library",type:"Asset",label:asset.name,id:asset.id,prefill:noteText.trim()});
    setNoteText(""); setNoteOpen(false);
  };

  return (
    <div className="dam-preview">
      <div className="dam-phdr">
        <div style={{width:8,height:8,borderRadius:"50%",background:bc,flexShrink:0}}/>
        <div className="dam-ptitle">{asset.name}</div>
        {onNote && <button className="dam-pnote" style={{width:"auto",marginBottom:0,marginRight:8}} onClick={() => setNoteOpen(o=>!o)}>✎ Note</button>}
        <button onClick={onClose} style={{width:28,height:28,borderRadius:7,border:"1px solid var(--border)",background:"transparent",color:"var(--text-muted)",cursor:"pointer",fontSize:16,display:"grid",placeItems:"center"}}>×</button>
      </div>
      {noteOpen && (
        <div className="dam-innote">
          <div className="dam-inlbl">Note on: <span style={{color:"var(--text)",fontWeight:400,textTransform:"none",letterSpacing:0}}>{asset.name}</span></div>
          <div className="dam-inrow">
            <textarea className="dam-inta" autoFocus placeholder="Add a note… (⌘↵ to post)" value={noteText} onChange={e=>setNoteText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&(e.metaKey||e.ctrlKey))postNote();}} />
            <button className="dam-inpost" disabled={!noteText.trim()} onClick={postNote}>Post →</button>
          </div>
        </div>
      )}
      <div className="dam-pwrap">
        <div className="dam-pbody">
          {embed ? (
            <>
              {thumb && <div className="dam-ghost"><img src={thumb} alt=""/></div>}
              {!loaded && <div className="dam-ploading"><span className="dam-spin">◈</span><span style={{fontSize:10,color:"var(--text-muted)",letterSpacing:".06em",textTransform:"uppercase"}}>Loading preview…</span></div>}
              <iframe src={embed} title={asset.name} allow="autoplay" style={{opacity:loaded?.9:0,transition:"opacity .4s",zIndex:loaded?3:1}} onLoad={()=>setLoaded(true)} />
            </>
          ) : (
            <div className="dam-noembed">
              <div style={{fontSize:64,opacity:.18}}>{DAM_TYPE_EMOJI[asset.type]||"📁"}</div>
              <div style={{fontSize:13,color:"var(--text-dim)"}}>{asset.name}</div>
              <button className="dam-plink" style={{width:"auto",padding:"9px 20px"}} onClick={()=>window.open(asset.driveUrl,"_blank")}>Open in Google Drive ↗</button>
            </div>
          )}
        </div>
        <div className="dam-psb">
          <div className="dam-mlbl">Type</div>
          <div className="dam-mval">{td?.label||asset.type}</div>
          {asset.campaign&&<><div className="dam-mlbl">Campaign</div><div className="dam-mval">{asset.campaign}</div></>}
          <div className="dam-mlbl">Added by</div>
          <div className="dam-mval">{asset.addedBy}</div>
          <div className="dam-mlbl">Date</div>
          <div className="dam-mval">{damFmtDate(asset.addedAt)}</div>
          {asset.tags&&<><div className="dam-mlbl">Tags</div><div style={{marginBottom:12}}>{asset.tags.split(",").map(t=>t.trim()).filter(Boolean).map(t=><span key={t} className="dam-ptag">{t}</span>)}</div></>}
          {asset.notes&&<><div className="dam-mlbl">Notes</div><div style={{fontSize:12,color:"var(--text-dim)",lineHeight:1.65,marginBottom:12}}>{asset.notes}</div></>}
          <div style={{marginTop:8}}>
            <button className="dam-plink" onClick={()=>window.open(asset.driveUrl,"_blank")}>🗂 View in Google Drive ↗</button>
            {onNote&&<button className="dam-pnote" onClick={()=>setNoteOpen(o=>!o)}>✎ Add Note</button>}
            {onDel&&<button className="dam-pdel" onClick={onDel}>✕ Remove Asset</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

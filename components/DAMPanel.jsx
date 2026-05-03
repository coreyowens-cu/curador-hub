import React, { useState, useEffect, useCallback } from "react";

// ─── Google Drive Sync (inline) ───────────────────────────────────────────────
const DRIVE_SCOPES = "https://www.googleapis.com/auth/drive.readonly";
const DRIVE_DISCOVERY = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";
let _tokenClient = null;
let _accessToken = null;

function loadGoogleScripts() {
  return new Promise((resolve) => {
    if (window.google?.accounts && window.gapi?.client) { resolve(); return; }
    let gapiReady = false, gisReady = false;
    const check = () => { if (gapiReady && gisReady) resolve(); };
    if (!document.getElementById("gapi-script")) {
      const s = document.createElement("script");
      s.id = "gapi-script"; s.src = "https://apis.google.com/js/api.js";
      s.onload = () => window.gapi.load("client", async () => {
        await window.gapi.client.init({ discoveryDocs: [DRIVE_DISCOVERY] });
        gapiReady = true; check();
      });
      document.head.appendChild(s);
    } else { gapiReady = true; check(); }
    if (!document.getElementById("gis-script")) {
      const s = document.createElement("script");
      s.id = "gis-script"; s.src = "https://accounts.google.com/gsi/client";
      s.onload = () => { gisReady = true; check(); };
      document.head.appendChild(s);
    } else { gisReady = true; check(); }
  });
}
function requestToken(clientId) {
  return new Promise((resolve, reject) => {
    if (!_tokenClient) {
      _tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId, scope: DRIVE_SCOPES,
        callback: (resp) => {
          if (resp.error) { reject(resp); return; }
          _accessToken = resp.access_token;
          window.gapi.client.setToken({ access_token: _accessToken });
          resolve(_accessToken);
        },
      });
    }
    _tokenClient.requestAccessToken({ prompt: _accessToken ? "" : "consent" });
  });
}
function getToken() { return _accessToken; }
function clearToken() {
  _accessToken = null; _tokenClient = null;
  if (window.gapi?.client) window.gapi.client.setToken(null);
}
function mimeToType(mimeType, name) {
  const n = (name || "").toLowerCase();
  if (mimeType?.startsWith("image/")) {
    if (n.includes("logo") || n.includes("brand")) return "logo";
    if (n.includes("social") || n.includes("post") || n.includes("story")) return "social-img";
    if (n.includes("menu")) return "menu";
    if (n.includes("display")) return "print-display";
    if (n.includes("sticker")) return "print-sticker";
    if (n.includes("info card") || n.includes("product card") || n.includes("info-card")) return "print-info";
    if (n.includes("poster") || n.includes("flyer")) return "print-poster";
    if (n.includes("print") || n.includes("retail")) return "print";
    if (n.includes("banner") || n.includes("web")) return "web";
    if (n.includes("budtender") || n.includes("edu")) return "education";
    return "photo";
  }
  if (mimeType?.startsWith("video/")) return "social-vid";
  if (mimeType === "text/html") return "concept";
  if (n.includes("tee") || n.includes("shirt")) return "merch-tee";
  if (n.includes("hoodie")) return "merch-hoodie";
  if (n.includes("hat") || n.includes("cap")) return "merch-hat";
  if (n.includes("sticker")) return "merch-sticker";
  if (n.includes("lanyard")) return "merch-lanyard";
  if (n.endsWith(".ai") || n.endsWith(".eps") || n.endsWith(".svg")) return "logo";
  return "brief";
}
function driveFileToAsset(file, brandId) {
  return {
    id: `drive-${file.id}`, driveId: file.id, name: file.name,
    driveUrl: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
    thumbnailUrl: file.thumbnailLink?.replace("=s220", "=s400") || null,
    brandId, type: mimeToType(file.mimeType, file.name),
    mimeType: file.mimeType, campaign: "", tags: "", notes: "",
    addedBy: "Drive Sync", addedAt: file.modifiedTime || new Date().toISOString(),
    fromDrive: true,
  };
}
async function syncAllFolders(folderMap) {
  const results = []; const errors = [];
  for (const [brandId, folderId] of Object.entries(folderMap)) {
    if (!folderId?.trim()) continue;
    try {
      let pageToken = null;
      do {
        const params = {
          q: `'${folderId}' in parents and trashed = false`,
          fields: "nextPageToken, files(id,name,mimeType,thumbnailLink,webViewLink,modifiedTime,size)",
          pageSize: 100, orderBy: "modifiedTime desc",
        };
        if (pageToken) params.pageToken = pageToken;
        const resp = await window.gapi.client.drive.files.list(params);
        const data = resp.result;
        results.push(...(data.files || []).map(f => driveFileToAsset(f, brandId)));
        pageToken = data.nextPageToken;
      } while (pageToken);
    } catch (e) { errors.push({ brandId, error: e.message || "Failed" }); }
  }
  return { assets: results, errors };
}


// ─── Constants ────────────────────────────────────────────────────────────────

const BRANDS = [
  { id: "all",        name: "All Brands",  color: "#c9a84c" },
  { id: "curador",    name: "CÚRADOR",     color: "#4d9e8e" },
  { id: "headchange", name: "Head Change", color: "#c9a84c" },
  { id: "safebet",    name: "Safe Bet",    color: "#8b7fc0" },
  { id: "bubbles",    name: "Bubbles",     color: "#7ec8c8" },
  { id: "airo",       name: "Airo",        color: "#a0c878" },
];

const ASSET_CATS = [
  { id: "all",        label: "All Assets",         icon: "◈" },
  { id: "logo",       label: "Logos & Brand ID",   icon: "◉" },
  { id: "photo",      label: "Photography",         icon: "⬚" },
  { id: "social-img", label: "Social Media Images", icon: "▣" },
  { id: "social-vid", label: "Social / Video",      icon: "▶" },
  { id: "print",          label: "Retail Assets",       icon: "🏪" },
  { id: "print-display",  label: "Displays",            icon: "🖼", sub: true, parent: "print" },
  { id: "print-sticker",  label: "Stickers",            icon: "🏷", sub: true, parent: "print" },
  { id: "print-info",     label: "Product Info Cards",   icon: "📇", sub: true, parent: "print" },
  { id: "print-poster",   label: "Posters",             icon: "📰", sub: true, parent: "print" },
  { id: "print-video",    label: "Video",               icon: "🎬", sub: true, parent: "print" },
  { id: "education",  label: "Budtender Education", icon: "◎" },
  { id: "menu",       label: "Menu Assets",         icon: "≡" },
  { id: "web",            label: "Website / Digital",   icon: "⬡" },
  { id: "web-newsletter", label: "Newsletter",          icon: "📧", sub: true, parent: "web" },
  { id: "web-ads",        label: "Digital Ads",          icon: "📢", sub: true, parent: "web" },
  { id: "brief",      label: "Briefs & Docs",       icon: "▤" },
  { id: "concept",    label: "HTML Concepts",       icon: "✦" },
  { id: "airo",       label: "Airo Assets",         icon: "💨" },
];

const MERCH_CATS = [
  { id: "merch",         label: "Merch",    icon: "🛍" },
  { id: "merch-tee",     label: "Tees",     icon: "👕" },
  { id: "merch-hoodie",  label: "Hoodies",  icon: "🧥" },
  { id: "merch-hat",     label: "Hats",     icon: "🧢" },
  { id: "merch-sticker", label: "Stickers", icon: "🏷" },
  { id: "merch-lanyard", label: "Lanyards", icon: "🪪" },
  { id: "merch-other",   label: "Other",    icon: "✦" },
];

const ALL_TYPES = [
  { id:"logo",label:"Logos & Brand ID"},{id:"photo",label:"Photography"},
  {id:"social-img",label:"Social Media Images"},{id:"social-vid",label:"Social / Video"},
  {id:"print",label:"Retail Assets"},{id:"print-display",label:"Displays"},{id:"print-sticker",label:"Stickers"},{id:"print-info",label:"Product Info Cards"},{id:"print-poster",label:"Posters"},{id:"print-video",label:"Video"},{id:"education",label:"Budtender Education"},
  {id:"menu",label:"Menu Assets"},{id:"web",label:"Website / Digital"},{id:"web-newsletter",label:"Newsletter"},{id:"web-ads",label:"Digital Ads"},
  {id:"brief",label:"Briefs & Docs"},{id:"concept",label:"HTML Concepts"},
  {id:"merch-tee",label:"Tee"},{id:"merch-hoodie",label:"Hoodie"},
  {id:"merch-hat",label:"Hat"},{id:"merch-sticker",label:"Sticker"},
  {id:"merch-lanyard",label:"Lanyard"},{id:"merch-other",label:"Other Merch"},
];

const TYPE_EMOJI = {
  logo:"🎨",photo:"🖼️","social-img":"📸","social-vid":"🎬",print:"🏪",
  "print-display":"🖼","print-sticker":"🏷","print-info":"📇","print-poster":"📰","print-video":"🎬",airo:"💨",
  education:"📚",menu:"🍃",web:"🌐","web-newsletter":"📧","web-ads":"📢",brief:"📄",concept:"✦",merch:"🛍",
  "merch-tee":"👕","merch-hoodie":"🧥","merch-hat":"🧢",
  "merch-sticker":"🏷","merch-lanyard":"🪪","merch-other":"✦",
};

const CAMPAIGNS = ["General","BudDrops","HashNotes","Hash HQ","Safe Bet Launch","Bubbles Social","How To Hash"];

const STORAGE_KEY_ASSETS  = "dam_v2_assets";
const STORAGE_KEY_CONFIG  = "dam_drive_config";
const STORAGE_KEY_FOLDERS = "dam_drive_folders";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDriveId(url) {
  if (!url) return null;
  let m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  m = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  return null;
}
function getDriveThumb(asset) {
  if (asset.thumbnailUrl) return asset.thumbnailUrl;
  const id = getDriveId(asset.driveUrl);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w400` : null;
}
function getDriveEmbed(url) {
  const id = getDriveId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : null;
}
function fmtDate(ts) {
  return new Date(ts).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
}
function getBrandColor(id) { return BRANDS.find(b=>b.id===id)?.color||"#c9a84c"; }
function getBrandName(id) { return BRANDS.find(b=>b.id===id)?.name||id; }

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
.dam-root{display:flex;height:calc(100vh - 57px);width:100%;background:var(--bg,#0d0d1a);color:var(--text,#e8e6e0);font-family:var(--bf,"DM Sans",sans-serif);overflow:hidden;}
.dam-sb{width:215px;flex-shrink:0;border-right:1px solid rgba(255,255,255,.07);display:flex;flex-direction:column;overflow-y:auto;background:rgba(255,255,255,.012);}
.dam-sb::-webkit-scrollbar{width:3px;}
.dam-sb::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px;}
.dam-sb-hdr{padding:14px 14px 5px;font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.25);font-weight:700;}
.dam-sb-btn{display:flex;align-items:center;gap:8px;padding:7px 14px;cursor:pointer;border:none;background:transparent;width:100%;text-align:left;font-family:inherit;font-size:11.5px;color:rgba(255,255,255,.48);transition:all .13s;}
.dam-sb-btn:hover{background:rgba(255,255,255,.035);color:rgba(255,255,255,.78);}
.dam-sb-btn.on{background:rgba(201,168,76,.08);color:#c9a84c;}
.dam-sb-ico{font-size:11px;width:15px;text-align:center;flex-shrink:0;}
.dam-sb-count{margin-left:auto;font-size:9px;opacity:.32;}
.dam-sb-divider{height:1px;background:rgba(255,255,255,.05);margin:6px 12px;}
.dam-sb-btn.sub{padding-left:30px;font-size:11px;color:rgba(255,255,255,.38);}
.dam-sb-btn.sub:hover{color:rgba(255,255,255,.68);}
.dam-sb-btn.sub.on{color:#c9a84c;background:rgba(201,168,76,.06);}
.dam-sb-chevron{margin-left:auto;font-size:9px;opacity:.4;transition:transform .2s;}
.dam-sb-chevron.open{transform:rotate(90deg);}
/* Drive connect bar */
.dam-drive-bar{padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.05);background:rgba(255,255,255,.01);flex-shrink:0;}
.dam-drive-connected{display:flex;align-items:center;gap:7px;font-size:10px;color:rgba(255,255,255,.45);}
.dam-drive-dot{width:6px;height:6px;border-radius:50%;background:#4d9e8e;flex-shrink:0;}
.dam-drive-dot.off{background:rgba(255,255,255,.2);}
.dam-connect-btn{display:flex;align-items:center;gap:6px;padding:5px 11px;border-radius:6px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(255,255,255,.55);font-family:inherit;font-size:10px;cursor:pointer;transition:all .13s;margin-left:auto;white-space:nowrap;}
.dam-connect-btn:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18);}
.dam-connect-btn.syncing{color:#c9a84c;border-color:rgba(201,168,76,.3);background:rgba(201,168,76,.06);}
/* Main */
.dam-main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.dam-bar{padding:11px 18px;display:flex;align-items:center;gap:9px;border-bottom:1px solid rgba(255,255,255,.05);flex-shrink:0;}
.dam-search-wrap{position:relative;flex:1;}
.dam-search-ico{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:11px;color:rgba(255,255,255,.25);pointer-events:none;}
.dam-search{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:7px 11px 7px 30px;color:var(--text,#e8e6e0);font-family:inherit;font-size:12px;outline:none;transition:border-color .15s;box-sizing:border-box;}
.dam-search:focus{border-color:rgba(201,168,76,.3);}
.dam-vbtn{width:27px;height:27px;display:grid;place-items:center;border-radius:6px;border:1px solid rgba(255,255,255,.07);background:transparent;color:rgba(255,255,255,.32);cursor:pointer;font-size:12px;transition:all .12s;}
.dam-vbtn.on{border-color:rgba(201,168,76,.36);color:#c9a84c;background:rgba(201,168,76,.06);}
.dam-add-btn{display:flex;align-items:center;gap:5px;padding:6px 13px;border-radius:7px;border:1px solid rgba(201,168,76,.28);background:rgba(201,168,76,.06);color:#c9a84c;font-family:inherit;font-size:11px;font-weight:600;cursor:pointer;letter-spacing:.04em;text-transform:uppercase;transition:all .14s;white-space:nowrap;}
.dam-add-btn:hover{background:rgba(201,168,76,.12);border-color:rgba(201,168,76,.48);}
.dam-body{flex:1;overflow-y:auto;padding:16px 18px;}
.dam-count{font-size:10px;color:rgba(255,255,255,.24);margin-bottom:12px;}
.dam-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px;}
.dam-list{display:flex;flex-direction:column;gap:4px;}
.dam-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:11px;overflow:hidden;cursor:pointer;transition:all .17s;position:relative;}
.dam-card:hover{border-color:rgba(255,255,255,.13);background:rgba(255,255,255,.05);transform:translateY(-2px);box-shadow:0 8px 26px rgba(0,0,0,.28);}
.dam-card-thumb{aspect-ratio:4/3;background:#0c0c18;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;}
.dam-card-thumb img{width:100%;height:100%;object-fit:cover;opacity:.88;position:absolute;inset:0;}
.dam-card-fallback{font-size:36px;opacity:.18;}
.dam-card-acts{position:absolute;top:6px;right:6px;display:flex;gap:3px;opacity:0;transition:opacity .13s;}
.dam-card:hover .dam-card-acts{opacity:1;}
.dam-act{width:22px;height:22px;border-radius:5px;border:none;background:rgba(7,7,15,.85);color:rgba(255,255,255,.7);cursor:pointer;display:grid;place-items:center;font-size:10px;backdrop-filter:blur(8px);transition:all .11s;}
.dam-act:hover{background:#c9a84c;color:#07070f;}
.dam-act.del:hover{background:#e07b6a;color:#fff;}
.dam-card-body{padding:8px 10px;}
.dam-card-name{font-size:11px;color:rgba(255,255,255,.8);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px;}
.dam-card-meta{display:flex;align-items:center;gap:5px;}
.dam-chip{font-size:8px;padding:1px 5px;border-radius:3px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;}
.dam-drive-badge{font-size:8px;padding:1px 5px;border-radius:3px;background:rgba(77,158,142,.12);color:#4d9e8e;letter-spacing:.04em;}
.dam-row{display:flex;align-items:center;gap:9px;padding:7px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.05);background:rgba(255,255,255,.02);cursor:pointer;transition:all .12s;}
.dam-row:hover{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.1);}
.dam-row-thumb{width:34px;height:34px;border-radius:6px;background:#0c0c18;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:15px;position:relative;}
.dam-row-thumb img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.85;}
.dam-row-name{flex:1;font-size:12px;color:rgba(255,255,255,.76);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dam-row-type{font-size:10px;color:rgba(255,255,255,.28);min-width:120px;}
.dam-row-date{font-size:10px;color:rgba(255,255,255,.22);min-width:78px;text-align:right;}
.dam-row-acts{display:flex;gap:3px;opacity:0;transition:opacity .12s;}
.dam-row:hover .dam-row-acts{opacity:1;}
.dam-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:280px;color:rgba(255,255,255,.2);gap:12px;text-align:center;}
.dam-empty-ico{font-size:44px;opacity:.18;}
/* Sync error banner */
.dam-err{padding:8px 18px;background:rgba(224,123,106,.08);border-bottom:1px solid rgba(224,123,106,.15);font-size:11px;color:#e07b6a;flex-shrink:0;}
/* Modal */
.dam-overlay{position:fixed;inset:0;z-index:600;background:rgba(7,7,15,.88);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);}
.dam-modal{background:#12121e;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:24px;width:500px;max-width:95vw;max-height:90vh;overflow-y:auto;}
.dam-mhdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
.dam-mtitle{font-size:18px;font-weight:400;color:#e8e6e0;}
.dam-mclose{width:27px;height:27px;border-radius:7px;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(255,255,255,.4);cursor:pointer;font-size:16px;display:grid;place-items:center;}
.dam-field{margin-bottom:12px;}
.dam-field label{display:block;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:5px;font-weight:700;}
.dam-fi,.dam-fsel,.dam-fta{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:8px 11px;color:#e8e6e0;font-family:inherit;font-size:13px;outline:none;transition:border-color .15s;box-sizing:border-box;}
.dam-fi:focus,.dam-fsel:focus,.dam-fta:focus{border-color:rgba(201,168,76,.38);}
.dam-fsel option,.dam-fsel optgroup{background:#12121e;}
.dam-frow{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.dam-mfoot{display:flex;justify-content:flex-end;gap:8px;margin-top:16px;}
.dam-btn{padding:7px 15px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(255,255,255,.48);font-family:inherit;font-size:12px;cursor:pointer;transition:all .12s;}
.dam-btn:hover{background:rgba(255,255,255,.05);}
.dam-btn-gold{background:rgba(201,168,76,.1);border-color:rgba(201,168,76,.3);color:#c9a84c;font-weight:600;}
.dam-btn-gold:hover{background:rgba(201,168,76,.17);}
.dam-btn-gold:disabled{opacity:.35;cursor:not-allowed;}
.dam-btn-green{background:rgba(77,158,142,.1);border-color:rgba(77,158,142,.3);color:#4d9e8e;font-weight:600;}
.dam-btn-green:hover{background:rgba(77,158,142,.18);}
/* Settings modal */
.dam-folder-row{display:flex;align-items:center;gap:10px;margin-bottom:10px;}
.dam-folder-lbl{font-size:11px;color:rgba(255,255,255,.5);width:90px;flex-shrink:0;}
.dam-folder-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
/* Preview */
.dam-preview{position:fixed;inset:0;z-index:700;background:rgba(7,7,15,.97);display:flex;flex-direction:column;}
.dam-phdr{padding:11px 18px;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:10px;flex-shrink:0;}
.dam-ptitle{flex:1;font-size:13px;font-weight:500;color:#e8e6e0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dam-pwrap{flex:1;display:flex;overflow:hidden;}
.dam-pbody{flex:1;position:relative;overflow:hidden;background:#08080f;display:flex;align-items:center;justify-content:center;}
.dam-pbody iframe{position:absolute;inset:0;width:100%;height:100%;border:none;}
.dam-ghost{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;overflow:hidden;}
.dam-ghost img{width:100%;height:100%;object-fit:contain;filter:blur(3px) brightness(.55);opacity:.18;}
.dam-loading{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;pointer-events:none;z-index:2;}
.dam-noembed{display:flex;flex-direction:column;align-items:center;gap:18px;}
@keyframes damSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.dam-spin{animation:damSpin 2s linear infinite;font-size:30px;opacity:.22;}
.dam-psidebar{width:236px;border-left:1px solid rgba(255,255,255,.06);padding:16px;overflow-y:auto;flex-shrink:0;}
.dam-mlbl{font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.26);margin-bottom:3px;font-weight:700;}
.dam-mval{font-size:12px;color:rgba(255,255,255,.65);margin-bottom:12px;}
.dam-tag{display:inline-block;font-size:9px;padding:2px 7px;border-radius:100px;background:rgba(255,255,255,.05);color:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.07);margin:2px 2px 0 0;}
.dam-plink{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:7px;border-radius:8px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.03);color:rgba(255,255,255,.52);font-family:inherit;font-size:11px;cursor:pointer;transition:all .12s;margin-bottom:6px;box-sizing:border-box;}
.dam-plink:hover{background:rgba(255,255,255,.07);}
.dam-pnote{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:7px;border-radius:8px;border:1px solid rgba(201,168,76,.2);background:rgba(201,168,76,.05);color:#c9a84c;font-family:inherit;font-size:11px;cursor:pointer;transition:all .12s;margin-bottom:6px;box-sizing:border-box;}
.dam-pnote:hover{background:rgba(201,168,76,.1);}
.dam-pdel{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:7px;border-radius:8px;border:1px solid rgba(224,123,106,.16);background:transparent;color:rgba(224,123,106,.52);font-family:inherit;font-size:11px;cursor:pointer;transition:all .12s;box-sizing:border-box;}
.dam-pdel:hover{background:rgba(224,123,106,.05);}
.dam-in-note{padding:10px 18px;border-bottom:1px solid rgba(255,255,255,.05);background:rgba(201,168,76,.03);flex-shrink:0;}
.dam-in-lbl{font-size:9px;color:#c9a84c;letter-spacing:.1em;text-transform:uppercase;font-weight:700;margin-bottom:5px;}
.dam-in-row{display:flex;gap:7px;}
.dam-in-ta{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:6px 9px;color:#e8e6e0;font-family:inherit;font-size:12px;line-height:1.55;resize:none;outline:none;min-height:48px;transition:border-color .13s;}
.dam-in-ta:focus{border-color:rgba(201,168,76,.36);}
.dam-in-post{align-self:flex-end;padding:6px 11px;border-radius:7px;border:none;background:#c9a84c;color:#07070f;font-family:inherit;font-size:11px;font-weight:700;cursor:pointer;}
.dam-in-post:disabled{opacity:.35;cursor:not-allowed;}
`;

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DAMPanel({ currentUser, onNote, brands: brandsProp, campaigns: campaignsProp }) {
  const [manualAssets, setManualAssets] = useState(() => {
    try { const s = localStorage.getItem(STORAGE_KEY_ASSETS); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [driveAssets,  setDriveAssets]  = useState([]);
  const [config,       setConfig]       = useState(() => {
    try { const s = localStorage.getItem(STORAGE_KEY_CONFIG); return s ? JSON.parse(s) : { clientId: "" }; } catch { return { clientId: "" }; }
  });
  const [folders, setFolders] = useState(() => {
    try { const s = localStorage.getItem(STORAGE_KEY_FOLDERS); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });

  const [connected,    setConnected]    = useState(false);
  const [syncing,      setSyncing]      = useState(false);
  const [syncErrors,   setSyncErrors]   = useState([]);
  const [activeType,   setActiveType]   = useState("all");
  const [activeBrand,  setActiveBrand]  = useState("all");
  const [search,       setSearch]       = useState("");
  const [view,         setView]         = useState("grid");
  const [addOpen,      setAddOpen]      = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [preview,      setPreview]      = useState(null);
  const [merchOpen,    setMerchOpen]    = useState(false);

  // Use brands/campaigns from parent hub if provided
  const resolvedBrands = React.useMemo(() => {
    if (!brandsProp) return BRANDS;
    const mapped = [
      { id: "all", name: "All Brands", color: "#c9a84c" },
      ...Object.values(brandsProp).map(b => ({
        id: b.id, name: b.name, color: b.color || "#c9a84c"
      }))
    ];
    return mapped;
  }, [brandsProp]);

  const resolvedCampaigns = React.useMemo(() => {
    if (!campaignsProp?.length) return CAMPAIGNS;
    return campaignsProp.map(c => c.title || c.name || c).filter(Boolean);
  }, [campaignsProp]);

  const isAdmin = currentUser?.name === "Sean";

  // Merge drive + manual assets, drive wins on ID collision
  const assets = React.useMemo(() => {
    const map = new Map();
    manualAssets.forEach(a => map.set(a.id, a));
    driveAssets.forEach(a => map.set(a.id, a));
    return Array.from(map.values());
  }, [manualAssets, driveAssets]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(manualAssets)); } catch {}
    try { window.storage?.set("dam-v2-assets", JSON.stringify(manualAssets), true); } catch {}
  }, [manualAssets]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config)); } catch {}
  }, [config]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders)); } catch {}
  }, [folders]);

  // ── Drive connect + sync ────────────────────────────────────────────────────
  const connectAndSync = useCallback(async () => {
    if (!config.clientId?.trim()) { setSettingsOpen(true); return; }
    setSyncing(true); setSyncErrors([]);
    try {
      await loadGoogleScripts();
      await requestToken(config.clientId);
      setConnected(true);
      await doSync();
    } catch (e) {
      setSyncErrors([{ brandId:"auth", error: e.error_description || e.message || "Authentication failed" }]);
    }
    setSyncing(false);
  }, [config.clientId, folders]);

  const doSync = useCallback(async () => {
    if (!getToken() || !Object.keys(folders).length) return;
    setSyncing(true); setSyncErrors([]);
    try {
      const { assets: synced, errors } = await syncAllFolders(folders);
      setDriveAssets(synced);
      setSyncErrors(errors);
    } catch (e) {
      setSyncErrors([{ brandId:"sync", error: e.message || "Sync failed" }]);
    }
    setSyncing(false);
  }, [folders]);

  const disconnect = () => { clearToken(); setConnected(false); setDriveAssets([]); };

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = assets.filter(a => {
    if (activeBrand !== "all" && a.brandId !== activeBrand) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!a.name.toLowerCase().includes(q) && !(a.tags||"").toLowerCase().includes(q)) return false;
    }
    if (activeType === "all") return true;
    if (activeType === "merch") return a.type.startsWith("merch-");
    return a.type === activeType;
  });

  const countFor = (id) => {
    const base = assets.filter(a => activeBrand === "all" || a.brandId === activeBrand);
    if (id === "all") return base.length;
    if (id === "merch") return base.filter(a => a.type.startsWith("merch-")).length;
    return base.filter(a => a.type === id).length;
  };

  const addAsset = (a) => { setManualAssets(p => [a, ...p]); setAddOpen(false); };
  const delAsset = (id) => {
    if (!confirm("Remove this asset?")) return;
    setManualAssets(p => p.filter(a => a.id !== id));
    setDriveAssets(p => p.filter(a => a.id !== id));
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="dam-root">

        {/* ── Sidebar ── */}
        <div className="dam-sb">
          {/* Drive status */}
          <div className="dam-drive-bar">
            <div className="dam-drive-connected">
              <div className={`dam-drive-dot ${connected?"":"off"}`}/>
              <span>{connected ? "Drive connected" : "Drive not connected"}</span>
              {connected ? (
                <>
                  <button className={`dam-connect-btn ${syncing?"syncing":""}`} onClick={doSync} disabled={syncing}>
                    {syncing ? "Syncing…" : "↻ Sync"}
                  </button>
                  <button className="dam-connect-btn" onClick={() => setSettingsOpen(true)} style={{marginLeft:2}}>⚙</button>
                </>
              ) : (
                <button className={`dam-connect-btn ${syncing?"syncing":""}`} onClick={connectAndSync} disabled={syncing}>
                  {syncing ? "Connecting…" : "Connect"}
                </button>
              )}
            </div>
          </div>

          <div className="dam-sb-hdr">Brands</div>
          {resolvedBrands.map(b => (
            <button key={b.id} className={`dam-sb-btn ${activeBrand===b.id?"on":""}`}
              onClick={() => setActiveBrand(b.id)}>
              <div style={{width:7,height:7,borderRadius:"50%",background:b.color,opacity:activeBrand===b.id?1:.35,flexShrink:0}}/>
              {b.name}
              {b.id!=="all" && <span className="dam-sb-count">{assets.filter(a=>a.brandId===b.id).length||""}</span>}
            </button>
          ))}

          <div className="dam-sb-divider"/>
          <div className="dam-sb-hdr">Asset Type</div>
          {ASSET_CATS.map(t => (
            <button key={t.id} className={`dam-sb-btn ${activeType===t.id?"on":""}`}
              onClick={() => setActiveType(t.id)}>
              <span className="dam-sb-ico">{t.icon}</span>
              {t.label}
              {t.id!=="all" && <span className="dam-sb-count">{countFor(t.id)||""}</span>}
            </button>
          ))}

          <div className="dam-sb-divider"/>

          {/* Merch — collapsible */}
          <button className={`dam-sb-btn ${activeType==="merch"||activeType.startsWith("merch-")?"on":""}`}
            onClick={() => { setMerchOpen(o=>!o); setActiveType("merch"); }}>
            <span className="dam-sb-ico">🛍</span>
            Merch
            <span className="dam-sb-count">{countFor("merch")||""}</span>
            <span className={`dam-sb-chevron ${merchOpen?"open":""}`}>▶</span>
          </button>
          {merchOpen && MERCH_CATS.filter(m=>m.id!=="merch").map(m => (
            <button key={m.id} className={`dam-sb-btn sub ${activeType===m.id?"on":""}`}
              onClick={() => setActiveType(m.id)}>
              <span className="dam-sb-ico">{m.icon}</span>
              {m.label}
              <span className="dam-sb-count">{countFor(m.id)||""}</span>
            </button>
          ))}
        </div>

        {/* ── Main ── */}
        <div className="dam-main">
          {syncErrors.length > 0 && (
            <div className="dam-err">
              ⚠ Sync errors: {syncErrors.map(e=>`${e.brandId}: ${e.error}`).join(" · ")}
            </div>
          )}

          <div className="dam-bar">
            <div className="dam-search-wrap">
              <span className="dam-search-ico">⌕</span>
              <input className="dam-search" placeholder="Search name, tags…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className={`dam-vbtn ${view==="grid"?"on":""}`} onClick={() => setView("grid")}>⊞</button>
            <button className={`dam-vbtn ${view==="list"?"on":""}`} onClick={() => setView("list")}>☰</button>
            <button className="dam-add-btn" onClick={() => setAddOpen(true)}>+ Add Asset</button>
          </div>

          <div className="dam-body">
            {filtered.length > 0 && (
              <div className="dam-count">
                {filtered.length} asset{filtered.length!==1?"s":""}
                {driveAssets.length > 0 && <span style={{marginLeft:8,color:"rgba(77,158,142,.6)"}}>· {driveAssets.length} from Drive</span>}
              </div>
            )}

            {assets.length === 0 ? (
              <div className="dam-empty">
                <div className="dam-empty-ico">◈</div>
                <div style={{fontSize:14,color:"rgba(255,255,255,.38)"}}>No assets yet</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.2)",maxWidth:280,lineHeight:1.75}}>
                  Connect Google Drive to auto-populate from your folders, or add assets manually with a Drive link.
                </div>
                <div style={{display:"flex",gap:8,marginTop:4}}>
                  <button className="dam-btn dam-btn-green" onClick={connectAndSync}>Connect Drive</button>
                  <button className="dam-add-btn" onClick={() => setAddOpen(true)}>+ Add Manually</button>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="dam-empty">
                <div className="dam-empty-ico">⌕</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,.32)"}}>No assets match</div>
              </div>
            ) : view === "grid" ? (
              <div className="dam-grid">
                {filtered.map(a => <AssetCard key={a.id} asset={a} onOpen={()=>setPreview(a)} onDel={isAdmin?()=>delAsset(a.id):null} onNote={onNote} />)}
              </div>
            ) : (
              <div className="dam-list">
                {filtered.map(a => <AssetRow key={a.id} asset={a} onOpen={()=>setPreview(a)} onDel={isAdmin?()=>delAsset(a.id):null} onNote={onNote} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {addOpen && <AddModal onClose={()=>setAddOpen(false)} onSave={addAsset} currentUser={currentUser} defaultType={activeType} brands={resolvedBrands} campaigns={resolvedCampaigns} />}
      {settingsOpen && (
        <SettingsModal config={config} folders={folders}
          onSave={(c,f)=>{ setConfig(c); setFolders(f); setSettingsOpen(false); }}
          onClose={()=>setSettingsOpen(false)}
          onDisconnect={()=>{ disconnect(); setSettingsOpen(false); }}
          connected={connected} />
      )}
      {preview && <PreviewPanel asset={preview} onClose={()=>setPreview(null)} onNote={onNote} onDel={isAdmin?()=>{delAsset(preview.id);setPreview(null);}:null} />}
    </>
  );
}

// ─── Asset Card ───────────────────────────────────────────────────────────────

function AssetCard({ asset, onOpen, onDel, onNote }) {
  const bc = getBrandColor(asset.brandId);
  const thumb = getDriveThumb(asset);
  return (
    <div className="dam-card" onClick={onOpen}>
      <div className="dam-card-thumb">
        {thumb && <img src={thumb} alt={asset.name} onError={e=>{e.target.style.display="none";}} />}
        <span className="dam-card-fallback">{TYPE_EMOJI[asset.type]||"📁"}</span>
        <div className="dam-card-acts">
          {onNote && <button className="dam-act" onClick={e=>{e.stopPropagation();onNote({section:"DAM",type:"Asset",label:asset.name,id:asset.id});}}>✎</button>}
          <button className="dam-act" onClick={e=>{e.stopPropagation();window.open(asset.driveUrl,"_blank","noopener,noreferrer");}}>↗</button>
          {onDel && <button className="dam-act del" onClick={e=>{e.stopPropagation();onDel();}}>✕</button>}
        </div>
      </div>
      <div className="dam-card-body">
        <div className="dam-card-name" title={asset.name}>{asset.name}</div>
        <div className="dam-card-meta">
          <span className="dam-chip" style={{background:bc+"18",color:bc}}>{getBrandName(asset.brandId)}</span>
          {asset.fromDrive && <span className="dam-drive-badge">Drive</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Asset Row ────────────────────────────────────────────────────────────────

function AssetRow({ asset, onOpen, onDel, onNote }) {
  const bc = getBrandColor(asset.brandId);
  const thumb = getDriveThumb(asset);
  const td = ALL_TYPES.find(t=>t.id===asset.type);
  return (
    <div className="dam-row" onClick={onOpen}>
      <div className="dam-row-thumb">
        {thumb && <img src={thumb} alt="" onError={e=>{e.target.style.display="none";}} />}
        <span style={{position:"relative",zIndex:1}}>{TYPE_EMOJI[asset.type]||"📁"}</span>
      </div>
      <div className="dam-row-name" title={asset.name}>{asset.name}</div>
      <span className="dam-chip" style={{background:bc+"18",color:bc,fontSize:8,padding:"2px 6px",borderRadius:3,fontWeight:700,letterSpacing:".05em",textTransform:"uppercase"}}>{getBrandName(asset.brandId)}</span>
      <div className="dam-row-type">{td?.label||asset.type}</div>
      {asset.fromDrive && <span className="dam-drive-badge">Drive</span>}
      <div className="dam-row-date">{fmtDate(asset.addedAt)}</div>
      <div className="dam-row-acts" onClick={e=>e.stopPropagation()}>
        {onNote && <button className="dam-act" onClick={()=>onNote({section:"DAM",type:"Asset",label:asset.name,id:asset.id})}>✎</button>}
        <button className="dam-act" onClick={()=>window.open(asset.driveUrl,"_blank","noopener,noreferrer")}>↗</button>
        {onDel && <button className="dam-act del" onClick={onDel}>✕</button>}
      </div>
    </div>
  );
}

// ─── Settings Modal ───────────────────────────────────────────────────────────

function SettingsModal({ config, folders, onSave, onClose, onDisconnect, connected }) {
  const [clientId, setClientId] = useState(config.clientId || "");
  const [flds, setFlds] = useState({ ...folders });
  const setFolder = (brandId, val) => setFlds(p => ({...p, [brandId]: val}));

  return (
    <div className="dam-overlay" onClick={onClose}>
      <div className="dam-modal" style={{width:560}} onClick={e=>e.stopPropagation()}>
        <div className="dam-mhdr">
          <div className="dam-mtitle">Google Drive Settings</div>
          <button className="dam-mclose" onClick={onClose}>×</button>
        </div>

        <div className="dam-field">
          <label>Google OAuth Client ID</label>
          <input className="dam-fi" placeholder="xxxx.apps.googleusercontent.com"
            value={clientId} onChange={e=>setClientId(e.target.value)} />
          <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:5,lineHeight:1.7}}>
            Create at <strong style={{color:"rgba(255,255,255,.5)"}}>console.cloud.google.com</strong> → APIs & Services → Credentials → OAuth 2.0 Client ID
          </div>
        </div>

        <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginBottom:10,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase"}}>
          Drive Folder IDs — one per brand
        </div>
        <div style={{fontSize:10,color:"rgba(255,255,255,.28)",marginBottom:14,lineHeight:1.7}}>
          Open a folder in Drive → copy the ID from the URL: drive.google.com/drive/folders/<strong style={{color:"rgba(255,255,255,.45)"}}>THIS_PART</strong>
        </div>

        {BRANDS.filter(b=>b.id!=="all").map(b => (
          <div key={b.id} className="dam-folder-row">
            <div className="dam-folder-dot" style={{background:b.color}}/>
            <div className="dam-folder-lbl">{b.name}</div>
            <input className="dam-fi" style={{flex:1}} placeholder="Folder ID"
              value={flds[b.id]||""} onChange={e=>setFolder(b.id, e.target.value)} />
          </div>
        ))}

        <div className="dam-mfoot">
          {connected && <button className="dam-btn" onClick={onDisconnect} style={{marginRight:"auto",color:"rgba(224,123,106,.6)"}}>Disconnect</button>}
          <button className="dam-btn" onClick={onClose}>Cancel</button>
          <button className="dam-btn dam-btn-gold" onClick={()=>onSave({clientId},{...flds})}>Save & Sync</button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Manual Asset Modal ───────────────────────────────────────────────────

function AddModal({ onClose, onSave, currentUser, defaultType, brands, campaigns }) {
  const resolved = defaultType==="merch"?"merch-tee":(defaultType==="all"?"photo":defaultType);
  const defaultBrandId = (brands||BRANDS).find(b=>b.id==="headchange")?"headchange":((brands||BRANDS).filter(b=>b.id!=="all")[0]?.id||"headchange");
  const [form, setForm] = useState({name:"",driveUrl:"",brandId:defaultBrandId,type:resolved,campaign:"",tags:"",notes:""});
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const valid = form.name.trim() && form.driveUrl.trim();
  const save = () => onSave({id:`dam-${Date.now()}`,...form,name:form.name.trim(),driveUrl:form.driveUrl.trim(),addedBy:currentUser?.name||"Team",addedAt:new Date().toISOString()});

  return (
    <div className="dam-overlay" onClick={onClose}>
      <div className="dam-modal" onClick={e=>e.stopPropagation()}>
        <div className="dam-mhdr"><div className="dam-mtitle">Add Asset</div><button className="dam-mclose" onClick={onClose}>×</button></div>
        <div className="dam-field"><label>Asset Name *</label><input className="dam-fi" autoFocus placeholder="e.g. Head Change Logo – Full Color" value={form.name} onChange={e=>set("name",e.target.value)} /></div>
        <div className="dam-field"><label>Google Drive Link *</label><input className="dam-fi" placeholder="https://drive.google.com/file/d/…" value={form.driveUrl} onChange={e=>set("driveUrl",e.target.value)} /></div>
        <div className="dam-frow">
          <div className="dam-field"><label>Brand</label>
            <select className="dam-fsel" value={form.brandId} onChange={e=>set("brandId",e.target.value)}>
              {(brands||BRANDS).filter(b=>b.id!=="all").map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="dam-field"><label>Asset Type</label>
            <select className="dam-fsel" value={form.type} onChange={e=>set("type",e.target.value)}>
              <optgroup label="Digital Assets">{ASSET_CATS.filter(t=>t.id!=="all").map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</optgroup>
              <optgroup label="Merch">{MERCH_CATS.filter(m=>m.id!=="merch").map(m=><option key={m.id} value={m.id}>{m.label}</option>)}</optgroup>
            </select>
          </div>
        </div>
        <div className="dam-frow">
          <div className="dam-field"><label>Campaign</label>
            <select className="dam-fsel" value={form.campaign} onChange={e=>set("campaign",e.target.value)}>
              <option value="">None</option>
              {(campaigns||CAMPAIGNS).map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="dam-field"><label>Tags</label><input className="dam-fi" placeholder="launch, Q2, print…" value={form.tags} onChange={e=>set("tags",e.target.value)} /></div>
        </div>
        <div className="dam-field"><label>Notes</label><textarea className="dam-fta" rows={2} placeholder="Usage notes, specs…" value={form.notes} onChange={e=>set("notes",e.target.value)} /></div>
        <div className="dam-mfoot">
          <button className="dam-btn" onClick={onClose}>Cancel</button>
          <button className="dam-btn dam-btn-gold" disabled={!valid} onClick={save}>Save Asset</button>
        </div>
      </div>
    </div>
  );
}

// ─── Preview Panel ────────────────────────────────────────────────────────────

function PreviewPanel({ asset, onClose, onNote, onDel }) {
  const [loaded,   setLoaded]   = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const bc    = getBrandColor(asset.brandId);
  const thumb = getDriveThumb(asset);
  const embed = getDriveEmbed(asset.driveUrl);
  const td    = ALL_TYPES.find(t=>t.id===asset.type);

  const postNote = () => {
    if (!noteText.trim()||!onNote) return;
    onNote({section:"DAM",type:"Asset",label:asset.name,id:asset.id,prefill:noteText.trim()});
    setNoteText(""); setNoteOpen(false);
  };

  return (
    <div className="dam-preview">
      <div className="dam-phdr">
        <div style={{width:8,height:8,borderRadius:"50%",background:bc,flexShrink:0}}/>
        <div className="dam-ptitle">{asset.name}</div>
        {asset.fromDrive && <span className="dam-drive-badge" style={{marginRight:4}}>Drive</span>}
        {onNote && <button className="dam-pnote" style={{width:"auto",marginBottom:0,marginRight:8}} onClick={()=>setNoteOpen(o=>!o)}>✎ Note</button>}
        <button onClick={onClose} style={{width:28,height:28,borderRadius:7,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"rgba(255,255,255,.4)",cursor:"pointer",fontSize:16,display:"grid",placeItems:"center"}}>×</button>
      </div>
      {noteOpen && (
        <div className="dam-in-note">
          <div className="dam-in-lbl">Note on: <span style={{color:"#fff",fontWeight:400,textTransform:"none",letterSpacing:0}}>{asset.name}</span></div>
          <div className="dam-in-row">
            <textarea className="dam-in-ta" autoFocus placeholder="Add a note… (⌘↵ to post)" value={noteText} onChange={e=>setNoteText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&(e.metaKey||e.ctrlKey))postNote();}} />
            <button className="dam-in-post" disabled={!noteText.trim()} onClick={postNote}>Post →</button>
          </div>
        </div>
      )}
      <div className="dam-pwrap">
        <div className="dam-pbody">
          {embed ? (
            <>
              {thumb && <div className="dam-ghost"><img src={thumb} alt=""/></div>}
              {!loaded && <div className="dam-loading"><span className="dam-spin">◈</span><span style={{fontSize:10,color:"rgba(255,255,255,.2)",letterSpacing:".06em",textTransform:"uppercase"}}>Loading preview…</span></div>}
              <iframe src={embed} title={asset.name} allow="autoplay" style={{opacity:loaded?.9:0,transition:"opacity .4s",zIndex:loaded?3:1}} onLoad={()=>setLoaded(true)} />
            </>
          ) : (
            <div className="dam-noembed">
              <div style={{fontSize:64,opacity:.18}}>{TYPE_EMOJI[asset.type]||"📁"}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,.38)"}}>{asset.name}</div>
              <button className="dam-plink" style={{width:"auto",padding:"9px 20px"}} onClick={()=>window.open(asset.driveUrl,"_blank","noopener,noreferrer")}>Open in Google Drive ↗</button>
            </div>
          )}
        </div>
        <div className="dam-psidebar">
          <div className="dam-mlbl">Brand</div>
          <div className="dam-mval" style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:7,height:7,borderRadius:"50%",background:bc}}/>{getBrandName(asset.brandId)}</div>
          <div className="dam-mlbl">Type</div>
          <div className="dam-mval">{td?.label||asset.type}</div>
          {asset.campaign&&<><div className="dam-mlbl">Campaign</div><div className="dam-mval">{asset.campaign}</div></>}
          <div className="dam-mlbl">Added by</div>
          <div className="dam-mval">{asset.addedBy}</div>
          <div className="dam-mlbl">Date</div>
          <div className="dam-mval">{fmtDate(asset.addedAt)}</div>
          {asset.tags&&<><div className="dam-mlbl">Tags</div><div style={{marginBottom:12}}>{asset.tags.split(",").map(t=>t.trim()).filter(Boolean).map(t=><span key={t} className="dam-tag">{t}</span>)}</div></>}
          {asset.notes&&<><div className="dam-mlbl">Notes</div><div style={{fontSize:12,color:"rgba(255,255,255,.5)",lineHeight:1.65,marginBottom:12}}>{asset.notes}</div></>}
          <div style={{marginTop:8}}>
            <button className="dam-plink" onClick={()=>window.open(asset.driveUrl,"_blank","noopener,noreferrer")}>🗂 View in Google Drive ↗</button>
            {onNote&&<button className="dam-pnote" onClick={()=>setNoteOpen(o=>!o)}>✎ Add Note</button>}
            {onDel&&<button className="dam-pdel" onClick={onDel}>✕ Remove Asset</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

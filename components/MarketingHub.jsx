import { useState, useEffect, useRef, useCallback } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');`;

const ORG_ROLES = [
  {id:"exec",       title:"Executive Decision Team", parentId:null},
  {id:"ceo",        title:"Founder / CEO",           parentId:null},
  {id:"packaging",  title:"Packaging Dept.",         parentId:"exec"},
  {id:"creative",   title:"Marketing Creative Director", parentId:"ceo"},
  {id:"sales",      title:"Sales Lead",              parentId:"ceo"},
  {id:"content",    title:"Content Creator",         parentId:"creative"},
  {id:"agencies",   title:"Agencies",                parentId:"creative"},
  {id:"coordinator",title:"Marketing Coordinator",   parentId:"creative"},
  {id:"puff",       title:"Puff Creative",           parentId:"agencies"},
  {id:"studio",     title:"Studio Linear",           parentId:"agencies"},
  {id:"field",      title:"Field Team",              parentId:"sales"},
];

const DEFAULT_BRANDS = {
  headchange:{
    id:"headchange",
    name:"Headchange",
    color:"#A31C1C",
    tagline:"Change Your Head. Change Your Life.",
    story:"Missouri's premium craft hashmakers — born and raised in St. Louis, serving communities across Missouri since 2020. Headchange exists to capture the most honest expression the plant can truly provide. Input material is carefully inspected and hand-selected for quality and aroma, then fresh-frozen to perfectly preserve naturally-occurring cannabinoids and terpenes. The result: big aromas, exotic drops, and a dab experience defined by terpene integrity. No shortcuts. No CRC. Ever.",
    mission:"Curate the best possible cannabis experiences — through craft extraction, terpene preservation, and uncompromising process standards.",
    values:["Terpene Integrity","No CRC — Ever","Fresh-Frozen Process","Craft Over Commodity","Locally-Grown Input"],
    audience:"Concentrate enthusiasts and hash heads, 25–45, who prioritize terpene quality, extraction method, and authenticity. Budtenders and industry insiders. Consumers who research before they buy and know what CRC means.",
    tone:"Confident, craft-forward, with a street-level personality. Direct and honest — 'Premium Hash. No BS.' Speaks to enthusiasts without being inaccessible. Can be playful (Flavorful AF) while staying technically credible.",
    typography:"DM Serif Display / DM Sans",
    secondary:"#F5E6C8",
    products:"Live Rosin Concentrate — award-winning, hand-washed, terpiest dab experience · Live Sugar Concentrate — THCa diamonds in terp sauce · Live Badder Concentrate — hand-whipped, terp-rich cake batter consistency · Live Sauce Carts — liquid diamonds & sauce in a cart",
    positioning:"Flagship / Connoisseur — Missouri's recognized hash leader. Sets quality ceiling for the CÚRADOR portfolio. Never uses CRC.",
    website:"headchange710.com"
  },
  bubbles:{
    id:"bubbles",
    name:"Bubbles",
    color:"#7B68B5",
    tagline:"Hi, Bubbs!",
    story:"Bubbles is all about bright, juicy flavors that burst across your taste buds in waves of sweet, tangy bliss. From the first inhale to the last draw, you'll be met with mouth-watering terp profiles you'll want to keep coming back to. A flavor-forward vape brand with colorful devices and an uplifting experience that's as fun as it is flavorful. With Bubbles, there's a flavor for every mood — whether you need something energizing, balanced, mellow, or exotic. Meet your new favorite.",
    mission:"Make every pull an experience — bold flavor, vibrant energy, and a vibe that keeps people coming back.",
    values:["Flavor First","Vibrant & Colorful","Uplifting Energy","Mood-Matched Experience","Fun & Accessible"],
    audience:"Casual and recreational consumers, 21–35, who choose by flavor and mood rather than strain science. New-to-cannabis and discretion-forward users. Anyone who wants their cannabis experience to feel fun, bright, and easy.",
    tone:"Bubbly, energetic, sensory-forward. Playful without being juvenile. Speaks in flavor and feeling — 'like a sparkler for your taste buds' / 'a getaway in every hit.' Light, inviting, zero barriers.",
    typography:"Cormorant Garamond / DM Sans",
    secondary:"#F0EBF8",
    products:"Atomic Burst (Sativa) — cherry, blue raspberry & lime · Blue Raz (Indica) — ripened raspberry with tangy citrus · Sweet Dreamz (Indica) — smooth fruity sweetness, mellow vibes · Tiger's Blood (Hybrid) — juicy watermelon & bright citrus · Watermelon Ice (Hybrid) — fresh juicy watermelon, cooled & refreshing · Breezy Blast (Exotic) — tropical lime, crisp & zesty",
    positioning:"Flavor & convenience — captures discretion-focused and casual vape consumers. Non-CDT distillate contrast to SafeBet's cannabis-authentic positioning.",
    website:"bubblesvape.com"
  },
  safebet:{
    id:"safebet",
    name:"SafeBet",
    color:"#C97820",
    tagline:"It's a Safe Bet.",
    story:"SafeBet is reliability without compromise. Built for consumers who want quality pre-rolls, blunts, and carts they can always count on — rolled tight, packed right, and priced fair. Every joint, cart, and blunt hits the same: clean, smooth, and just right. No guesswork, no surprises. SafeBet's promise is simple: you always know what you're getting. For people who like their smoke smooth and their choices easy.",
    mission:"Deliver reliable quality every time — clean, consistent, and priced fair. Be the brand consumers reach for without thinking twice.",
    values:["Consistency Every Time","Priced Fair","Clean & Smooth","No Surprises","Simple Done Right"],
    audience:"Everyday cannabis consumers who value reliability, consistency, and fair pricing over novelty or connoisseur credentials. Daily-driver buyers, 21–50, who want authentic strain profiles without premium price tags. Pre-roll and cart loyalists.",
    tone:"Straightforward, warm, unpretentious. Let the product do the talking. No hype, no jargon. 'Rolled tight, packed right, priced fair' — honest and direct. Approachable authority.",
    typography:"DM Serif Display / DM Sans",
    secondary:"#FFF4E0",
    products:"Rolls — hand-crafted pre-rolls, top-shelf flower, perfectly ground, smooth even burn · Carts — high-purity distillate, real strain-specific cannabis terpenes (CDTs), consistent potency · FECO — full-spectrum cannabis oil, full-spectrum cannabinoids & terpenes, flexible format, rigorously tested per Missouri DCR",
    positioning:"Mid-tier / everyday — cannabis-authentic CDT experience at fair price. The dependable daily-driver between Bubbles (flavor/convenience) and Headchange (premium connoisseur).",
    website:"safebetofficial.com",
    instagram:"@SafeBet_Rolls"
  },
};

const DEFAULT_COMPANY = {
  name:"CÚRADOR",
  tagline:"Quality. Craft. Culture.",
  ethos:"CÚRADOR is a Missouri-licensed cannabis manufacturing company operating under a house of brands model — awarded a manufacturing license in the first round of Missouri medical cannabis licensing. Operating as a micro-scale manufacturing lab, CÚRADOR competes not on volume but on quality, execution, and cultural credibility. The company's philosophy is rooted in the belief that craft craftsmanship and internal culture are sustainable competitive advantages in saturated markets: smaller batches, higher standards, and brands built through reputation rather than hype. CÚRADOR also manufactures and distributes AiroPro, a third-party licensed brand using proprietary cartridge technology, providing additional manufacturing throughput and operational leverage.",
  mission:"Sustainable growth through reputation, consistency, and disciplined brand management — building brands that earn long-term consumer trust across every tier of the Missouri cannabis market.",
  values:["Craft Over Volume","Brand Stewardship","Operational Consistency","Cultural Credibility","Disciplined Portfolio Management"],
  model:"Hybrid: proprietary brand development (Headchange, SafeBet, Bubbles) + licensed manufacturing & distribution (AiroPro). Each brand serves a distinct consumer segment with no internal overlap.",
  context:"Missouri's cannabis market is highly competitive — characterized by rapid brand proliferation, price compression, and increasing pressure to differentiate beyond packaging. CÚRADOR's response: quality-driven manufacturing, not commodity production."
};

const DEFAULT_STRATEGY = {brand:"Curador Brands",tagline:"Marketing that moves people.",vision:"Our North Star is to build a connected, insight-driven marketing ecosystem that turns brand moments into lasting cultural relevance — for brands that heal, inspire, and endure.",pillars:["Brand & Identity","Content & Storytelling","Paid & Performance","Community & Partnerships"]};

const DEFAULT_GANTT_URL = "/concepts/gantt.html";

const DEFAULT_INITIATIVES = [
  {id:"init-h2h",     title:"How to Hash Guide",           description:"Branded 'How to Hash' educational booklet placed at point of sale across all partner dispensaries. Covers concentrate types, consumption methods, dosing guidance, and strain profiles. Positions Headchange and CÚRADOR as the authority on craft concentrates in Missouri.", owner:"Brand Team", channel:"12 · In-Store Consumer Education", startDate:"2026-01-01", endDate:"", revolving:true,  fileUrl:null, fileName:null, _brief:null, brandId:"headchange", htmlConcept:null, htmlConceptName:"How to Hash Guide", _conceptUrl:"/concepts/how-to-hash.html"},
  {id:"init-buddrops", title:"Bud Drops",                  description:"BudDrops is Headchange's exclusive verified limited-allocation program for top budtenders and cannabis connoisseurs. Quarterly drops of premium craft concentrates, early access to new strains, and a direct connection between Headchange and its most passionate advocates.",    owner:"Brand Team", channel:"11 · Budtender Appreciation Program",  startDate:"2026-01-01", endDate:"", revolving:true,  fileUrl:null, fileName:null, _brief:null, brandId:"headchange", htmlConcept:null, htmlConceptName:"Bud Drops",         _conceptUrl:"/concepts/bud-drops.html"},
  {id:"init-hashnotes",title:"HashNotes",                  description:"HashNotes is Headchange's digital content platform and newsletter — a direct line to concentrate connoisseurs covering craft rosin culture, strain profiles, terpene education, and behind-the-scenes from the lab.",                                                                    owner:"Brand Team", channel:"06 · Social Media Strategy",            startDate:"2026-01-01", endDate:"", revolving:true,  fileUrl:null, fileName:null, _brief:null, brandId:"headchange", htmlConcept:null, htmlConceptName:"HashNotes",         _conceptUrl:"/concepts/hashnotes.html"},
  {id:"init-hq",       title:"Hash Headquarters",          description:"Hash Headquarters is Headchange's flagship experiential concept — a physical and digital hub for craft concentrate culture in Missouri. Part education center, part brand immersion, part community gathering space.",                                                                     owner:"Brand Team", channel:"07 · Reimagined Events",               startDate:"2026-01-01", endDate:"", revolving:true,  fileUrl:null, fileName:null, _brief:null, brandId:"headchange", htmlConcept:null, htmlConceptName:"Hash Headquarters",  _conceptUrl:"/concepts/hash-headquarters.html"},
  {id:"init-hc-social",title:"Headchange Social Strategy", description:"A comprehensive social media strategy for Headchange — defining the brand voice, content pillars, posting cadence, and platform approach for Instagram-first connoisseur culture.",                                                                                                    owner:"Brand Team", channel:"06 · Social Media Strategy",            startDate:"2026-01-01", endDate:"", revolving:true,  fileUrl:null, fileName:null, _brief:null, brandId:"headchange", htmlConcept:null, htmlConceptName:"HC Social Strategy", _conceptUrl:"/concepts/hc-social.html"},
];

const CHANNELS = [
  "01 · Packaging & QR Journey",
  "02 · In-House Loyalty & Rewards",
  "03 · Email & SMS Marketing",
  "04 · SEO & Web Ecosystem",
  "05 · Online Menu Advertising",
  "06 · Social Media Strategy",
  "07 · Reimagined Events",
  "08 · PR Strategy",
  "09 · Field Marketing Rework",
  "10 · Tiered In-Store Display",
  "11 · Budtender Appreciation Program",
  "12 · In-Store Consumer Education",
  "13 · Brand Merchandise Programs",
];
const CHANNEL_COLORS = ["#c9a84c","#4d9e8e","#8b7fc0","#5a9ed4","#a0624a","#e07b6a","#c9a84c","#4d9e8e","#8b7fc0","#5a9ed4","#a0624a","#e07b6a","#c9a84c"];
const PILLAR_ACCENTS = [{grad:"linear-gradient(135deg,#c9a84c,#a07030)",solid:"#c9a84c"},{grad:"linear-gradient(135deg,#8b7fc0,#5a4e8a)",solid:"#8b7fc0"},{grad:"linear-gradient(135deg,#4d9e8e,#2e6e61)",solid:"#4d9e8e"},{grad:"linear-gradient(135deg,#a0624a,#6e3820)",solid:"#a0624a"}];

function getChannelColor(channel) {
  const idx = CHANNELS.indexOf(channel);
  return idx >= 0 ? CHANNEL_COLORS[idx] : "#c9a84c";
}
const USER_COLORS = [{bg:"#e8c547",text:"#1a1400",label:"Amber"},{bg:"#7ec8a4",text:"#0a1f14",label:"Sage"},{bg:"#e07b6a",text:"#1f0b08",label:"Coral"},{bg:"#89a8e0",text:"#080f20",label:"Slate"},{bg:"#c47eb5",text:"#1a0b18",label:"Mauve"},{bg:"#68c4c4",text:"#062020",label:"Teal"},{bg:"#e09e5a",text:"#1f1008",label:"Ochre"},{bg:"#a8c46a",text:"#111a04",label:"Fern"}];

function colorForName(n){let h=0;for(let i=0;i<n.length;i++)h=(h*31+n.charCodeAt(i))%USER_COLORS.length;return USER_COLORS[h];}
function initials(n){return n.trim().split(/\s+/).map(w=>w[0]).join("").toUpperCase().slice(0,2);}
function relativeTime(ts){const d=Date.now()-new Date(ts).getTime(),m=Math.floor(d/60000);if(m<1)return"just now";if(m<60)return`${m}m ago`;const h=Math.floor(m/60);if(h<24)return`${h}h ago`;return new Date(ts).toLocaleDateString("en-US",{month:"short",day:"numeric"});}
function fmtDate(d){if(!d)return"";try{const dt=new Date(d+"T12:00:00");return dt.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"2-digit"});}catch{return d;}}
function dateProgress(start,end){
  if(!start||!end) return null;
  const s=new Date(start).getTime(), e=new Date(end).getTime(), n=Date.now();
  if(n<=s) return 0;
  if(n>=e) return 100;
  return Math.round((n-s)/(e-s)*100);
}

const css = `
${FONTS}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#07070f;--surface:#0d0d1a;--surface2:#121222;--surface3:#171730;
  --border:rgba(255,255,255,.07);--border2:rgba(255,255,255,.035);
  --gold:#c9a84c;--gold-light:#e2c06a;--gold-dim:rgba(201,168,76,.13);
  --text:#ede8df;--text-dim:#b8b4cc;--text-muted:#8a87a8;
  --df:'Cormorant Garamond',Georgia,serif;--bf:'DM Sans',system-ui,sans-serif;
  --lsb:272px;--nw:318px;
}
html,body{background:var(--bg);min-height:100vh;}
.page{display:flex;flex-direction:column;min-height:100vh;background:var(--bg);}

/* HEADER */
.hdr{display:flex;align-items:center;justify-content:space-between;padding:13px 24px;border-bottom:1px solid var(--border);background:rgba(7,7,15,.92);position:sticky;top:0;z-index:70;backdrop-filter:blur(18px);flex-shrink:0;}
.hdr-brand{display:flex;align-items:center;gap:11px;}
.hdr-logo{width:30px;height:30px;background:linear-gradient(135deg,var(--gold),#a07030);border-radius:7px;display:grid;place-items:center;font-family:var(--df);font-size:16px;color:var(--bg);font-weight:600;flex-shrink:0;}
.hdr-name{font-family:var(--df);font-size:17px;font-weight:500;letter-spacing:.02em;}
.hdr-sub{font-size:9px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.13em;margin-top:1px;}
.hdr-right{display:flex;gap:7px;align-items:center;}

/* BODY */
.body-row{display:flex;flex:1;overflow:hidden;height:calc(100vh - 57px);}

/* LEFT SIDEBAR */
.lsb{width:var(--lsb);flex-shrink:0;border-right:1px solid var(--border);background:var(--surface);display:flex;flex-direction:column;transition:width .3s cubic-bezier(.4,0,.2,1);overflow:hidden;}
.lsb.collapsed{width:48px;}
.lsb-top{display:flex;align-items:center;justify-content:space-between;padding:12px 12px 10px;border-bottom:1px solid var(--border2);flex-shrink:0;min-height:46px;}
.lsb-top-title{font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--text-muted);font-weight:500;white-space:nowrap;overflow:hidden;}
.lsb-cb{width:22px;height:22px;border-radius:5px;border:1px solid var(--border);background:transparent;color:var(--text-muted);cursor:pointer;display:grid;place-items:center;font-size:10px;flex-shrink:0;transition:all .15s;}
.lsb-cb:hover{border-color:var(--gold);color:var(--gold);}
.lsb-nav{display:flex;flex-direction:column;gap:2px;padding:8px 7px;border-bottom:1px solid var(--border2);flex-shrink:0;}
.lsb-tab{display:flex;align-items:center;gap:9px;padding:8px 9px;border-radius:7px;border:none;background:transparent;color:var(--text-dim);cursor:pointer;font-family:var(--bf);font-size:11px;font-weight:500;text-align:left;transition:all .15s;white-space:nowrap;width:100%;}
.lsb-tab:hover{background:rgba(255,255,255,.04);color:var(--text);}
.lsb-tab.on{background:var(--gold-dim);color:var(--gold);}
.lsb-icon{font-size:13px;flex-shrink:0;width:18px;text-align:center;}
.lsb-lbl{overflow:hidden;white-space:nowrap;}
.lsb-body{flex:1;overflow-y:auto;}

/* ── COMPANY PANEL TABS ── */
.cp-nav{display:flex;flex-direction:column;padding:10px 8px;gap:4px;}
.cp-master-tab{width:100%;padding:11px 13px;border:none;border-radius:9px;background:var(--surface2);cursor:pointer;font-family:var(--bf);text-align:left;transition:all .18s;border:1px solid var(--border2);display:flex;align-items:center;gap:10px;}
.cp-master-tab:hover{border-color:rgba(201,168,76,.3);background:rgba(201,168,76,.04);}
.cp-master-tab.on{border-color:rgba(201,168,76,.4);background:rgba(201,168,76,.07);}
.cp-master-tab-logo{width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,var(--gold),#a07030);display:grid;place-items:center;font-family:var(--df);font-size:15px;color:var(--bg);font-weight:600;flex-shrink:0;}
.cp-master-tab-name{font-family:var(--df);font-size:15px;font-weight:400;color:var(--text);line-height:1.1;}
.cp-master-tab-sub{font-size:9px;color:var(--text-muted);letter-spacing:.09em;text-transform:uppercase;margin-top:1px;}
.cp-master-tab.on .cp-master-tab-name{color:var(--gold);}
.cp-brands-lbl{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--text-muted);padding:8px 6px 4px;font-weight:500;}
.cp-brand-tab{width:100%;padding:8px 10px;border:none;border-radius:8px;background:transparent;cursor:pointer;font-family:var(--bf);text-align:left;transition:all .15s;border:1px solid transparent;display:flex;align-items:center;gap:9px;}
.cp-brand-tab:hover{background:var(--surface2);border-color:var(--border2);}
.cp-brand-tab.on{background:var(--surface2);}
.cp-brand-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;}
.cp-brand-name{font-size:12px;font-weight:500;color:var(--text);}
.cp-brand-tagline{font-size:10px;color:var(--text-muted);font-style:italic;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.cp-brand-arr{font-size:11px;margin-left:auto;flex-shrink:0;}
.cp-brand-chevron{font-size:9px;flex-shrink:0;transition:transform .18s;color:var(--text-muted);}
.cp-brand-chevron.open{transform:rotate(90deg);}
/* Brand initiative dropdown in sidebar */
.cp-brand-inits{padding:4px 6px 6px 14px;display:flex;flex-direction:column;gap:3px;}
.cp-init-row{display:flex;align-items:center;gap:7px;padding:6px 8px;border-radius:7px;cursor:pointer;border:1px solid transparent;transition:all .13s;background:transparent;}
.cp-init-row:hover{background:var(--surface2);border-color:var(--border2);}
.cp-init-dot{width:4px;height:4px;border-radius:50%;flex-shrink:0;}
.cp-init-title{font-size:11px;color:var(--text-dim);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.cp-init-qtr{font-size:9px;color:var(--text-muted);flex-shrink:0;}
.cp-brand-add{display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:6px;border:1px dashed rgba(255,255,255,.07);background:transparent;color:var(--text-muted);font-family:var(--bf);font-size:10px;cursor:pointer;width:100%;margin-top:2px;transition:all .13s;text-align:left;}
.cp-brand-add:hover{border-color:rgba(201,168,76,.3);color:var(--gold);}
/* Brand initiative grid in detail view */
.bi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;padding:0;}
.bi-card{background:var(--surface2);border-radius:10px;padding:14px 15px;cursor:pointer;transition:all .15s;border:1px solid var(--border2);border-left-width:2px;display:flex;flex-direction:column;gap:6px;}
.bi-card:hover{background:var(--surface3);border-color:rgba(255,255,255,.1);}
.bi-pillar{font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:var(--text-muted);}
.bi-title{font-size:13px;font-weight:500;color:var(--text);line-height:1.35;}
.bi-desc{font-size:11px;color:var(--text-muted);line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.bi-foot{display:flex;align-items:center;justify-content:space-between;margin-top:2px;}
.bi-owner{font-size:10px;color:var(--text-muted);}
.bi-qtr{font-size:10px;color:var(--text-muted);}
/* Brand selector in Add Initiative modal */
.brand-sel-row{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;}
.brand-sel-chip{padding:5px 11px;border-radius:100px;border:1px solid var(--border);background:transparent;color:var(--text-muted);font-family:var(--bf);font-size:11px;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:6px;}
.brand-sel-chip:hover{border-color:rgba(255,255,255,.15);color:var(--text);}
.brand-sel-chip.on{color:var(--text);}
.brand-sel-pip{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
/* Brief upload */
.bu-zone{border:2px dashed rgba(255,255,255,.09);border-radius:12px;padding:24px 20px;text-align:center;cursor:pointer;transition:all .18s;}
.bu-zone:hover,.bu-zone.drag{border-color:rgba(201,168,76,.4);background:rgba(201,168,76,.04);}
.bu-icon{font-size:26px;margin-bottom:8px;display:block;opacity:.5;}
.bu-title{font-size:14px;color:var(--text-dim);margin-bottom:3px;}
.bu-sub{font-size:11px;color:var(--text-muted);}
.bu-file-row{display:flex;align-items:center;gap:9px;padding:9px 12px;background:rgba(201,168,76,.07);border:1px solid rgba(201,168,76,.2);border-radius:8px;margin-bottom:10px;}
.bu-file-name{font-size:12px;color:var(--gold);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.bu-file-rm{background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:15px;line-height:1;transition:color .13s;padding:0 2px;}
.bu-file-rm:hover{color:var(--text);}
.bu-processing{display:flex;align-items:center;gap:10px;padding:14px;background:var(--surface2);border-radius:9px;border:1px solid var(--border2);margin-bottom:12px;}
.bu-proc-txt{font-size:12px;color:var(--text-dim);}
.bu-preview{background:var(--surface2);border:1px solid var(--border2);border-radius:10px;padding:14px 15px;margin-bottom:12px;}
.bu-prev-title{font-family:var(--df);font-size:17px;color:var(--text);margin-bottom:6px;line-height:1.2;}
.bu-prev-body{font-size:12px;color:var(--text-dim);line-height:1.7;}
.bu-prev-chips{display:flex;gap:5px;flex-wrap:wrap;margin-top:8px;}
.bu-prev-chip{font-size:10px;padding:2px 8px;border-radius:100px;background:rgba(201,168,76,.1);color:var(--gold);border:1px solid rgba(201,168,76,.15);}
.bi-card.from-brief{border-top:2px solid var(--gold);}
.bi-brief-badge{font-size:8px;padding:1px 6px;border-radius:100px;background:rgba(201,168,76,.1);color:var(--gold);border:1px solid rgba(201,168,76,.15);font-weight:600;letter-spacing:.04em;text-transform:uppercase;}
.cp-hero{padding:16px 14px 12px;border-bottom:1px solid var(--border2);}
.cp-eyebrow{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);margin-bottom:7px;font-weight:600;}
.cp-name{font-family:var(--df);font-size:21px;font-weight:300;color:var(--text);line-height:1.1;margin-bottom:4px;}
.cp-tagline{font-size:11px;color:var(--text-dim);font-style:italic;margin-bottom:10px;}
.cp-txt{font-size:11.5px;color:var(--text-dim);line-height:1.8;}
.cp-section{padding:11px 14px;border-bottom:1px solid var(--border2);}
.cp-sec-lbl{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--text-muted);margin-bottom:7px;font-weight:500;}
.cp-val{display:flex;align-items:center;gap:8px;font-size:11.5px;color:var(--text-dim);padding:3px 0;}
.cp-val::before{content:'';width:4px;height:4px;border-radius:50%;background:var(--gold);flex-shrink:0;}
.cp-mission-txt{font-size:11.5px;color:var(--text-dim);line-height:1.75;font-style:italic;}

/* ── BRAND CARD (full) ── */
.bc-header{padding:0;margin-bottom:0;}
.bc-banner{height:5px;width:100%;flex-shrink:0;}
.bc{padding:14px 14px 18px;}
.bc-hdr{display:flex;align-items:center;gap:10px;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--border2);}
.bc-swatch{width:28px;height:28px;border-radius:8px;flex-shrink:0;}
.bc-name{font-family:var(--df);font-size:19px;font-weight:400;color:var(--text);}
.bc-tagline{font-size:11px;font-style:italic;}
.bc-sec{margin-bottom:13px;}
.bc-lbl{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--text-muted);margin-bottom:6px;font-weight:500;}
.bc-txt{font-size:11.5px;color:var(--text-dim);line-height:1.78;}
.bc-pills{display:flex;flex-wrap:wrap;gap:4px;}
.bc-pill{font-size:10px;padding:3px 9px;border-radius:100px;font-weight:500;border:1px solid;}
.bc-gr{display:flex;align-items:flex-start;gap:8px;padding:5px 0;border-bottom:1px solid var(--border2);font-size:11px;}
.bc-gr:last-child{border:none;}
.bc-gk{font-size:9px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em;width:70px;flex-shrink:0;padding-top:1px;}
.bc-gv{color:var(--text-dim);flex:1;}
.bc-cswatch{width:13px;height:13px;border-radius:3px;flex-shrink:0;margin-top:1px;}
.bc-color-row{display:flex;align-items:center;gap:7px;}

/* ── TEAM PANEL ── */
.tp{padding:0;}
.tp-org{padding:14px 12px 8px;border-bottom:1px solid var(--border2);}
.org-lbl{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--text-muted);margin-bottom:12px;font-weight:500;}
.org-chart{display:flex;flex-direction:column;align-items:center;gap:0;}
.org-level{display:flex;justify-content:center;gap:5px;padding:0 4px;}
.org-level-gap{height:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.org-vert{width:1px;background:var(--border);flex:1;}
.org-horiz{display:flex;align-items:center;width:100%;}
.org-horiz-line{height:1px;background:var(--border);flex:1;}
.org-node{display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;transition:transform .15s;}
.org-node:hover{transform:translateY(-1px);}
.org-box{padding:5px 9px;border-radius:7px;border:1px solid var(--border);background:var(--surface2);font-size:9px;font-weight:500;color:var(--text-dim);text-align:center;transition:all .15s;white-space:nowrap;line-height:1.3;}
.org-node:hover .org-box{border-color:rgba(201,168,76,.35);color:var(--text);background:rgba(201,168,76,.04);}
.org-node.populated .org-box{border-color:rgba(201,168,76,.25);background:rgba(201,168,76,.05);color:var(--text);}
.org-node.me .org-box{border-color:var(--gold);color:var(--gold);background:rgba(201,168,76,.07);}
.org-avs{display:flex;justify-content:center;margin-top:1px;}
.org-av{width:16px;height:16px;border-radius:50%;border:1.5px solid var(--surface);display:grid;place-items:center;font-size:7px;font-weight:700;margin-left:-3px;}
.org-av:first-child{margin-left:0;}
.tp-members{padding:10px 10px 6px;}
.team-lbl{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--text-muted);margin-bottom:8px;font-weight:500;}
.member-row{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:9px;border:1px solid var(--border2);cursor:pointer;transition:all .15s;margin-bottom:5px;}
.member-row:hover{border-color:rgba(255,255,255,.1);background:rgba(255,255,255,.02);}
.member-av{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-size:11px;font-weight:700;flex-shrink:0;}
.member-info{flex:1;min-width:0;}
.member-name{font-size:12px;font-weight:500;color:var(--text);}
.member-role{font-size:10px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.me-badge{font-size:9px;padding:2px 6px;border-radius:100px;background:var(--gold-dim);color:var(--gold);border:1px solid rgba(201,168,76,.2);margin-left:auto;flex-shrink:0;}
.empty-team{padding:20px 8px;text-align:center;color:var(--text-muted);font-size:12px;line-height:1.75;}
.tp-add-btn{margin:4px 10px 10px;width:calc(100% - 20px);padding:8px;border-radius:8px;border:1px dashed rgba(255,255,255,.08);background:transparent;color:var(--text-muted);font-family:var(--bf);font-size:11px;cursor:pointer;transition:all .15s;}
.tp-add-btn:hover{border-color:rgba(201,168,76,.3);color:var(--gold);}

/* ── CHANNELS PANEL ── */
.ch-hdr{padding:11px 12px 8px;border-bottom:1px solid var(--border2);display:flex;align-items:center;justify-content:space-between;}
.ch-hdr-lbl{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--text-muted);font-weight:500;}
.ch-hdr-ct{font-size:10px;color:var(--text-muted);}
.ch-pillar{padding:8px 10px 4px;}
.ch-p-hdr{display:flex;align-items:center;gap:7px;margin-bottom:6px;padding:5px 6px;border-radius:6px;}
.ch-p-stripe{width:3px;height:28px;border-radius:2px;flex-shrink:0;}
.ch-p-name{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.09em;color:var(--text-dim);flex:1;}
.ch-p-ct{font-size:9px;color:var(--text-muted);background:var(--surface2);padding:2px 6px;border-radius:100px;border:1px solid var(--border2);}
.ch-card{padding:9px 10px;background:var(--surface2);border:1px solid var(--border2);border-radius:8px;margin-bottom:4px;cursor:pointer;transition:all .15s;border-left-width:2px;}
.ch-card:hover{border-color:rgba(255,255,255,.12);background:rgba(255,255,255,.02);}
.ch-card.active{background:var(--gold-dim);}
.ch-card-title{font-size:11.5px;font-weight:500;color:var(--text);line-height:1.35;margin-bottom:3px;}
.ch-card-desc{font-size:10.5px;color:var(--text-muted);line-height:1.55;margin-bottom:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.ch-card-meta{display:flex;align-items:center;justify-content:space-between;font-size:10px;color:var(--text-muted);}
.ch-card-badge{font-size:9px;padding:1px 6px;border-radius:100px;background:rgba(201,168,76,.1);color:var(--gold);border:1px solid rgba(201,168,76,.15);}

/* ── CAMPAIGNS PANEL ── */
.cmp-hdr{padding:11px 12px 9px;border-bottom:1px solid var(--border2);display:flex;align-items:center;justify-content:space-between;}
.cmp-hdr-lbl{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--text-muted);font-weight:500;}
.cmp-list{padding:8px 8px;display:flex;flex-direction:column;gap:5px;}
.cmp-card{background:var(--surface2);border:1px solid var(--border2);border-radius:10px;padding:11px 12px;cursor:pointer;transition:all .15s;border-left-width:2px;}
.cmp-card:hover{border-color:rgba(255,255,255,.1);background:rgba(255,255,255,.015);}
.cmp-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:5px;}
.cmp-card-title{font-size:12px;font-weight:500;color:var(--text);line-height:1.3;flex:1;}
.cmp-status{font-size:8.5px;padding:2px 7px;border-radius:100px;font-weight:600;letter-spacing:.05em;flex-shrink:0;text-transform:uppercase;}
.cmp-status.idea{background:rgba(201,168,76,.12);color:var(--gold);border:1px solid rgba(201,168,76,.2);}
.cmp-status.brief{background:rgba(139,127,192,.12);color:#8b7fc0;border:1px solid rgba(139,127,192,.2);}
.cmp-status.approved{background:rgba(77,158,142,.12);color:#4d9e8e;border:1px solid rgba(77,158,142,.2);}
.cmp-card-desc{font-size:11px;color:var(--text-dim);line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.cmp-card-foot{display:flex;align-items:center;justify-content:space-between;margin-top:6px;}
.cmp-card-brand{font-size:10px;color:var(--text-muted);}
.cmp-card-arr{font-size:11px;color:var(--text-muted);}
.cmp-empty{padding:32px 14px;text-align:center;color:var(--text-muted);font-size:12px;line-height:1.75;}
.cmp-empty-icon{font-size:28px;display:block;margin-bottom:10px;opacity:.4;}

/* MAIN */
.main{flex:1;min-width:0;overflow-y:auto;transition:margin-right .35s cubic-bezier(.4,0,.2,1);}
.main.nr{margin-right:var(--nw);}
.hub{background:var(--bg);color:var(--text);font-family:var(--bf);font-size:14px;line-height:1.5;}

/* HERO */
.hero{position:relative;overflow:hidden;}
.hero-glow{position:absolute;top:-200px;left:35%;transform:translateX(-50%);width:800px;height:600px;background:radial-gradient(ellipse at 50% 0%,rgba(201,168,76,.07) 0%,transparent 65%);pointer-events:none;}
.hero-glow2{position:absolute;bottom:-80px;right:-60px;width:450px;height:450px;background:radial-gradient(ellipse at 80% 80%,rgba(139,127,192,.05) 0%,transparent 65%);pointer-events:none;}
.hero-line{position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent 0%,rgba(201,168,76,.7) 20%,rgba(201,168,76,.3) 60%,transparent 100%);}
.hero-edit{position:absolute;top:20px;right:36px;z-index:5;}
.hero-inner{position:relative;padding:56px 44px 48px;}
.hero-kicker{display:flex;align-items:center;gap:14px;margin-bottom:32px;opacity:0;animation:fadeUp .5s .05s ease forwards;}
.hero-kicker-line{height:1px;width:40px;background:var(--gold);flex-shrink:0;}
.hero-kicker-txt{font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:var(--gold);font-weight:600;}
.hero-kicker-sep{width:3px;height:3px;border-radius:50%;background:var(--text-muted);flex-shrink:0;}
.hero-kicker-brand{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--text-muted);}
.hero-hl{font-family:var(--df);font-size:clamp(44px,5.5vw,82px);font-weight:300;line-height:.9;letter-spacing:-.01em;margin-bottom:40px;opacity:0;animation:fadeUp .6s .13s ease forwards;}
.hero-hl span{display:block;color:var(--text);}
.hero-hl em{display:block;font-style:italic;color:var(--gold);}
.hero-body{display:grid;grid-template-columns:1fr 220px;gap:56px;align-items:start;opacity:0;animation:fadeUp .6s .22s ease forwards;}
.hero-vlbl{font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:var(--text-muted);margin-bottom:12px;}
.hero-vtxt{font-size:13px;color:var(--text-dim);line-height:2;}
.hero-albl{font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:var(--text-muted);margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid var(--border2);}
.hnum{display:flex;align-items:baseline;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--border2);}
.hnum:last-child{border:none;}
.hnum-val{font-family:var(--df);font-size:38px;font-weight:300;color:var(--text);line-height:1;}
.hnum-lbl{font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.1em;text-align:right;}
.pillars{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--border);opacity:0;animation:fadeUp .6s .3s ease forwards;}
.pillar-cell{padding:22px 22px 20px;border-right:1px solid var(--border);position:relative;overflow:hidden;cursor:pointer;transition:background .25s;}
.pillar-cell:last-child{border-right:none;}
.pillar-cell:hover{background:rgba(255,255,255,.014);}
.pillar-cell.active{background:rgba(201,168,76,.025);}
.pillar-num{font-family:var(--df);font-size:48px;font-weight:300;line-height:1;margin-bottom:8px;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.pillar-name{font-size:11px;font-weight:500;color:var(--text);line-height:1.45;}
.pillar-count{margin-top:8px;font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.1em;}
.pillar-bar{position:absolute;bottom:0;left:0;height:2px;transition:width .55s ease;}
.ctrl{padding:14px 44px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;border-bottom:1px solid var(--border2);}
.fchip{font-size:11px;padding:5px 13px;border-radius:100px;border:1px solid var(--border);background:transparent;color:var(--text-muted);cursor:pointer;font-family:var(--bf);transition:all .15s;letter-spacing:.04em;}
.fchip:hover,.fchip.on{background:var(--gold-dim);border-color:rgba(201,168,76,.3);color:var(--gold);}
.vtog{display:flex;background:var(--surface);border:1px solid var(--border);border-radius:8px;overflow:hidden;}
.vbtn{padding:5px 15px;font-size:11px;border:none;background:transparent;color:var(--text-muted);cursor:pointer;font-family:var(--bf);transition:all .15s;letter-spacing:.06em;text-transform:uppercase;}
.vbtn.on{background:var(--gold-dim);color:var(--gold);}
.board{padding:20px 44px 50px;display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:13px;}
.card{background:var(--surface);border:1px solid var(--border);border-radius:13px;padding:22px;cursor:pointer;transition:transform .2s,box-shadow .2s,border-color .2s;position:relative;overflow:hidden;animation:fadeUp .4s ease both;}
.card:hover{transform:translateY(-3px);box-shadow:0 16px 44px rgba(0,0,0,.4);border-color:rgba(255,255,255,.1);}
.card.hl{border-color:var(--gold);box-shadow:0 0 0 1px rgba(201,168,76,.2);}
.card-bar{position:absolute;top:0;left:0;right:0;height:2px;}
.card-pillar{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--text-muted);margin-bottom:12px;display:flex;align-items:center;gap:7px;}
.card-revolving{display:inline-flex;align-items:center;gap:4px;font-size:9px;padding:1px 7px;border-radius:100px;background:rgba(77,158,142,.1);color:#4d9e8e;border:1px solid rgba(77,158,142,.2);font-weight:600;letter-spacing:.05em;text-transform:uppercase;}
.card-date-bar{display:flex;align-items:center;gap:6px;padding:7px 0 4px;margin-top:2px;margin-bottom:4px;}
.card-date-lbl{font-size:9px;text-transform:uppercase;letter-spacing:.09em;color:var(--text-muted);flex-shrink:0;}
.card-date-track{flex:1;height:3px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden;position:relative;}
.card-date-fill{height:100%;border-radius:2px;transition:width .4s ease;}
.card-date-range{font-size:10px;color:var(--text-muted);white-space:nowrap;flex-shrink:0;}
/* Revolving toggle */
.rev-toggle{display:flex;align-items:center;gap:9px;padding:10px 13px;border-radius:9px;border:1px solid var(--border2);background:var(--surface2);cursor:pointer;transition:all .15s;user-select:none;}
.rev-toggle:hover{border-color:rgba(77,158,142,.3);}
.rev-toggle.on{border-color:rgba(77,158,142,.35);background:rgba(77,158,142,.07);}
.rev-knob{width:30px;height:16px;border-radius:100px;border:1px solid var(--border);background:var(--surface);position:relative;flex-shrink:0;transition:all .18s;}
.rev-toggle.on .rev-knob{background:rgba(77,158,142,.3);border-color:rgba(77,158,142,.5);}
.rev-pip{width:10px;height:10px;border-radius:50%;background:var(--text-muted);position:absolute;top:2px;left:2px;transition:all .18s;}
.rev-toggle.on .rev-pip{left:16px;background:#4d9e8e;}
.rev-icon{font-size:14px;flex-shrink:0;}
.rev-info{flex:1;}
.rev-lbl{font-size:12px;font-weight:500;color:var(--text);}
.rev-sub{font-size:10px;color:var(--text-muted);margin-top:1px;}
/* date input styling */
input[type="date"].fi{color-scheme:dark;}
.card-title{font-family:var(--df);font-size:20px;font-weight:400;line-height:1.15;color:var(--text);margin-bottom:8px;}
.card-desc{font-size:13px;color:var(--text-dim);line-height:1.72;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
.card-foot{display:flex;align-items:center;justify-content:space-between;padding-top:15px;margin-top:15px;border-top:1px solid var(--border2);}
.card-owner{font-size:12px;color:var(--text-muted);}
.card-qtr{font-size:11px;color:var(--text-muted);margin-top:2px;}
.fbtn{font-size:11px;padding:4px 11px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--text-muted);cursor:pointer;font-family:var(--bf);transition:all .15s;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;}
.fbtn:hover{border-color:var(--gold);color:var(--gold);}
.fbtn.has{border-color:rgba(201,168,76,.3);color:var(--gold);background:var(--gold-dim);}
.cmp-badge{font-size:9px;padding:2px 7px;border-radius:100px;background:rgba(139,127,192,.1);color:#8b7fc0;border:1px solid rgba(139,127,192,.2);}

/* BUTTONS */
.btn{font-family:var(--bf);font-size:11px;font-weight:500;padding:7px 14px;border-radius:7px;border:1px solid var(--border);background:transparent;color:var(--text-dim);cursor:pointer;letter-spacing:.07em;text-transform:uppercase;transition:all .15s;}
.btn:hover{border-color:var(--gold);color:var(--gold);background:var(--gold-dim);}
.btn-gold{background:var(--gold);color:var(--bg);border-color:var(--gold);font-weight:600;}
.btn-gold:hover{background:var(--gold-light);border-color:var(--gold-light);color:var(--bg);}
.btn-sm{padding:5px 10px;font-size:10px;}
.btn:disabled{opacity:.4;cursor:not-allowed;}

/* NOTES TOGGLE */
.notes-toggle{display:flex;align-items:center;gap:7px;font-family:var(--bf);font-size:11px;font-weight:500;padding:7px 13px;border-radius:7px;border:1px solid var(--border);background:transparent;color:var(--text-dim);cursor:pointer;letter-spacing:.06em;text-transform:uppercase;transition:all .18s;}
.notes-toggle:hover{border-color:rgba(255,255,255,.14);color:var(--text);}
.notes-toggle.open{border-color:var(--gold);color:var(--gold);background:var(--gold-dim);}
.notes-count{font-size:10px;background:var(--gold);color:var(--bg);border-radius:100px;padding:1px 6px;font-weight:700;line-height:1.4;}

/* NOTES PANEL */
.notes-panel{position:fixed;top:0;right:0;width:var(--nw);height:100vh;background:var(--surface);border-left:1px solid var(--border);display:flex;flex-direction:column;z-index:65;transform:translateX(100%);transition:transform .35s cubic-bezier(.4,0,.2,1);}
.notes-panel.open{transform:translateX(0);}
.notes-hdr{padding:14px 14px 10px;border-bottom:1px solid var(--border);flex-shrink:0;}
.notes-hdr-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px;}
.notes-title{font-family:var(--df);font-size:17px;font-weight:400;color:var(--text);}
.notes-close{width:26px;height:26px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--text-dim);cursor:pointer;font-size:15px;display:grid;place-items:center;transition:all .15s;line-height:1;}
.notes-close:hover{border-color:var(--gold);color:var(--gold);}
.user-chip{display:flex;align-items:center;gap:7px;padding:5px 9px;border-radius:100px;border:1px solid var(--border);background:var(--surface2);cursor:pointer;transition:border-color .15s;}
.user-chip:hover{border-color:rgba(255,255,255,.12);}
.user-marker{border-radius:50%;display:grid;place-items:center;font-weight:700;flex-shrink:0;}
.user-name-sm{font-size:11px;color:var(--text-dim);max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.notes-list{flex:1;overflow-y:auto;padding:8px 0;}
.note-item{padding:10px 14px;border-bottom:1px solid var(--border2);transition:background .15s;animation:slideIn .2s ease both;}
.note-item:hover{background:rgba(255,255,255,.012);}
.note-item:last-child{border-bottom:none;}
.note-top{display:flex;align-items:center;gap:7px;margin-bottom:5px;}
.note-marker{border-radius:50%;display:grid;place-items:center;font-weight:700;flex-shrink:0;}
.note-author{font-size:11px;font-weight:600;color:var(--text);}
.note-time{font-size:10px;color:var(--text-muted);margin-left:auto;white-space:nowrap;}
.note-body{font-size:13px;color:var(--text-dim);line-height:1.65;padding-left:28px;}
.note-del{opacity:0;font-size:10px;color:var(--text-muted);cursor:pointer;background:none;border:none;font-family:var(--bf);transition:opacity .15s,color .15s;padding:0;margin-left:4px;}
.note-item:hover .note-del{opacity:1;}
.note-del:hover{color:#e07b6a;}
.notes-empty{padding:32px 14px;text-align:center;color:var(--text-muted);font-size:12px;line-height:1.75;}
.notes-ia{padding:11px 14px;border-top:1px solid var(--border);flex-shrink:0;}
.note-ta{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:9px;padding:8px 11px;color:var(--text);font-family:var(--bf);font-size:13px;line-height:1.6;resize:none;outline:none;transition:border-color .15s;min-height:64px;}
.note-ta:focus{border-color:rgba(201,168,76,.35);}
.note-ta::placeholder{color:var(--text-muted);}
.note-sr{display:flex;align-items:center;justify-content:space-between;margin-top:7px;}
.note-hint{font-size:10px;color:var(--text-muted);}
.note-submit{font-family:var(--bf);font-size:11px;font-weight:600;padding:5px 14px;border-radius:6px;border:none;background:var(--gold);color:var(--bg);cursor:pointer;letter-spacing:.06em;text-transform:uppercase;transition:background .15s;}
.note-submit:hover{background:var(--gold-light);}
.note-submit:disabled{opacity:.4;cursor:not-allowed;}

/* MARKERS */
.marker-bar{display:flex;align-items:center;}
.marker-bubble{width:22px;height:22px;border-radius:50%;border:2px solid var(--bg);display:grid;place-items:center;font-size:8px;font-weight:700;margin-left:-5px;transition:transform .15s;cursor:default;}
.marker-bubble:first-child{margin-left:0;}
.marker-bubble:hover{transform:scale(1.15) translateY(-2px);z-index:2;}

/* MODALS */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.86);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:100;padding:24px;}
.modal{background:var(--surface);border:1px solid rgba(255,255,255,.08);border-radius:16px;width:100%;max-width:500px;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;}
.modal.wide{max-width:580px;}
.modal.xwide{max-width:700px;}
.mhdr{padding:20px 24px 16px;border-bottom:1px solid var(--border);display:flex;align-items:flex-start;justify-content:space-between;flex-shrink:0;}
.mtitle{font-family:var(--df);font-size:22px;font-weight:400;color:var(--text);}
.msub{font-size:12px;color:var(--text-muted);margin-top:3px;}
.mclose{width:28px;height:28px;border-radius:7px;border:1px solid var(--border);background:transparent;color:var(--text-dim);cursor:pointer;font-size:17px;display:grid;place-items:center;transition:all .15s;flex-shrink:0;line-height:1;}
.mclose:hover{border-color:var(--gold);color:var(--gold);}
.mbody{padding:20px 24px;overflow-y:auto;flex:1;}
.mfoot{padding:13px 24px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;flex-shrink:0;}

/* FORMS */
.ff{margin-bottom:13px;}
.fl{display:block;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-dim);font-weight:500;margin-bottom:5px;}
.fi,.fsel,.fta{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--text);font-family:var(--bf);font-size:13px;transition:border-color .15s;outline:none;}
.fi:focus,.fsel:focus,.fta:focus{border-color:rgba(201,168,76,.4);}
.fi::placeholder,.fta::placeholder{color:var(--text-muted);}
.fsel{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238a86a0'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center;background-size:16px;padding-right:34px;cursor:pointer;}
.fsel option{background:#121222;}
.fta{resize:vertical;min-height:74px;line-height:1.65;}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:11px;}

/* TEAM MEMBER MODAL */
.tm-hdr{display:flex;align-items:center;gap:14px;padding-bottom:14px;margin-bottom:14px;border-bottom:1px solid var(--border2);}
.tm-av{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;font-size:17px;font-weight:700;flex-shrink:0;}
.tm-name{font-family:var(--df);font-size:21px;font-weight:400;color:var(--text);}
.tm-role{font-size:12px;color:var(--text-muted);margin-top:2px;}
.tm-sec{margin-bottom:14px;}
.tm-lbl{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--text-muted);margin-bottom:6px;}
.tm-bio{font-size:13px;color:var(--text-dim);line-height:1.75;}
.tm-str{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text-dim);padding:5px 0;border-bottom:1px solid var(--border2);}
.tm-str:last-child{border:none;}
.tm-str::before{content:"✦";color:var(--gold);font-size:8px;flex-shrink:0;}
.tm-kp{font-size:12px;color:var(--text-dim);padding:4px 0 4px 12px;border-left:2px solid var(--border2);margin-bottom:5px;}
.edit-toggle{font-size:10px;padding:4px 10px;border-radius:6px;border:1px solid var(--border);background:transparent;color:var(--text-muted);cursor:pointer;font-family:var(--bf);transition:all .15s;text-transform:uppercase;letter-spacing:.06em;margin-left:auto;}
.edit-toggle:hover{border-color:var(--gold);color:var(--gold);}

/* BRIEF / AI */
.brief-sec{margin-bottom:14px;padding:11px 13px;background:var(--surface2);border-radius:9px;border:1px solid var(--border2);}
.brief-lbl{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--text-muted);margin-bottom:5px;}
.brief-val{font-size:13px;color:var(--text);line-height:1.65;}
.brief-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:2px;}
.brief-chip{font-size:11px;padding:3px 9px;border-radius:100px;background:rgba(201,168,76,.08);color:var(--gold);border:1px solid rgba(201,168,76,.15);}
.ai-loading{display:flex;align-items:center;gap:8px;padding:20px;color:var(--text-dim);font-size:13px;}
.ai-dot{width:7px;height:7px;border-radius:50%;background:var(--gold);animation:pulse 1s ease-in-out infinite;}
.ai-dot:nth-child(2){animation-delay:.15s;}
.ai-dot:nth-child(3){animation-delay:.3s;}

/* WHO MODAL */
.who-inner{padding:26px 28px;}
.who-title{font-family:var(--df);font-size:24px;font-weight:400;color:var(--text);margin-bottom:6px;}
.who-sub{font-size:13px;color:var(--text-dim);margin-bottom:20px;line-height:1.65;}
.who-colors{display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;}
.who-swatch{width:24px;height:24px;border-radius:50%;cursor:default;border:2px solid transparent;flex-shrink:0;}

/* DROP / FILE */
.dzone{border:2px dashed var(--border);border-radius:11px;padding:34px 18px;text-align:center;cursor:pointer;transition:all .15s;margin-bottom:12px;}
.dzone:hover,.dzone.drag{border-color:rgba(201,168,76,.45);background:rgba(201,168,76,.03);}
.dicon{font-size:26px;margin-bottom:9px;}
.dtxt{font-size:14px;color:var(--text-dim);margin-bottom:4px;}
.dsub{font-size:12px;color:var(--text-muted);}
.divdr{display:flex;align-items:center;gap:10px;color:var(--text-muted);font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin:12px 0;}
.divdr::before,.divdr::after{content:'';flex:1;height:1px;background:var(--border);}
.url-in{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--text);font-family:var(--bf);font-size:13px;margin-bottom:9px;transition:border-color .15s;outline:none;}
.url-in:focus{border-color:rgba(201,168,76,.4);}
.url-in::placeholder{color:var(--text-muted);}
.fpbar{display:flex;align-items:center;gap:9px;padding:9px 12px;background:var(--gold-dim);border:1px solid rgba(201,168,76,.2);border-radius:8px;margin-bottom:12px;}
.fpname{font-size:13px;color:var(--gold);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.fpact{font-size:11px;padding:3px 10px;background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.22);color:var(--gold);border-radius:5px;cursor:pointer;font-family:var(--bf);white-space:nowrap;transition:background .15s;}
.fpact:hover{background:rgba(201,168,76,.22);}

/* DETAIL */
.dgrid{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-bottom:16px;padding:11px 13px;background:var(--surface2);border-radius:9px;border:1px solid var(--border2);}
.dfield-lbl{font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:3px;}
.dfield-val{font-size:13px;color:var(--text);}

/* GANTT */
.gv-wrap{display:flex;flex-direction:column;height:calc(100vh - 57px);}
.gv-bar{display:flex;align-items:center;justify-content:space-between;padding:11px 44px 9px;border-bottom:1px solid var(--border);flex-shrink:0;}
.gv-title{font-family:var(--df);font-size:16px;font-weight:400;color:var(--text);}
.gv-title span{font-size:10px;color:var(--text-muted);font-family:var(--bf);letter-spacing:.1em;text-transform:uppercase;margin-left:9px;}
.gv-frame{flex:1;border:none;background:#fff;}
.gv-drop{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:44px;min-height:420px;}
.gv-drop-box{width:100%;max-width:440px;border:2px dashed rgba(255,255,255,.08);border-radius:18px;padding:48px 32px;text-align:center;transition:all .2s;cursor:pointer;}
.gv-drop-box:hover,.gv-drop-box.drag{border-color:rgba(201,168,76,.4);background:rgba(201,168,76,.03);}
.gv-di{font-size:38px;margin-bottom:14px;display:block;opacity:.5;}
.gv-dt{font-family:var(--df);font-size:26px;font-weight:300;color:var(--text);margin-bottom:8px;}
.gv-ds{font-size:13px;color:var(--text-dim);line-height:1.75;margin-bottom:22px;}
.gv-db{font-family:var(--bf);font-size:11px;font-weight:600;padding:8px 18px;border-radius:7px;background:var(--gold);color:var(--bg);letter-spacing:.07em;text-transform:uppercase;cursor:pointer;border:none;transition:background .15s;}
.gv-db:hover{background:var(--gold-light);}
.gv-dh{margin-top:14px;font-size:11px;color:var(--text-muted);letter-spacing:.06em;text-transform:uppercase;}

@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(9px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}
@keyframes revolveShift{0%{background-position:0% 50%}100%{background-position:200% 50%}}
.card:nth-child(1){animation-delay:0ms}.card:nth-child(2){animation-delay:55ms}.card:nth-child(3){animation-delay:110ms}.card:nth-child(4){animation-delay:165ms}.card:nth-child(5){animation-delay:220ms}.card:nth-child(6){animation-delay:275ms}
::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:2px}::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.13)}
`;

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function MarketingHub() {

  // Core state
  const [strategy, setStrategy] = useState(() => {
    try { const v = localStorage.getItem("shared_ns_ns-strategy"); return v ? JSON.parse(v) : DEFAULT_STRATEGY; } catch { return DEFAULT_STRATEGY; }
  });
  const [initiatives, setInitiatives] = useState(() => {
    try { const v = localStorage.getItem("shared_ns_ns-initiatives"); return v ? JSON.parse(v) : DEFAULT_INITIATIVES; } catch { return DEFAULT_INITIATIVES; }
  });
  const [view, setView] = useState("grid");
  const [filterChannel, setFilterChannel] = useState("All");
  const [detail, setDetail] = useState(null);
  const [fileModal, setFileModal] = useState(null);
  const [conceptModal, setConceptModal] = useState(null);   // init id to view HTML concept
  const [conceptUpload, setConceptUpload] = useState(null); // init id to upload HTML concept
  const [showAddInit, setShowAddInit] = useState(false);
  const [showEditStrategy, setShowEditStrategy] = useState(false);
  const [ganttHtml, setGanttHtml] = useState(() => { try { return localStorage.getItem("shared_ns_ns-gantt") || null; } catch { return null; } });
  const [ready, setReady] = useState(true);

  // Notes
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState(() => { try { const v = localStorage.getItem("shared_ns_ns-notes"); return v ? JSON.parse(v) : []; } catch { return []; } });
  const [noteText, setNoteText] = useState("");
  const [currentUser, setCurrentUser] = useState(() => { try { const v = localStorage.getItem("ns_ns-user"); return v ? JSON.parse(v) : null; } catch { return null; } });
  // Roles that can make live edits — Marketing Creative Director + CEO
  const EDITOR_ROLES = ["creative", "ceo", "exec"];
  const canEdit = !currentUser || EDITOR_ROLES.includes(currentUser.role);
  const [showWhoModal, setShowWhoModal] = useState(() => { try { return !localStorage.getItem("ns_ns-user"); } catch { return true; } });
  const [whoName, setWhoName] = useState("");
  const [whoRole, setWhoRole] = useState("content");

  // Left panel
  const [lsbOpen, setLsbOpen] = useState(true);
  const [leftTab, setLeftTab] = useState("company");
  const [activeBrand, setActiveBrand] = useState(null); // null = company view
  const [company, setCompany] = useState(() => { try { const v = localStorage.getItem("shared_ns_ns-company"); return v ? JSON.parse(v) : DEFAULT_COMPANY; } catch { return DEFAULT_COMPANY; } });
  const [brands, setBrands] = useState(() => { try { const v = localStorage.getItem("shared_ns_ns-brands"); return v ? JSON.parse(v) : DEFAULT_BRANDS; } catch { return DEFAULT_BRANDS; } });
  const [teamMembers, setTeamMembers] = useState(() => { try { const v = localStorage.getItem("shared_ns_ns-team"); return v ? JSON.parse(v) : []; } catch { return []; } }); // shared
  const [orgRoles, setOrgRoles] = useState(() => { try { const v = localStorage.getItem("shared_ns_ns-orgroles"); return v ? JSON.parse(v) : ORG_ROLES; } catch { return ORG_ROLES; } });
  const [selectedMember, setSelectedMember] = useState(null);
  const [campaigns, setCampaigns] = useState(() => { try { const v = localStorage.getItem("shared_ns_ns-campaigns"); return v ? JSON.parse(v) : []; } catch { return []; } });
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [hlInitId, setHlInitId] = useState(null);
  const [showAddBrandInit, setShowAddBrandInit] = useState(null);
  const [showBriefUpload, setShowBriefUpload] = useState(null);
  const [teamView, setTeamView] = useState(null); // "orgchart" | "members"
  const [concepts, setConcepts] = useState(() => { try { const v = localStorage.getItem("shared_ns_ns-concepts"); return v ? JSON.parse(v) : []; } catch { return []; } }); // [{id, name, html, createdAt}]
  const [activeConceptId, setActiveConceptId] = useState(null);

  // Load — read localStorage directly (no timing dependency on window.storage injection)
  useEffect(() => {
    (async () => {
      try {
        const get = (key, shared = false) => {
          try {
            const k = (shared ? "shared_" : "") + "ns_" + key;
            const v = localStorage.getItem(k);
            return v ? { value: v } : null;
          } catch { return null; }
        };
        const s  = get("ns-strategy", true);
        const n  = get("ns-notes", true);
        const u  = get("ns-user", false);
        const g  = get("ns-gantt", true);
        const co = get("ns-company", true);
        const br = get("ns-brands", true);
        const tm = get("ns-team", true);
        const ca = get("ns-campaigns", true);
        if (s) setStrategy(JSON.parse(s.value));
        // initiatives loaded via useState lazy initializer - no need to load here
        if (n) setNotes(JSON.parse(n.value));
        if (g) setGanttHtml(g.value);
        if (co) setCompany(JSON.parse(co.value));
        if (br) setBrands(JSON.parse(br.value));
        if (tm) setTeamMembers(JSON.parse(tm.value));
        const or = get("ns-orgroles", true);
        if (or) setOrgRoles(JSON.parse(or.value));
        const op = get("ns-orgpos", true);
        const oc = get("ns-orgconns", true);
        if (op) window.__savedOrgPos = JSON.parse(op.value);
        if (oc) window.__savedOrgConns = JSON.parse(oc.value);
        if (ca) setCampaigns(JSON.parse(ca.value));
        if (u) { setCurrentUser(JSON.parse(u.value)); }
        else setShowWhoModal(true);
        const cn = get("ns-concepts", true);
        if (cn) setConcepts(JSON.parse(cn.value));
      } catch (_) { setShowWhoModal(true); }
      setReady(true);
    })();
  }, []);

  useEffect(() => { if (ready) window.storage.set("ns-strategy", JSON.stringify(strategy), true).catch(() => {}); }, [strategy, ready]);
  // Save initiatives on every change (strip htmlConcept — fetched fresh from _conceptUrl)
  useEffect(() => { 
    if (!ready) return;
    const toSave = initiatives.map(i => ({...i, htmlConcept: null}));
    console.log("💾 Saving", toSave.length, "initiatives");
    window.storage.set("ns-initiatives", JSON.stringify(toSave), true)
      .then(() => console.log("✅ Saved"))
      .catch(e => console.error("❌ Failed:", e));
  }, [initiatives, ready]);

  // Concept HTML cache — stored separately so it never triggers the initiatives save effect
  const conceptHtmlCache = useRef({});
  useEffect(() => {
    if (!ready) return;
    initiatives.forEach(init => {
      if (init._conceptUrl && !conceptHtmlCache.current[init.id]) {
        fetch(init._conceptUrl)
          .then(r => r.ok ? r.text() : Promise.reject(r.status))
          .then(html => { conceptHtmlCache.current[init.id] = html; })
          .catch(() => {});
      }
    });
  }, [ready]);
  useEffect(() => { if (ready) window.storage.set("ns-notes", JSON.stringify(notes), true).catch(() => {}); }, [notes, ready]);
  useEffect(() => { if (ready && ganttHtml) window.storage.set("ns-gantt", ganttHtml, true).catch(() => {}); }, [ganttHtml, ready]);
  useEffect(() => { if (ready) window.storage.set("ns-company", JSON.stringify(company), true).catch(() => {}); }, [company, ready]);
  useEffect(() => { if (ready) window.storage.set("ns-brands", JSON.stringify(brands), true).catch(() => {}); }, [brands, ready]);
  useEffect(() => { if (ready) window.storage.set("ns-team", JSON.stringify(teamMembers), true).catch(() => {}); }, [teamMembers, ready]);
  useEffect(() => { if (ready) window.storage.set("ns-orgroles", JSON.stringify(orgRoles), true).catch(() => {}); }, [orgRoles, ready]);
  useEffect(() => { if (ready) window.storage.set("ns-campaigns", JSON.stringify(campaigns), true).catch(() => {}); }, [campaigns, ready]);
  useEffect(() => {
    if (!ready) return;
    // Save metadata only (no html) to shared storage
    const meta = concepts.map(({ html, ...rest }) => rest);
    window.storage.set("ns-concepts", JSON.stringify(meta), true).catch(() => {});
  }, [concepts, ready]);

  useEffect(() => {
    const handler = () => { setLeftTab("initiatives"); setActiveBrand(null); };
    window.addEventListener("switch-to-board", handler);
    return () => window.removeEventListener("switch-to-board", handler);
  }, []);

  const saveUser = (name, role) => {
    const color = colorForName(name);
    const user = { name, color, role };
    setCurrentUser(user);
    window.storage.set("ns-user", JSON.stringify(user)).catch(() => {});
    // Register in shared team
    setTeamMembers(prev => {
      const exists = prev.find(m => m.name === name);
      if (exists) return prev.map(m => m.name === name ? { ...m, color, role } : m);
      return [...prev, { name, color, role, title: "", bio: "", strengths: [], skills: [], keyPoints: [], joinedAt: new Date().toISOString() }];
    });
    setShowWhoModal(false);
  };

  const addNote = () => {
    if (!noteText.trim() || !currentUser) return;
    setNotes(p => [{ id: `n-${Date.now()}`, author: currentUser.name, color: currentUser.color, text: noteText.trim(), ts: new Date().toISOString() }, ...p]);
    setNoteText("");
  };

  const saveFile = (id, url, name) => { setInitiatives(p => p.map(x => x.id !== id ? x : { ...x, fileUrl: url, fileName: name })); setFileModal(null); };
  const saveConceptHtml = (id, html, name) => { setInitiatives(p => p.map(x => x.id !== id ? x : { ...x, htmlConcept: html, htmlConceptName: name })); setConceptUpload(null); };
  const addInit = (init) => { setInitiatives(p => [...p, init]); setShowAddInit(false); };
  const deleteInit = (id) => setInitiatives(p => p.filter(x => x.id !== id));
  const updateInit = (id, updates) => setInitiatives(p => p.map(x => x.id === id ? { ...x, ...updates } : x));
  const deleteCampaign = (id) => setCampaigns(p => p.filter(x => x.id !== id));
  const saveStrategy = (s) => { setStrategy(s); setShowEditStrategy(false); };
  const saveCampaignAsInit = (init) => { setInitiatives(p => [...p, init]); };

  const updateMemberProfile = (name, updates) => {
    setTeamMembers(p => p.map(m => m.name === name ? { ...m, ...updates } : m));
    if (selectedMember?.name === name) setSelectedMember(m => ({ ...m, ...updates }));
  };

  const filtered = initiatives.filter(i => filterChannel === "All" || i.channel === filterChannel);
  const getAccent = (pillar) => PILLAR_ACCENTS[strategy.pillars.indexOf(pillar) % PILLAR_ACCENTS.length] || PILLAR_ACCENTS[0];
  const headlineWords = strategy.tagline.replace(/\.$/, "").split(" ");
  const mid = Math.ceil(headlineWords.length / 2);
  const activeAuthors = [...new Map(notes.map(n => [n.author, n.color])).entries()].slice(0, 5);

  // When clicking a channel init, highlight it in the board
  const onChannelInitClick = (init) => {
    setHlInitId(init.id);
    setFilterChannel("All");
    setView("grid");
    setTimeout(() => { document.getElementById(`card-${init.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }, 100);
    setTimeout(() => setHlInitId(null), 2000);
  };

  return (
    <>
      <style>{css}</style>
      {showWhoModal && <WhoModal whoName={whoName} setWhoName={setWhoName} whoRole={whoRole} setWhoRole={setWhoRole} onSave={saveUser} orgRoles={orgRoles} />}
      {selectedMember && <TeamMemberModal member={selectedMember} currentUser={currentUser} onClose={() => setSelectedMember(null)} onUpdate={updateMemberProfile} />}
      {showCampaignModal && <CampaignModal currentUser={currentUser} pillars={strategy.pillars} onClose={() => setShowCampaignModal(false)} onSave={(c) => { setCampaigns(p => [c, ...p]); setShowCampaignModal(false); }} onSaveAsInit={saveCampaignAsInit} />}
      {selectedCampaign && <CampaignDetailModal campaign={selectedCampaign} pillars={strategy.pillars} onClose={() => setSelectedCampaign(null)} onSaveAsInit={(init) => { saveCampaignAsInit(init); setCampaigns(p => p.map(c => c.id === selectedCampaign.id ? { ...c, status: "approved" } : c)); setSelectedCampaign(null); }} />}

      <div className="page">
        {/* ── HEADER ── */}
        <header className="hdr">
          <div className="hdr-brand">
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 22, fontWeight: 700, letterSpacing: ".12em", color: "var(--text)", lineHeight: 1, textTransform: "uppercase" }}>
                C<span style={{ color: "#3bb54a" }}>Ú</span>RADOR
              </div>
              <div style={{ fontSize: 11, color: "#b8b4cc", textTransform: "uppercase", letterSpacing: ".18em", marginTop: 3 }}>Marketing OS</div>
            </div>
          </div>
          <div className="hdr-right">
            {activeAuthors.length > 0 && (
              <div className="marker-bar" style={{ marginRight: 4 }}>
                {activeAuthors.map(([name, color]) => (
                  <div key={name} className="marker-bubble" style={{ background: color.bg, color: color.text }} title={name}>{initials(name)}</div>
                ))}
              </div>
            )}
            {!canEdit && (
              <div style={{ fontSize: 10, padding: "4px 10px", borderRadius: 100, background: "rgba(255,255,255,.04)", border: "1px solid var(--border)", color: "var(--text-muted)", letterSpacing: ".08em", textTransform: "uppercase" }}>
                View Only
              </div>
            )}
            <button className={`notes-toggle ${notesOpen ? "open" : ""}`} onClick={() => setNotesOpen(o => !o)}>
              ✏ Notes {notes.length > 0 && <span className="notes-count">{notes.length}</span>}
            </button>
          </div>
        </header>

        {/* ── BODY ── */}
        <div className="body-row">
          {/* LEFT SIDEBAR */}
          <aside className={`lsb ${lsbOpen ? "" : "collapsed"}`}>
            <div className="lsb-top">
              {lsbOpen && <div className="lsb-top-title">Navigation</div>}
              <button className="lsb-cb" onClick={() => setLsbOpen(o => !o)} title={lsbOpen ? "Collapse" : "Expand"}>{lsbOpen ? "◀" : "▶"}</button>
            </div>

            {lsbOpen && (
              <div className="lsb-body">
                {/* CÚRADOR + brands always visible at top */}
                <CompanyPanel
                  company={company}
                  brands={brands}
                  activeBrand={activeBrand}
                  initiatives={initiatives}
                  onBrandSelect={(id) => { setActiveBrand(id); setLeftTab("company"); }}
                  onInitClick={(init, brandId) => { setActiveBrand(brandId); setDetail(init); }}
                  onAddBrandInit={(brandId) => { setShowAddBrandInit(brandId); }}
                />

                {/* Divider */}
                <div style={{ height: 1, background: "var(--border2)", margin: "4px 0" }} />

                {/* Nav tabs — below brands */}
                <nav className="lsb-nav" style={{ borderBottom: "none", borderTop: "none" }}>
                  {[
                    { id: "company",     icon: "✦",  label: "Marketing Vision" },
                    { id: "initiatives", icon: "📌", label: "Initiatives" },
                    { id: "campaigns",   icon: "🚀", label: "Campaigns" },
                    { id: "concepts",    icon: "🎨", label: "Concepts" },
                    { id: "timeline",    icon: "📅", label: "Timeline" },
                  ].map(t => (
                    <button key={t.id} className={`lsb-tab ${leftTab === t.id ? "on" : ""}`} onClick={() => { setLeftTab(t.id); setActiveBrand(null); }}>
                      <span className="lsb-icon">{t.icon}</span>
                      {lsbOpen && <span className="lsb-lbl">{t.label}</span>}
                    </button>
                  ))}

                  {/* Team — with inline dropdown */}
                  <button className={`lsb-tab ${leftTab === "team" ? "on" : ""}`} onClick={() => { setLeftTab("team"); setActiveBrand(null); }}>
                    <span className="lsb-icon">👥</span>
                    {lsbOpen && <span className="lsb-lbl">Team</span>}
                    {lsbOpen && (
                      <span style={{ marginLeft: "auto", fontSize: 10, opacity: .5, transition: "transform .18s", display: "inline-block", transform: leftTab === "team" ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
                    )}
                  </button>
                  {leftTab === "team" && lsbOpen && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 1, paddingLeft: 8, marginTop: 1 }}>
                      {[
                        { id: "orgchart", icon: "🗂", label: "Org Chart" },
                        { id: "members",  icon: "👤", label: "Team Members" },
                      ].map(item => (
                        <button key={item.id}
                          onClick={() => setTeamView(teamView === item.id ? null : item.id)}
                          className={`lsb-tab ${teamView === item.id ? "on" : ""}`}
                          style={{ paddingLeft: 20, fontSize: 11, opacity: teamView === item.id ? 1 : .75 }}
                        >
                          <span className="lsb-icon" style={{ fontSize: 11 }}>{item.icon}</span>
                          <span className="lsb-lbl">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </nav>

                {/* Channels / Campaigns hint */}
                {(leftTab === "channels" || leftTab === "campaigns" || leftTab === "concepts" || leftTab === "initiatives" || leftTab === "timeline") && (
                  <div style={{ padding: "6px 16px 10px", fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>
                    Content shown on the right →
                  </div>
                )}
              </div>
            )}
          </aside>

          {/* MAIN */}
          <main className={`main ${notesOpen ? "nr" : ""}`}>
            <div className="hub">

            {/* ── TEAM VIEW ── */}
            {leftTab === "team" && !activeBrand && teamView && (
              <div style={{ padding: "28px 36px" }}>
                {teamView === "orgchart" && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, borderBottom: "1px solid var(--border2)", paddingBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 5, fontWeight: 600 }}>Marketing Team</div>
                        <div style={{ fontFamily: "var(--df)", fontSize: 28, fontWeight: 300, color: "var(--text)", lineHeight: 1 }}>Org Chart</div>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>
                        Changes save automatically
                      </div>
                    </div>
                    <OrgChartView teamMembers={teamMembers} currentUser={currentUser} orgRoles={orgRoles} onSelect={setSelectedMember} onRolesChange={canEdit ? setOrgRoles : null} canEdit={canEdit} />
                  </>
                )}
                {teamView === "members" && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, borderBottom: "1px solid var(--border2)", paddingBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 5, fontWeight: 600 }}>Marketing Team</div>
                        <div style={{ fontFamily: "var(--df)", fontSize: 28, fontWeight: 300, color: "var(--text)", lineHeight: 1 }}>
                          Team Members <span style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: "var(--bf)", fontWeight: 400 }}>· {teamMembers.length}</span>
                        </div>
                      </div>
                      <button className="btn" onClick={() => setShowWhoModal(true)}>
                        {currentUser ? "✦ Update Profile" : "+ Join Team"}
                      </button>
                    </div>
                    <MembersGridView teamMembers={teamMembers} currentUser={currentUser} orgRoles={orgRoles} onSelect={setSelectedMember} onChangeUser={() => setShowWhoModal(true)} />
                  </>
                )}
              </div>
            )}

            {/* ── TEAM: no selection yet ── */}
            {leftTab === "team" && !activeBrand && !teamView && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
                  <div style={{ fontSize: 32, marginBottom: 14, opacity: .3 }}>👥</div>
                  <div style={{ fontSize: 14, marginBottom: 6, color: "var(--text-dim)" }}>Select a section</div>
                  <div style={{ fontSize: 12 }}>Choose Org Chart or Team Members from the left panel</div>
                </div>
              </div>
            )}

            {leftTab === "channels" && !activeBrand && (
              <div style={{ padding: "32px 44px", minHeight: "100vh" }}>
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8, fontWeight: 600 }}>Strategic Channels</div>
                  <div style={{ fontFamily: "var(--df)", fontSize: 36, fontWeight: 300, color: "var(--text)", marginBottom: 4 }}>Channels</div>
                  <div style={{ fontSize: 13, color: "var(--text-dim)" }}>All initiatives grouped by strategic pillar. Click any to highlight it on the board.</div>
                </div>
                <ChannelsPanel initiatives={initiatives} pillars={strategy.pillars} pillarAccents={PILLAR_ACCENTS} onInitClick={onChannelInitClick} hlInitId={hlInitId} fullWidth />
              </div>
            )}

            {/* ── INITIATIVES EXPLAINER ── */}
            {leftTab === "initiatives" && !activeBrand && (
              <div style={{ padding: "36px 44px" }}>

                {/* Header row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600, marginBottom: 10 }}>Initiative Board</div>
                    <div style={{ fontFamily: "var(--df)", fontSize: 38, fontWeight: 300, lineHeight: .95, color: "var(--text)", marginBottom: 10 }}>
                      The work behind<br /><em style={{ color: "var(--gold)" }}>the strategy.</em>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 520 }}>
                      Each initiative is tied to a channel and can have a full concept attached — drop an HTML file to bring the vision to life.
                    </div>
                  </div>
                  {canEdit && <button className="btn btn-gold" style={{ marginTop: 8, flexShrink: 0 }} onClick={() => setShowAddInit(true)}>+ Add Initiative</button>}
                </div>

                {/* Initiative cards */}
                {initiatives.length === 0 ? (
                  <div style={{ padding: "60px 24px", textAlign: "center", border: "2px dashed var(--border)", borderRadius: 16 }}>
                    <div style={{ fontSize: 36, marginBottom: 14, opacity: .25 }}>📌</div>
                    <div style={{ fontSize: 15, color: "var(--text-dim)", marginBottom: 8 }}>No initiatives yet</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>Add your first initiative and attach an HTML concept to bring the vision to life</div>
                    {canEdit && <button className="btn btn-gold" onClick={() => setShowAddInit(true)}>+ Add Initiative</button>}
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                    {initiatives.map(init => {
                      const color = getChannelColor(init.channel);
                      const channelShort = (init.channel || "").split(" · ")[1] || init.channel;
                      const cachedHtml = conceptHtmlCache.current[init.id] || init.htmlConcept || null;
                      const hasConcept = !!cachedHtml;
                      const hasConceptUrl = !!init._conceptUrl;
                      const isLoadingConcept = hasConceptUrl && !hasConcept;
                      const pct = dateProgress(init.startDate, init.endDate);
                      return (
                        <div key={init.id} style={{
                          background: "var(--surface)", borderRadius: 14,
                          border: `1px solid ${hasConcept ? color + "33" : "var(--border)"}`,
                          borderTop: `2px solid ${color}`,
                          overflow: "hidden", display: "flex", flexDirection: "column",
                          transition: "all .18s",
                        }}
                          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(0,0,0,.35)"; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                        >
                          {/* Concept preview thumbnail */}
                          {hasConcept && (
                            <div style={{ height: 120, overflow: "hidden", position: "relative", background: "#111", cursor: "pointer" }} onClick={() => setConceptModal(init.id)}>
                              <iframe
                                srcDoc={cachedHtml}
                                style={{ width: "200%", height: "200%", border: "none", transform: "scale(0.5)", transformOrigin: "0 0", pointerEvents: "none" }}
                                sandbox="allow-scripts"
                                title={`preview-${init.id}`}
                              />
                              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(13,13,26,.9) 100%)" }} />
                              <div style={{ position: "absolute", bottom: 8, right: 10, fontSize: 10, color: "#fff", background: "rgba(0,0,0,.5)", padding: "2px 8px", borderRadius: 100, backdropFilter: "blur(4px)" }}>
                                🎨 Concept attached
                              </div>
                            </div>
                          )}
                          {isLoadingConcept && (
                            <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.02)", gap: 8 }}>
                              <div className="ai-dot" /><div className="ai-dot" /><div className="ai-dot" />
                              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Loading concept…</span>
                            </div>
                          )}

                          <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                            {/* Channel badge */}
                            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color, opacity: .85 }}>{channelShort}</div>

                            {/* Title */}
                            <div style={{ fontFamily: "var(--df)", fontSize: 20, fontWeight: 400, color: "var(--text)", lineHeight: 1.2 }}>{init.title}</div>

                            {/* Description */}
                            <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1 }}>{init.description}</div>

                            {/* Date progress */}
                            {init.startDate && (
                              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 4 }}>
                                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{fmtDate(init.startDate)}</span>
                                <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,.06)", borderRadius: 1, overflow: "hidden" }}>
                                  <div style={{ height: "100%", width: `${pct ?? 0}%`, background: init.revolving ? "linear-gradient(90deg,#4d9e8e,#8b7fc0)" : color, borderRadius: 1 }} />
                                </div>
                                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{init.revolving ? "↻" : fmtDate(init.endDate)}</span>
                              </div>
                            )}

                            {/* Footer actions */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border2)", paddingTop: 10, marginTop: 4 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{init.owner}</div>
                                {canEdit && (
                                  <div style={{ display: "flex", gap: 4 }}>
                                    <button onClick={() => { setShowAddInit(init.id); }} title="Edit"
                                      style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}>✏</button>
                                    <button onClick={() => { if (confirm(`Delete "${init.title}"?`)) deleteInit(init.id); }} title="Delete"
                                      style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, border: "1px solid rgba(224,123,106,.3)", background: "transparent", color: "#e07b6a", cursor: "pointer" }}>✕</button>
                                  </div>
                                )}
                              </div>
                              </div>
                              <div style={{ display: "flex", gap: 6 }}>
                                {(hasConcept || isLoadingConcept) ? (
                                  <button onClick={() => hasConcept ? setConceptModal(init.id) : null} style={{
                                    fontSize: 11, padding: "4px 12px", borderRadius: 6,
                                    border: `1px solid ${color}44`, background: color + "14",
                                    color: hasConcept ? color : "var(--text-muted)",
                                    cursor: hasConcept ? "pointer" : "default",
                                    fontFamily: "var(--bf)", fontWeight: 600,
                                    letterSpacing: ".04em", transition: "all .13s",
                                    opacity: isLoadingConcept ? .5 : 1,
                                  }}
                                    onMouseEnter={e => { if (hasConcept) e.currentTarget.style.background = color + "28"; }}
                                    onMouseLeave={e => { if (hasConcept) e.currentTarget.style.background = color + "14"; }}
                                  >{isLoadingConcept ? "Loading…" : "View Concept →"}</button>
                                ) : (
                                  <button onClick={() => setConceptUpload(init.id)} style={{
                                    fontSize: 11, padding: "4px 12px", borderRadius: 6,
                                    border: "1px dashed rgba(255,255,255,.12)", background: "transparent",
                                    color: "var(--text-muted)", cursor: "pointer", fontFamily: "var(--bf)",
                                    letterSpacing: ".04em", transition: "all .13s"
                                  }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = color + "55"; e.currentTarget.style.color = color; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.12)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                                  >+ Attach Concept</button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {leftTab === "campaigns" && !activeBrand && (
              <div style={{ padding: "32px 44px", minHeight: "100vh" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8, fontWeight: 600 }}>Campaign Pipeline</div>
                    <div style={{ fontFamily: "var(--df)", fontSize: 36, fontWeight: 300, color: "var(--text)", marginBottom: 4 }}>Campaigns</div>
                    <div style={{ fontSize: 13, color: "var(--text-dim)" }}>AI-generated briefs and campaign ideas. Click any to view the full brief.</div>
                  </div>
                  {canEdit && <button className="btn btn-gold" style={{ marginTop: 8 }} onClick={() => setShowCampaignModal(true)}>+ New Brief</button>}
                </div>
                <CampaignsPanel campaigns={campaigns} onNew={() => setShowCampaignModal(true)} onSelect={setSelectedCampaign} onDelete={canEdit ? deleteCampaign : null} fullWidth />
              </div>
            )}

            {/* ── CONCEPTS ── */}
            {leftTab === "concepts" && !activeBrand && (
              <ConceptsPanel
                concepts={concepts}
                activeConceptId={activeConceptId}
                setActiveConceptId={setActiveConceptId}
                onAdd={(concept) => setConcepts(p => [...p, concept])}
                onRemove={(id) => { setConcepts(p => p.filter(c => c.id !== id)); if (activeConceptId === id) setActiveConceptId(null); }}
                onRename={(id, name) => setConcepts(p => p.map(c => c.id === id ? { ...c, name } : c))}
                brands={brands}
                canEdit={canEdit}
              />
            )}

            {/* ── TIMELINE ── */}
            {leftTab === "timeline" && !activeBrand && (
              <GanttViewer ganttHtml={ganttHtml} onUpdate={canEdit ? setGanttHtml : null} canEdit={canEdit} />
            )}

            {/* ── COMPANY / BRAND DETAIL FULL VIEW ── */}
            {activeBrand && (() => {

              // ── CURADOR BRANDS MASTER VIEW ──
              if (activeBrand === "curador") return (
                <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
                  <div style={{ position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(18px)", background: "rgba(7,7,15,.92)", borderBottom: "1px solid var(--border)", padding: "12px 44px", display: "flex", alignItems: "center", gap: 14 }}>
                    <button onClick={() => setActiveBrand(null)} style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer", fontSize: 11, fontFamily: "var(--bf)", letterSpacing: ".08em", textTransform: "uppercase", padding: "5px 10px", borderRadius: 6, transition: "all .15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.2)"; e.currentTarget.style.color = "var(--text)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}>
                      ← Back
                    </button>
                    <div style={{ width: 1, height: 20, background: "var(--border)" }} />
                    <div style={{ fontFamily: "var(--df)", fontSize: 17, fontWeight: 400, color: "var(--gold)" }}>{company.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>{company.tagline}</div>
                    <div style={{ marginLeft: "auto", display: "flex", gap: 7 }}>
                      {Object.values(brands).map(br => (
                        <button key={br.id} onClick={() => setActiveBrand(br.id)} style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${br.color}44`, background: "transparent", color: br.color, fontSize: 11, fontFamily: "var(--bf)", cursor: "pointer", transition: "all .15s", fontWeight: 500 }}
                          onMouseEnter={e => { e.currentTarget.style.background = br.color + "18"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                          {br.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hero */}
                  <div style={{ position: "relative", padding: "56px 44px 48px", borderBottom: "1px solid var(--border)", overflow: "hidden" }}>
                    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 50%, rgba(201,168,76,.08) 0%, transparent 60%)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, var(--gold), #a07030)" }} />
                    <div style={{ position: "relative" }}>
                      <div style={{ fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600, marginBottom: 12 }}>Marketing Vision</div>
                      <div style={{ fontFamily: "var(--df)", fontSize: "clamp(40px,5vw,68px)", fontWeight: 300, color: "var(--text)", lineHeight: .92, marginBottom: 16 }}>{company.name}</div>
                      <div style={{ fontFamily: "var(--df)", fontSize: 22, fontStyle: "italic", color: "var(--gold)", marginBottom: 22 }}>"{company.tagline}"</div>
                      <div style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.9, maxWidth: 680 }}>{company.ethos}</div>
                    </div>
                  </div>

                  {/* Mission + Values */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ padding: "28px 36px", borderRight: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 12, fontWeight: 500 }}>Mission</div>
                      <div style={{ fontFamily: "var(--df)", fontSize: 21, fontStyle: "italic", color: "var(--text)", lineHeight: 1.55 }}>{company.mission}</div>
                    </div>
                    <div style={{ padding: "28px 36px" }}>
                      <div style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 14, fontWeight: 500 }}>Core Values</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        {company.values.map((v, i) => (
                          <div key={v} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 13px", borderRadius: 8, background: "rgba(201,168,76,.05)", border: "1px solid rgba(201,168,76,.12)" }}>
                            <div style={{ fontFamily: "var(--df)", fontSize: 22, fontWeight: 300, color: "var(--gold)", lineHeight: 1, minWidth: 26 }}>{String(i + 1).padStart(2, "0")}</div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Brand family */}
                  <div style={{ padding: "28px 36px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16, fontWeight: 500 }}>Brand Family</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                      {Object.values(brands).map(b => (
                        <div key={b.id} onClick={() => setActiveBrand(b.id)} style={{ padding: "18px 18px", borderRadius: 12, background: "var(--surface2)", border: `1px solid ${b.color}22`, cursor: "pointer", transition: "all .18s" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = b.color + "55"; e.currentTarget.style.background = b.color + "0e"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = b.color + "22"; e.currentTarget.style.background = "var(--surface2)"; }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 9, background: b.color, flexShrink: 0, boxShadow: `0 0 14px ${b.color}55` }} />
                            <div style={{ fontFamily: "var(--df)", fontSize: 18, color: "var(--text)", fontWeight: 400 }}>{b.name}</div>
                          </div>
                          <div style={{ fontSize: 11, fontStyle: "italic", color: b.color, marginBottom: 8 }}>{b.tagline}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 8 }}>{b.story.slice(0, 100)}…</div>
                          {b.positioning && <div style={{ fontSize: 10, color: "var(--text-muted)", padding: "5px 8px", background: b.color + "0a", borderRadius: 5, border: `1px solid ${b.color}18`, lineHeight: 1.5 }}>{b.positioning.split("—")[0].trim()}</div>}
                          <div style={{ marginTop: 10, fontSize: 10, color: b.color, letterSpacing: ".07em", textTransform: "uppercase" }}>View profile →</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Business model + market context */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                    {company.model && (
                      <div style={{ padding: "24px 36px", borderRight: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10, fontWeight: 500 }}>Business Model</div>
                        <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.8 }}>{company.model}</div>
                      </div>
                    )}
                    {company.context && (
                      <div style={{ padding: "24px 36px" }}>
                        <div style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10, fontWeight: 500 }}>Market Context</div>
                        <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.8 }}>{company.context}</div>
                      </div>
                    )}
                  </div>
                </div>
              );

              // ── INDIVIDUAL BRAND VIEW ──
              const b = brands[activeBrand];
              if (!b) return null;
              return (
                <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
                  <div style={{ position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(18px)", background: "rgba(7,7,15,.92)", borderBottom: "1px solid var(--border)", padding: "12px 44px", display: "flex", alignItems: "center", gap: 14 }}>
                    <button onClick={() => setActiveBrand(null)} style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer", fontSize: 11, fontFamily: "var(--bf)", letterSpacing: ".08em", textTransform: "uppercase", padding: "5px 10px", borderRadius: 6, transition: "all .15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.2)"; e.currentTarget.style.color = "var(--text)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}>
                      ← Back
                    </button>
                    <button onClick={() => setActiveBrand("curador")} style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: "1px solid rgba(201,168,76,.2)", color: "var(--gold)", cursor: "pointer", fontSize: 11, fontFamily: "var(--bf)", letterSpacing: ".08em", textTransform: "uppercase", padding: "5px 10px", borderRadius: 6, transition: "all .15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,.07)"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}>
                      Curador
                    </button>
                    <div style={{ width: 1, height: 20, background: "var(--border)" }} />
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: b.color, flexShrink: 0, boxShadow: `0 0 8px ${b.color}88` }} />
                    <div style={{ fontFamily: "var(--df)", fontSize: 17, fontWeight: 400, color: "var(--text)" }}>{b.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>{b.tagline}</div>
                    <div style={{ marginLeft: "auto", display: "flex", gap: 7 }}>
                      {Object.values(brands).map(br => (
                        <button key={br.id} onClick={() => setActiveBrand(br.id)} style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${br.id === activeBrand ? br.color + "88" : "var(--border)"}`, background: br.id === activeBrand ? br.color + "18" : "transparent", color: br.id === activeBrand ? br.color : "var(--text-muted)", fontSize: 11, fontFamily: "var(--bf)", cursor: "pointer", transition: "all .15s", fontWeight: br.id === activeBrand ? 600 : 400 }}>
                          {br.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hero strip */}
                  <div style={{ position: "relative", padding: "52px 44px 44px", borderBottom: "1px solid var(--border)", overflow: "hidden" }}>
                    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 20% 50%, ${b.color}12 0%, transparent 60%)`, pointerEvents: "none" }} />
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: b.color }} />
                    <div style={{ position: "relative" }}>
                      <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: b.color, fontWeight: 600, marginBottom: 10 }}>Brand Profile</div>
                      <div style={{ fontFamily: "var(--df)", fontSize: "clamp(38px,5vw,64px)", fontWeight: 300, color: "var(--text)", lineHeight: .95, marginBottom: 14 }}>{b.name}</div>
                      <div style={{ fontFamily: "var(--df)", fontSize: 22, fontStyle: "italic", color: b.color, marginBottom: 20 }}>"{b.tagline}"</div>
                      <div style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.9, maxWidth: 680 }}>{b.story}</div>
                    </div>
                  </div>

                  {/* Mission + Audience */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ padding: "28px 36px", borderRight: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10, fontWeight: 500 }}>Mission</div>
                      <div style={{ fontFamily: "var(--df)", fontSize: 20, fontStyle: "italic", color: "var(--text)", lineHeight: 1.55 }}>{b.mission}</div>
                    </div>
                    <div style={{ padding: "28px 36px" }}>
                      <div style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10, fontWeight: 500 }}>Target Audience</div>
                      <div style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.8 }}>{b.audience}</div>
                    </div>
                  </div>

                  {/* Values + Guidelines */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                    <div style={{ padding: "28px 36px", borderRight: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 14, fontWeight: 500 }}>Core Values</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {b.values.map((v, i) => (
                          <div key={v} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 9, background: b.color + "0e", border: `1px solid ${b.color}22` }}>
                            <div style={{ fontFamily: "var(--df)", fontSize: 24, fontWeight: 300, color: b.color, lineHeight: 1, minWidth: 28 }}>{String(i + 1).padStart(2, "0")}</div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ padding: "28px 36px" }}>
                      <div style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 14, fontWeight: 500 }}>Brand Guidelines</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {[{ label: "Tone of Voice", value: b.tone }, { label: "Typography", value: b.typography }].map(row => (
                          <div key={row.label} style={{ padding: "12px 14px", background: "var(--surface2)", borderRadius: 9, border: "1px solid var(--border2)" }}>
                            <div style={{ fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 5 }}>{row.label}</div>
                            <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.65 }}>{row.value}</div>
                          </div>
                        ))}
                        <div style={{ padding: "12px 14px", background: "var(--surface2)", borderRadius: 9, border: "1px solid var(--border2)" }}>
                          <div style={{ fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>Color Palette</div>
                          <div style={{ display: "flex", gap: 12 }}>
                            {[{ hex: b.color, label: "Primary" }, { hex: b.secondary, label: "Secondary" }].map(c => (
                              <div key={c.label} style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "center" }}>
                                <div style={{ width: 52, height: 52, borderRadius: 10, background: c.hex, border: c.label === "Secondary" ? "1px solid rgba(255,255,255,.08)" : "none", boxShadow: c.label === "Primary" ? `0 0 16px ${c.hex}55` : "none" }} />
                                <div style={{ fontSize: 9, fontFamily: "monospace", color: "var(--text-muted)" }}>{c.hex}</div>
                                <div style={{ fontSize: 9, color: "var(--text-muted)" }}>{c.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Products + Portfolio Role */}
                  {(b.products || b.positioning) && (
                    <div style={{ display: "grid", gridTemplateColumns: b.products && b.positioning ? "1fr 1fr" : "1fr", borderTop: "1px solid var(--border)" }}>
                      {b.products && (
                        <div style={{ padding: "24px 36px", borderRight: b.positioning ? "1px solid var(--border)" : "none" }}>
                          <div style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 12, fontWeight: 500 }}>Product SKUs</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                            {b.products.split("·").map(p => p.trim()).filter(Boolean).map(p => (
                              <div key={p} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "var(--text-dim)", padding: "5px 0", borderBottom: "1px solid var(--border2)" }}>
                                <div style={{ width: 5, height: 5, borderRadius: "50%", background: b.color, flexShrink: 0 }} />
                                {p}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {b.positioning && (
                        <div style={{ padding: "24px 36px" }}>
                          <div style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 12, fontWeight: 500 }}>Portfolio Role</div>
                          <div style={{ padding: "14px 16px", background: b.color + "0a", border: `1px solid ${b.color}22`, borderRadius: 10 }}>
                            <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.75 }}>{b.positioning}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Brand-specific initiatives */}
                  {(() => {
                    const brandInits = initiatives.filter(i => i.brandId === b.id);
                    return (
                      <div style={{ padding: "28px 36px", borderTop: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                          <div>
                            <div style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 500, marginBottom: 4 }}>{b.name} Initiatives</div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{brandInits.length} initiative{brandInits.length !== 1 ? "s" : ""} specific to this brand</div>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => setShowAddBrandInit(b.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: `1px solid ${b.color}44`, background: b.color + "12", color: b.color, fontSize: 11, fontFamily: "var(--bf)", fontWeight: 600, cursor: "pointer", transition: "all .15s" }}
                              onMouseEnter={e => e.currentTarget.style.background = b.color + "22"}
                              onMouseLeave={e => e.currentTarget.style.background = b.color + "12"}>
                              + Add Initiative
                            </button>
                          </div>
                        </div>
                        {brandInits.length === 0 ? (
                          <div onClick={() => setShowAddBrandInit(b.id)} style={{ border: `2px dashed ${b.color}22`, borderRadius: 12, padding: "36px 24px", textAlign: "center", cursor: "pointer", transition: "all .15s" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = b.color + "55"; e.currentTarget.style.background = b.color + "05"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = b.color + "22"; e.currentTarget.style.background = "transparent"; }}>
                            <div style={{ fontSize: 24, marginBottom: 8, opacity: .4 }}>＋</div>
                            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>No {b.name} initiatives yet</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Click to add — you can attach a brief inside the form</div>
                          </div>
                        ) : (
                          <>
                            <div className="bi-grid">
                              {brandInits.map(init => {
                                const acc = PILLAR_ACCENTS[strategy.pillars.indexOf(init.channel) % PILLAR_ACCENTS.length] || PILLAR_ACCENTS[0];
                                return (
                                  <div key={init.id} className={`bi-card ${init._briefSource ? "from-brief" : ""}`} style={{ borderLeftColor: acc.solid }} onClick={() => setDetail(init)}>
                                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
                                      <div className="bi-pillar" style={{ color: acc.solid }}>{init.channel}</div>
                                      {init._briefSource && <span className="bi-brief-badge">📎 Brief</span>}
                                    </div>
                                    <div className="bi-title">{init.title}</div>
                                    {init.description && <div className="bi-desc">{init.description}</div>}
                                    <div className="bi-foot">
                                      <div className="bi-owner">{init.owner}</div>
                                      
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })()}

            {/* ── NORMAL BOARD VIEW (only when company tab + no brand active) ── */}
            {leftTab === "company" && !activeBrand && (<>
              {/* MARKETING VISION */}
              <MarketingVisionSection strategy={strategy} initiatives={initiatives} campaigns={campaigns} teamMembers={teamMembers} onEdit={() => setShowEditStrategy(true)} />

              {/* CONTROLS */}
              <div className="ctrl">
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button className={`fchip ${filterChannel === "All" ? "on" : ""}`} onClick={() => setFilterChannel("All")}>All</button>
                  {CHANNELS.map(ch => (
                    <button key={ch} className={`fchip ${filterChannel === ch ? "on" : ""}`}
                      style={{ borderColor: filterChannel === ch ? getChannelColor(ch) : undefined, color: filterChannel === ch ? getChannelColor(ch) : undefined, background: filterChannel === ch ? getChannelColor(ch) + "18" : undefined }}
                      onClick={() => setFilterChannel(ch)}>
                      {ch.split(" · ")[1] || ch}
                    </button>
                  ))}
                </div>
                <div className="vtog">
                  <button className={`vbtn ${view === "grid" ? "on" : ""}`} onClick={() => setView("grid")}>Board</button>
                </div>
              </div>

              {/* BOARD */}
              {view === "grid" && (
                <div className="board">
                  {filtered.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>No initiatives in this pillar yet.</div>}
                  {filtered.map(init => {
                    const acc = getAccent(init.channel);
                    return (
                      <div key={init.id} id={`card-${init.id}`} className={`card ${hlInitId === init.id ? "hl" : ""}`} onClick={() => setDetail(init)}>
                        <div className="card-bar" style={{ background: acc.grad }} />
                        <div className="card-pillar">
                          {init.channel}
                          {init._brief && <span className="cmp-badge">Campaign</span>}
                          {init.revolving && <span className="card-revolving">↻ Revolving</span>}
                        </div>
                        <div className="card-title">{init.title}</div>
                        <div className="card-desc">{init.description}</div>
                        {/* Date progress bar */}
                        {(init.startDate || init.endDate) && (() => {
                          const pct = dateProgress(init.startDate, init.endDate);
                          const hasEnd = init.endDate && !init.revolving;
                          return (
                            <div className="card-date-bar">
                              <span className="card-date-lbl">{fmtDate(init.startDate)}</span>
                              <div className="card-date-track">
                                <div className="card-date-fill" style={{
                                  width: `${pct ?? 0}%`,
                                  background: init.revolving ? "linear-gradient(90deg,#4d9e8e,#8b7fc0)" : acc.solid,
                                  animation: init.revolving ? "revolveShift 3s linear infinite" : "none",
                                }} />
                              </div>
                              <span className="card-date-range">{init.revolving ? "Ongoing" : fmtDate(init.endDate)}</span>
                            </div>
                          );
                        })()}
                        <div className="card-foot">
                          <div>
                            <div className="card-owner">{init.owner}</div>
                            <div className="card-qtr" style={{ color: getChannelColor(init.channel), fontSize: 10 }}>{(init.channel || "").split(" · ")[1] || init.channel}</div>
                            
                          </div>
                          <button className={`fbtn ${init.fileUrl ? "has" : ""}`} onClick={e => { e.stopPropagation(); setFileModal(init.id); }}>
                            {init.fileUrl ? "📎 File" : "+ File"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* GANTT */}
              {view === "timeline" && <GanttViewer ganttHtml={ganttHtml} onUpdate={canEdit ? setGanttHtml : null} canEdit={canEdit} />}
            </>)}
            </div>
          </main>

          {/* NOTES PANEL */}
          <aside className={`notes-panel ${notesOpen ? "open" : ""}`}>
            <div className="notes-hdr">
              <div className="notes-hdr-row">
                <div className="notes-title">Notes</div>
                <button className="notes-close" onClick={() => setNotesOpen(false)}>×</button>
              </div>
              {currentUser && (
                <div className="user-chip" onClick={() => setShowWhoModal(true)} title="Update profile">
                  <div className="user-marker" style={{ background: currentUser.color.bg, color: currentUser.color.text, width: 20, height: 20, fontSize: 8 }}>{initials(currentUser.name)}</div>
                  <span className="user-name-sm">{currentUser.name}</span>
                  <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: "auto" }}>Change</span>
                </div>
              )}
            </div>
            <div className="notes-list">
              {notes.length === 0 && <div className="notes-empty">No notes yet.<br />Be the first to leave one.</div>}
              {notes.map(note => (
                <div key={note.id} className="note-item">
                  <div className="note-top">
                    <div className="note-marker" style={{ background: note.color.bg, color: note.color.text, width: 22, height: 22, fontSize: 9 }}>{initials(note.author)}</div>
                    <div className="note-author">{note.author}</div>
                    <div className="note-time">{relativeTime(note.ts)}</div>
                    {currentUser?.name === note.author && <button className="note-del" onClick={() => setNotes(p => p.filter(n => n.id !== note.id))}>✕</button>}
                  </div>
                  <div className="note-body">{note.text}</div>
                </div>
              ))}
            </div>
            <div className="notes-ia">
              <textarea className="note-ta" placeholder="Add a note for the team…" value={noteText} onChange={e => setNoteText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addNote(); }} />
              <div className="note-sr">
                <div className="note-hint">⌘↵ to post</div>
                <button className="note-submit" disabled={!noteText.trim()} onClick={addNote}>Post</button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* MODALS */}
      {detail && <DetailModal init={initiatives.find(i => i.id === detail.id) || detail} getAccent={getAccent} onClose={() => setDetail(null)} onFileClick={(id) => { setDetail(null); setFileModal(id); }} />}
      {fileModal && <FileUploadModal initiative={initiatives.find(i => i.id === fileModal)} onClose={() => setFileModal(null)} onSave={(url, name) => saveFile(fileModal, url, name)} />}
      {conceptModal && (() => { const init = initiatives.find(i => i.id === conceptModal); if (!init) return null; const html = conceptHtmlCache.current[init.id] || init.htmlConcept; return html ? <ConceptViewerModal init={{...init, htmlConcept: html}} onClose={() => setConceptModal(null)} onUpload={() => { setConceptModal(null); setConceptUpload(init.id); }} /> : null; })()}
      {conceptUpload && <ConceptHtmlUploadModal initName={initiatives.find(i => i.id === conceptUpload)?.title || ""} onClose={() => setConceptUpload(null)} onSave={(html, name) => saveConceptHtml(conceptUpload, html, name)} />}
      {showAddInit && <AddInitiativeModal
        pillars={strategy.pillars} brands={brands} preselectedBrand={null}
        existing={typeof showAddInit === "string" ? initiatives.find(i => i.id === showAddInit) : null}
        onClose={() => setShowAddInit(false)}
        onSave={init => {
          if (typeof showAddInit === "string") {
            updateInit(showAddInit, init);
            setShowAddInit(false);
          } else {
            addInit(init);
          }
        }} />}
      {showAddBrandInit && <AddInitiativeModal pillars={strategy.pillars} brands={brands} preselectedBrand={showAddBrandInit} onClose={() => setShowAddBrandInit(null)} onSave={init => { addInit(init); setShowAddBrandInit(null); }} />}
      {showBriefUpload && <BriefUploadModal brandId={showBriefUpload} brand={brands[showBriefUpload]} pillars={strategy.pillars} onClose={() => setShowBriefUpload(null)} onSave={init => { addInit(init); setShowBriefUpload(null); }} />}
      {showEditStrategy && <EditStrategyModal strategy={strategy} onClose={() => setShowEditStrategy(false)} onSave={saveStrategy} />}
      {showEditStrategy && <EditStrategyModal strategy={strategy} onClose={() => setShowEditStrategy(false)} onSave={saveStrategy} />}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COMPANY PANEL — nav with collapsible brand initiative dropdowns
// ════════════════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════════════
// MARKETING VISION SECTION — replaces hero on the Marketing Vision tab
// ════════════════════════════════════════════════════════════════════════════
function MvSec({ label }) {
  return <div style={{ fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600, marginBottom: 8, marginTop: 2 }}>{label}</div>;
}
function MvDivider() {
  return <div style={{ height: 1, background: "var(--border)", margin: "32px 0" }} />;
}
function MvCard({ children, color = "var(--gold)", style = {} }) {
  return (
    <div style={{ padding: "16px 18px", background: "var(--surface)", border: "1px solid var(--border)", borderTop: `2px solid ${color}`, borderRadius: 11, ...style }}>
      {children}
    </div>
  );
}

function MarketingVisionSection({ strategy, initiatives, campaigns, teamMembers, onEdit }) {
  const [activeSection, setActiveSection] = useState(null);

  const MV_CHANNELS = [
    { name: "Field Marketing",        status: "critical", note: "Low ROI — visits not converting" },
    { name: "Loyalty / QR Program",   status: "critical", note: "Broken — 1–3% scan conversion" },
    { name: "Social Media",           status: "partial",  note: "Partial — inconsistent narrative" },
    { name: "Websites",               status: "partial",  note: "Incomplete — no consumer journey" },
    { name: "Email / SMS",            status: "critical", note: "Not Active" },
    { name: "SEO / Digital",          status: "critical", note: "Not Active" },
    { name: "PR",                     status: "critical", note: "Not Active" },
    { name: "Events",                 status: "partial",  note: "Inconsistent — no data capture" },
    { name: "In-Store Displays",      status: "partial",  note: "Inconsistent — no tiered system" },
    { name: "Merch / Budtender",      status: "partial",  note: "Inconsistent" },
    { name: "Brand Reputation",       status: "strong",   note: "STRONG — core competitive advantage" },
  ];

  const DIGITAL_CHANNELS = [
    { num: "01", title: "Packaging & QR Journey", bullets: ["Redesign all packaging to brand standards", "QR on every product → mobile brand experience", "Product education, loyalty enrollment, review prompts", "Data capture begins at first scan"] },
    { num: "02", title: "In-House Loyalty & Rewards", bullets: ["Tiered structure: entry, mid, top tier", "Points via purchase, QR, referrals, events", "Redemption: discounts, merch, early access", "BudDrops: verified limited-allocation drops (Head Change)"] },
    { num: "03", title: "Email & SMS Marketing", bullets: ["Direct-to-consumer: product drops, events, loyalty", "B2B dispensary channel: new arrivals, sell-through tools", "Segmented by brand, tier, purchase behavior", "Positions Cúrador as partner, not just vendor"] },
    { num: "04", title: "SEO & Web Ecosystem", bullets: ["Complete brand websites — mobile-first architecture", "QR → Web → Loyalty: frictionless 3-step conversion", "Local SEO + product/strain content authority", "Retargeting pixels + analytics from Day 1"] },
    { num: "05", title: "Online Menu Advertising", bullets: ["Paid placements on Weedmaps, Leafly, and dispensary online menus", "Featured product listings tied to new drops, BudDrops launches", "Brand banner ads driving traffic to QR portal and web ecosystem", "Geo-targeted ads reaching active Missouri cannabis consumers", "Performance tracked by click-through, menu views, and attributed sell-through"] },
  ];
  const BRAND_FIELD = [
    { num: "06", title: "Social Media Strategy", bullets: ["Head Change: Instagram-first, connoisseur culture", "Safe Bet: broad reach, accessible lifestyle tone", "3–4 posts/week per brand; daily story cadence", "Content pillars: Product, Culture, Community, Education"] },
    { num: "07", title: "Reimagined Events", bullets: ["Annual calendar set at fiscal year start", "Every event has a defined data capture goal", "Content team at every event: photo, video, social", "Min. 1 major consumer event per quarter per brand"] },
    { num: "08", title: "PR Strategy", bullets: ["MO trade, lifestyle, business & national cannabis press", "Core narratives: manufacturing excellence, expansion", "Product launch PR tied to BudDrops & major SKUs", "Target: 4–5% of annual sales into marketing"] },
    { num: "09", title: "Field Marketing Rework", bullets: ["Every visit has a defined objective & 24-hr report", "Integrated with marketing calendar — not siloed", "Pop-ups tied to data capture goals only", "Target: 20–30% cost reduction vs. prior period"] },
  ];
  const INSTORE = [
    { num: "10", title: "Tiered In-Store Display", bullets: ["Tier 1: Full branded fixtures, panels, merch placement", "Tier 2: Core kit — shelf talkers, tent cards, signage", "Tier 3: Standard — shelf talkers, product info cards", "Each brand has distinct display visual language"] },
    { num: "11", title: "Budtender Appreciation Program", bullets: ["BudDrops: exclusive verified limited allocations", "Quarterly education sessions at partner stores", "Recognition & rewards tied to sell-through data", "Budtender CRM: contacts, preferences, event attendance"] },
    { num: "12", title: "In-Store Consumer Education", bullets: ["Branded \"How to Hash\" educational booklet at point of sale", "Covers concentrate types, consumption methods, dosing, strain profiles", "Positions Head Change as the authority on craft concentrates in Missouri", "Drives first-time concentrate buyers toward our brands with confidence"] },
  ];
  const PHASES = [
    { num: "01", title: "Foundation",  timing: "Days 1–60",    color: "#4d9e8e", bullets: ["Brand standards finalized (all 3 brands)", "QR portal redesign initiated", "Loyalty platform selected & scoped", "Website audits + rebuild begins", "Field program restructured"] },
    { num: "02", title: "Activation",  timing: "Days 61–120",  color: "#c9a84c", bullets: ["Loyalty + QR portal live", "Email/SMS first campaigns out", "Social calendars active (all 3)", "First major consumer event", "Tier 1 display program deployed"] },
    { num: "03", title: "Optimize",    timing: "Days 121–180", color: "#8b7fc0", bullets: ["SEO strategy in full execution", "PR program launched", "Merch program live (Head Change)", "First BudDrops cycle complete", "KPI review — scale what works"] },
    { num: "04", title: "Scale",       timing: "Month 7+",     color: "#a0624a", bullets: ["Team expands from learnings", "Expansion market prep initiated", "Playbooks documented for export", "Consumer LTV tracking active"] },
  ];
  const KPIS = [
    { area: "QR / Loyalty",     metric: "Scan-to-enrollment rate",    target: "1–3% → 20%+ within 90 days" },
    { area: "Email / SMS",       metric: "List size & open rate",       target: "1,000+ subs; 30%+ open rate" },
    { area: "Social",            metric: "Engagement rate",             target: "5%+ engagement" },
    { area: "Events",            metric: "Data captures per event",     target: "100+ contacts per event" },
    { area: "PR",                metric: "Earned media placements",     target: "2+ placements/quarter" },
    { area: "In-Store Display",  metric: "Tier 1 compliance",           target: "100% Tier 1 partners by Q2" },
    { area: "Budtender Program", metric: "Active CRM contacts",         target: "200+ members Year 1" },
    { area: "Field Marketing",   metric: "Cost-per-contact",            target: "20–30% cost reduction" },
    { area: "SEO",               metric: "Organic traffic",             target: "10+ ranked keywords Year 1" },
  ];
  const BUDGET = [
    { pct: "25–30%", cat: "Digital (SEO, Email, Web)",    color: "#c9a84c", note: "Highest compounding ROI. Owned channels that scale without proportional cost increases." },
    { pct: "20–25%", cat: "Events & Activations",          color: "#4d9e8e", note: "Drives data capture, content, and brand community simultaneously." },
    { pct: "15–20%", cat: "In-Store Display & Merch",      color: "#5a9ed4", note: "Point-of-sale impact with multi-cycle ROI on physical assets." },
    { pct: "15%",    cat: "Content Production",            color: "#8b7fc0", note: "Feeds social, web, email, and event channels — maximum leverage." },
    { pct: "4–5%",   cat: "PR",                            color: "#e07b6a", note: "Best practice target for CPG/cannabis at this growth stage." },
    { pct: "10%",    cat: "Field Marketing (Reworked)",    color: "#8a86a0", note: "Reduced from prior allocation — focused on high-yield activities only." },
  ];
  const CURRENT_TEAM = [
    "Marketing & Creative Director — Strategy, creative direction, brand leadership, EDMT",
    "Jr. Creative — Visual production, asset development, brand execution",
    "Field Marketing Coordinator — Field program, budtender relationships, in-store execution",
    "Product & Biz Dev Liaison — GTM coordination, product pipeline alignment",
    "External Creative Agency (Studio Liner) — Campaign production, content, design",
  ];
  const HIRING = [
    { role: "Digital Marketing Specialist",    desc: "SEO, email/SMS platform management, web analytics" },
    { role: "Content Producer / Videographer", desc: "In-house video & photo for events and social" },
    { role: "PR Manager or Retained Agency",   desc: "Executes PR strategy with accountability to coverage targets" },
    { role: "Loyalty & CRM Coordinator",       desc: "Owns loyalty platform, data analysis, retention programs" },
  ];

  const statusColor = { critical: "#e07b6a", partial: "#c9a84c", strong: "#4d9e8e" };
  const Sec = ({ label }) => <div style={{ fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600, marginBottom: 8 }}>{label}</div>;
  const Divider = () => <div style={{ height: 1, background: "var(--border)", margin: "32px 0" }} />;
  const ChannelCard = ({ item }) => (
    <div style={{ padding: "16px 18px", background: "var(--surface)", border: "1px solid var(--border)", borderTop: "2px solid var(--gold)", borderRadius: 11 }}>
      <div style={{ fontFamily: "var(--df)", fontSize: 22, fontWeight: 300, color: "var(--gold)", lineHeight: 1, marginBottom: 6 }}>{item.num}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>{item.title}</div>
      {item.bullets.map(b => (
        <div key={b} style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.55, paddingLeft: 10, position: "relative", marginBottom: 4 }}>
          <span style={{ position: "absolute", left: 0, color: "var(--gold)", opacity: .5 }}>·</span>{b}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ padding: "40px 44px 0", background: "var(--bg)" }}>

      {/* COVER */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10, fontWeight: 600 }}>Marketing & Creative Division · Missouri Market · 2026–2027</div>
          <div style={{ fontFamily: "var(--df)", fontSize: 52, fontWeight: 300, lineHeight: .92, color: "var(--text)", marginBottom: 14 }}>
            CÚRADOR<br /><span style={{ fontSize: 22, letterSpacing: ".18em", color: "var(--gold)" }}>HOUSE OF BRANDS</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.75, maxWidth: 560, marginBottom: 16 }}>
            Brand Repositioning & Go-To-Market Strategy — a scalable blueprint for Missouri and every market that follows.
          </div>
          <div style={{ display: "inline-block", padding: "6px 14px", background: "rgba(201,168,76,.08)", border: "1px solid rgba(201,168,76,.25)", borderRadius: 6, fontSize: 10, color: "var(--gold)", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>
            Confidential — Internal Use Only
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end", flexShrink: 0 }}>
          <button className="btn" onClick={onEdit}>Edit Strategy</button>
          {[{ v: initiatives.length, l: "Initiatives" }, { v: campaigns.length, l: "Campaigns" }, { v: teamMembers.length, l: "Team" }].map(x => (
            <div key={x.l} style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--df)", fontSize: 26, color: "var(--gold)", fontWeight: 300, lineHeight: 1 }}>{x.v}</div>
              <div style={{ fontSize: 9, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: ".1em" }}>{x.l}</div>
            </div>
          ))}
        </div>
      </div>
      <Divider />

      {/* EXECUTIVE SUMMARY */}
      <div style={{ marginBottom: 32 }}>
        <Sec label="Executive Summary" />
        <div style={{ fontFamily: "var(--df)", fontSize: 32, fontWeight: 300, color: "var(--text)", marginBottom: 12, lineHeight: 1.1 }}>Built on Quality.<br /><em style={{ color: "var(--gold)" }}>Ready to Activate.</em></div>
        <div style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.75, maxWidth: 680, marginBottom: 20 }}>Cúrador has earned its position through exceptional manufacturing and trusted dispensary relationships — achieved with minimal marketing investment. That changes now.</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
          {[{n:"1",title:"Quality is the story",body:"Marketing's job is to tell it louder and more consistently across every channel."},{n:"2",title:"Every touchpoint converts",body:"Packaging, events, digital, in-store — each moment is a chance to earn loyalty."},{n:"3",title:"Missouri is the blueprint",body:"The systems built here travel with us into every new market we enter."}].map(c => (
            <div key={c.n} style={{ padding: "16px 18px", background: "var(--surface)", border: "1px solid var(--border)", borderTop: "2px solid var(--gold)", borderRadius: 11 }}>
              <div style={{ fontFamily: "var(--df)", fontSize: 28, fontWeight: 300, color: "var(--gold)", lineHeight: 1, marginBottom: 8 }}>{c.n}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.65 }}>{c.body}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "var(--gold)", letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 600 }}>Target Marketing Investment: 4–5% of Annual Sales</div>
      </div>
      <Divider />

      {/* CURRENT STATE */}
      <div style={{ marginBottom: 32 }}>
        <Sec label="Current State Snapshot — Where We Are Today" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 6 }}>
          {MV_CHANNELS.map(ch => (
            <div key={ch.name} style={{ display: "flex", alignItems: "center", background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ width: 3, alignSelf: "stretch", background: statusColor[ch.status], flexShrink: 0 }} />
              <div style={{ padding: "9px 13px", flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }}>{ch.name}</div>
                <div style={{ fontSize: 10, color: statusColor[ch.status], fontWeight: 500, textAlign: "right" }}>{ch.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Divider />

      {/* VISION */}
      <div style={{ marginBottom: 32 }}>
        <Sec label="Vision & Strategic Direction" />
        <div style={{ fontFamily: "var(--df)", fontSize: 32, fontWeight: 300, color: "var(--text)", marginBottom: 8, lineHeight: 1.1 }}>Activate Everything.<br /><em style={{ color: "var(--gold)" }}>Own the Consumer.</em></div>
        <div style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.75, marginBottom: 20 }}>The most dynamic suite of cannabis brands in Missouri — and a scalable blueprint for expansion.</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[{name:"Head Change",color:"#A31C1C",desc:"Premium craft concentrate. The connoisseur's brand. Built for the serious consumer who demands quality and provenance above all."},{name:"Safe Bet",color:"#C97820",desc:"Approachable, reliable, accessible. The everyday brand for the broad Missouri market — consistent quality without compromise."},{name:"Bubbles",color:"#7B68B5",desc:"Distinct identity. Specific consumer. Creative positioning refined through brand development — expressive and differentiated."}].map(b => (
            <div key={b.name} style={{ padding: "18px 20px", background: "var(--surface)", border: `1px solid ${b.color}33`, borderTop: `2px solid ${b.color}`, borderRadius: 11 }}>
              <div style={{ fontFamily: "var(--df)", fontSize: 20, fontWeight: 600, color: b.color, marginBottom: 8 }}>{b.name}</div>
              <div style={{ width: 32, height: 1, background: b.color, opacity: .5, marginBottom: 10 }} />
              <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.7 }}>{b.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <Divider />

      {/* ECOSYSTEM */}
      <div style={{ marginBottom: 32 }}>
        <Sec label="Consumer Ecosystem — The Closed-Loop" />
        <div style={{ display: "flex", alignItems: "stretch", gap: 0, marginBottom: 14 }}>
          {[{label:"Packaging",desc:"First touchpoint. QR code on every product."},{label:"QR Portal",desc:"Brand-immersive mobile experience."},{label:"Loyalty",desc:"In-house rewards. Points, perks, access."},{label:"Web",desc:"Digital home. Education + where to buy."},{label:"Repeat Purchase",desc:"Re-engagement. Direct comms. Retention."}].map((step, i) => (
            <div key={step.label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ flex: 1, padding: "13px 14px", background: i % 2 === 0 ? "var(--surface)" : "var(--surface2)", border: "1px solid var(--border2)", borderTop: `2px solid ${i % 2 === 0 ? "var(--gold)" : "#4d9e8e"}`, textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: i % 2 === 0 ? "var(--gold)" : "#4d9e8e", marginBottom: 5 }}>{step.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.5 }}>{step.desc}</div>
              </div>
              {i < 4 && <div style={{ fontSize: 16, color: "var(--gold)", opacity: .4, padding: "0 4px", flexShrink: 0 }}>→</div>}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-dim)", textAlign: "center", fontStyle: "italic", marginBottom: 14 }}>Every channel feeds data back into this loop — enabling smarter targeting, personalized rewards, and sustainable revenue growth.</div>
        <div style={{ display: "flex", gap: 12 }}>
          {[["1–3%","Current QR Conversion Rate"],["→ 20%+","Target Within 90 Days"],["2,000+","Loyalty Members Year 2"]].map(([v,l]) => (
            <div key={l} style={{ flex: 1, padding: "14px 16px", background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 9, textAlign: "center" }}>
              <div style={{ fontFamily: "var(--df)", fontSize: 26, fontWeight: 300, color: "var(--gold)" }}>{v}</div>
              <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 3, textTransform: "uppercase", letterSpacing: ".08em" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <Divider />

      {/* DIGITAL CHANNELS */}
      <div style={{ marginBottom: 32 }}>
        <Sec label="Channel Initiatives — Digital & Direct-to-Consumer" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
          {DIGITAL_CHANNELS.map(ch => <ChannelCard key={ch.num} item={ch} />)}
        </div>
      </div>
      <Divider />

      {/* BRAND & FIELD */}
      <div style={{ marginBottom: 32 }}>
        <Sec label="Channel Initiatives — Social, Events, PR & Field" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
          {BRAND_FIELD.map(ch => <ChannelCard key={ch.num} item={ch} />)}
        </div>
      </div>
      <Divider />

      {/* IN-STORE */}
      <div style={{ marginBottom: 32 }}>
        <Sec label="Channel Initiatives — In-Store, Budtender & Merchandise" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
          {INSTORE.map(ch => <ChannelCard key={ch.num} item={ch} />)}
          <div style={{ padding: "16px 18px", background: "var(--surface)", border: "1px solid var(--border)", borderTop: "2px solid #4d9e8e", borderRadius: 11 }}>
            <div style={{ fontFamily: "var(--df)", fontSize: 22, fontWeight: 300, color: "#4d9e8e", marginBottom: 6 }}>13</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>Brand Merchandise Programs</div>
            {[{brand:"HEAD CHANGE",color:"#A31C1C",desc:"Premium, limited-run drops. Apparel, accessories, collector items aligned to the connoisseur identity."},{brand:"SAFE BET",color:"#C97820",desc:"Accessible, functional merch. Everyday wearables and branded utilities with broad market appeal."},{brand:"BUBBLES",color:"#7B68B5",desc:"Creative-forward, expressive items consistent with finalized brand positioning."}].map(m => (
              <div key={m.brand} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: m.color, letterSpacing: ".1em", marginBottom: 3 }}>{m.brand}</div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.55 }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Divider />

      {/* KPIs */}
      <div style={{ marginBottom: 32 }}>
        <Sec label="Key Performance Indicators — How We Measure Success" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {KPIS.map(k => (
            <div key={k.area} style={{ padding: "13px 15px", background: "var(--surface)", border: "1px solid var(--border2)", borderLeft: "2px solid #4d9e8e", borderRadius: 9 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 3 }}>{k.area}</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 6 }}>{k.metric}</div>
              <div style={{ fontFamily: "var(--df)", fontSize: 15, color: "var(--text)" }}>{k.target}</div>
            </div>
          ))}
        </div>
      </div>
      <Divider />

      {/* TIMELINE */}
      <div style={{ marginBottom: 32 }}>
        <Sec label="Execution Roadmap — Phased Timeline" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {PHASES.map(p => (
            <div key={p.num} style={{ padding: "16px", background: "var(--surface)", border: `1px solid ${p.color}22`, borderTop: `2px solid ${p.color}`, borderRadius: 11 }}>
              <div style={{ fontFamily: "var(--df)", fontSize: 28, fontWeight: 300, color: p.color, lineHeight: 1, marginBottom: 4 }}>{p.num}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{p.title}</div>
              <div style={{ fontSize: 10, color: p.color, fontWeight: 600, marginBottom: 10 }}>{p.timing}</div>
              {p.bullets.map(b => (
                <div key={b} style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.5, paddingLeft: 10, position: "relative", marginBottom: 4 }}>
                  <span style={{ position: "absolute", left: 0, color: p.color, opacity: .5 }}>—</span>{b}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <Divider />

      {/* TEAM */}
      <div style={{ marginBottom: 32 }}>
        <Sec label="Team & Infrastructure — A Scalable Marketing Organization" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".14em", color: "var(--gold)", textTransform: "uppercase", padding: "7px 12px", background: "rgba(201,168,76,.07)", border: "1px solid rgba(201,168,76,.18)", borderRadius: 6, marginBottom: 8 }}>Current Team</div>
            {CURRENT_TEAM.map((m, i) => (
              <div key={i} style={{ padding: "9px 12px", background: "var(--surface)", border: "1px solid var(--border2)", borderLeft: "2px solid #4d9e8e", borderRadius: 7, marginBottom: 6, fontSize: 12, color: "var(--text-dim)", lineHeight: 1.55 }}>{m}</div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".14em", color: "var(--gold)", textTransform: "uppercase", padding: "7px 12px", background: "rgba(201,168,76,.07)", border: "1px solid rgba(201,168,76,.18)", borderRadius: 6, marginBottom: 8 }}>Hiring Roadmap</div>
            {HIRING.map((h, i) => (
              <div key={i} style={{ padding: "10px 12px", background: "var(--surface)", border: "1px solid var(--border2)", borderLeft: "2px solid var(--gold)", borderRadius: 7, marginBottom: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>{h.role}</div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.5 }}>{h.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Divider />

      {/* BUDGET */}
      <div style={{ marginBottom: 32 }}>
        <Sec label="Budget Philosophy — Investing to Compound" />
        <div style={{ padding: "10px 14px", background: "rgba(201,168,76,.07)", border: "1px solid rgba(201,168,76,.2)", borderLeft: "3px solid var(--gold)", borderRadius: 8, marginBottom: 14, fontSize: 12, color: "var(--gold)", fontWeight: 600 }}>Overall Target: 4–5% of Annual Sales Invested into Marketing</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {BUDGET.map(b => (
            <div key={b.cat} style={{ padding: "14px 16px", background: "var(--surface)", border: "1px solid var(--border2)", borderTop: `2px solid ${b.color}`, borderRadius: 9 }}>
              <div style={{ fontFamily: "var(--df)", fontSize: 28, fontWeight: 300, color: b.color, lineHeight: 1.1, marginBottom: 4 }}>{b.pct}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>{b.cat}</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.6 }}>{b.note}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-dim)", fontStyle: "italic" }}>*Target marketing investment of 4–5% of annual sales — consistent with best practices for brand-building stage CPG & cannabis companies.</div>
      </div>
      <Divider />

      {/* CLOSING */}
      <div style={{ marginBottom: 40, padding: "32px 36px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, var(--gold), transparent)" }} />
        <div style={{ fontFamily: "var(--df)", fontSize: 48, fontWeight: 700, color: "var(--text)", letterSpacing: ".04em", marginBottom: 16, lineHeight: .9 }}>CÚRADOR</div>
        <div style={{ width: "60%", height: 1, background: "var(--gold)", opacity: .4, marginBottom: 16 }} />
        <div style={{ fontFamily: "var(--df)", fontSize: 22, fontWeight: 300, color: "var(--gold)", lineHeight: 1.5, marginBottom: 14, maxWidth: 540 }}>Missouri is the proving ground.<br />Everything we build here is built to travel.</div>
        <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.75, maxWidth: 520 }}>The marketing and creative investment we make today is not a cost — it is the engine that compounds our operational advantage into consumer loyalty, brand equity, and sustainable market share.</div>
        <div style={{ marginTop: 20, fontSize: 9, color: "var(--text-dim)", letterSpacing: ".15em", textTransform: "uppercase" }}>Confidential — Internal Use Only · Marketing & Creative Division · 2026–2027</div>
      </div>

      {/* BOARD DIVIDER */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, marginBottom: 0 }}>
        <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600, marginBottom: 4 }}>Initiative Board</div>
        <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Active initiatives by strategic pillar</div>
      </div>
      <div className="pillars">
        {strategy.pillars.map((p, i) => {
          const acc = PILLAR_ACCENTS[i % PILLAR_ACCENTS.length];
          const count = initiatives.filter(x => x.channel === p).length;
          return (
            <div key={p} className="pillar-cell">
              <div className="pillar-num" style={{ backgroundImage: acc.grad }}>{String(i + 1).padStart(2, "0")}</div>
              <div className="pillar-name">{p}</div>
              <div className="pillar-count">{count} initiative{count !== 1 ? "s" : ""}</div>
              <div className="pillar-bar" style={{ width: `${count > 0 ? Math.min(84, 16 + count * 20) : 8}%`, background: acc.grad }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompanyPanel({ company, brands, activeBrand, onBrandSelect, initiatives, onInitClick, onAddBrandInit }) {
  const brandList = Object.values(brands);
  const [brandsOpen, setBrandsOpen] = useState(true); // brands collapsed under CÚRADOR
  const [openBrand, setOpenBrand] = useState(null);

  const toggleBrand = (e, id) => {
    e.stopPropagation();
    setOpenBrand(prev => prev === id ? null : id);
  };

  return (
    <div className="cp-nav">
      {/* ── CÚRADOR master tab ── */}
      <button
        className={`cp-master-tab ${activeBrand === "curador" ? "on" : ""}`}
        onClick={() => onBrandSelect("curador")}
      >
        <div className="cp-master-tab-logo">C</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="cp-master-tab-name">{company.name}</div>
          <div className="cp-master-tab-sub">Marketing Vision</div>
        </div>
        {/* Collapse toggle */}
        <div
          onClick={e => { e.stopPropagation(); setBrandsOpen(o => !o); }}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 6px", color: "var(--text-muted)", fontSize: 10, flexShrink: 0, transition: "transform .2s", transform: brandsOpen ? "rotate(90deg)" : "rotate(0deg)" }}
          title={brandsOpen ? "Collapse brands" : "Expand brands"}
        >▶</div>
      </button>

      {/* ── Brand tabs — collapsible under CÚRADOR ── */}
      {brandsOpen && (
        <div style={{ paddingLeft: 10 }}>
          {brandList.map(b => {
            const brandInits = initiatives.filter(i => i.brandId === b.id);
            const isOpen = openBrand === b.id;
            const isActive = activeBrand === b.id;
            return (
              <div key={b.id}>
                <div
                  className={`cp-brand-tab ${isActive ? "on" : ""}`}
                  style={{ borderColor: isActive ? b.color + "44" : "transparent", cursor: "pointer" }}
                  onClick={() => onBrandSelect(b.id)}
                >
                  <div className="cp-brand-dot" style={{ background: b.color, boxShadow: isActive ? `0 0 8px ${b.color}66` : "none" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="cp-brand-name" style={{ color: isActive ? b.color : "var(--text)" }}>{b.name}</div>
                    <div className="cp-brand-tagline">{b.tagline}</div>
                  </div>
                  {brandInits.length > 0 && (
                    <div style={{ fontSize: 9, padding: "1px 6px", borderRadius: 100, background: b.color + "20", color: b.color, border: `1px solid ${b.color}33`, flexShrink: 0, marginRight: 4 }}>
                      {brandInits.length}
                    </div>
                  )}
                  <button
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "var(--text-muted)", fontSize: 10, flexShrink: 0, transition: "transform .18s", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                    onClick={e => toggleBrand(e, b.id)}
                    title={isOpen ? "Collapse" : "Show initiatives"}
                  >▶</button>
                </div>

                {isOpen && (
                  <div className="cp-brand-inits">
                    {brandInits.length === 0 ? (
                      <div style={{ fontSize: 10, color: "var(--text-muted)", padding: "4px 8px", fontStyle: "italic" }}>No initiatives yet</div>
                    ) : (
                      brandInits.map(init => (
                        <div key={init.id} className="cp-init-row" onClick={() => onInitClick(init, b.id)}>
                          <div className="cp-init-dot" style={{ background: b.color }} />
                          <div className="cp-init-title">{init.title}</div>
                      
                    </div>
                  ))
                )}
                <button className="cp-brand-add" onClick={e => { e.stopPropagation(); onAddBrandInit(b.id); }}>
                  <span style={{ fontSize: 12 }}>＋</span> Add Initiative
                </button>
              </div>
            )}
          </div>
        );
      })}
        </div>
      )}
    </div>
  );
}

function BrandCard({ brand }) {
  if (!brand) return null;
  return (
    <div className="bc">
      <div className="bc-hdr">
        <div className="bc-swatch" style={{ background: brand.color, boxShadow: `0 0 12px ${brand.color}44` }} />
        <div>
          <div className="bc-name">{brand.name}</div>
          <div className="bc-tagline" style={{ color: brand.color }}>{brand.tagline}</div>
        </div>
      </div>
      <div className="bc-sec">
        <div className="bc-lbl">Brand Story</div>
        <div className="bc-txt">{brand.story}</div>
      </div>
      <div className="bc-sec">
        <div className="bc-lbl">Mission</div>
        <div className="bc-txt" style={{ fontStyle: "italic" }}>{brand.mission}</div>
      </div>
      <div className="bc-sec">
        <div className="bc-lbl">Core Values</div>
        <div className="bc-pills">
          {brand.values.map(v => <span key={v} className="bc-pill" style={{ color: brand.color, borderColor: brand.color + "33", background: brand.color + "12" }}>{v}</span>)}
        </div>
      </div>
      <div className="bc-sec">
        <div className="bc-lbl">Target Audience</div>
        <div className="bc-txt">{brand.audience}</div>
      </div>
      <div className="bc-sec" style={{ marginBottom: 0 }}>
        <div className="bc-lbl">Brand Guidelines</div>
        <div style={{ background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 9, overflow: "hidden" }}>
          <div className="bc-gr"><div className="bc-gk">Tone</div><div className="bc-gv">{brand.tone}</div></div>
          <div className="bc-gr"><div className="bc-gk">Type</div><div className="bc-gv">{brand.typography}</div></div>
          <div className="bc-gr">
            <div className="bc-gk">Primary</div>
            <div className="bc-color-row">
              <div className="bc-cswatch" style={{ background: brand.color, boxShadow: `0 0 6px ${brand.color}55` }} />
              <span className="bc-gv" style={{ color: "var(--text-muted)", fontFamily: "monospace", fontSize: 10 }}>{brand.color}</span>
            </div>
          </div>
          <div className="bc-gr" style={{ borderBottom: "none" }}>
            <div className="bc-gk">Secondary</div>
            <div className="bc-color-row">
              <div className="bc-cswatch" style={{ background: brand.secondary, border: "1px solid rgba(255,255,255,.1)" }} />
              <span className="bc-gv" style={{ color: "var(--text-muted)", fontFamily: "monospace", fontSize: 10 }}>{brand.secondary}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TEAM PANEL
// ════════════════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════════════
// ORG CHART — full-width right-side view
// ════════════════════════════════════════════════════════════════════════════
function OrgChartView({ teamMembers, currentUser, orgRoles: initialRoles, onSelect, onRolesChange, canEdit }) {
  const NODE_W = 130, NODE_H = 50, CW = 1000, CH = 700;

  const buildPositions = (rls) => {
    const pos = {};
    const roots = rls.filter(r => !r.parentId);
    const kids = (pid) => rls.filter(r => r.parentId === pid);
    const place = (id, x, y) => {
      pos[id] = { x, y };
      const ch = kids(id);
      if (!ch.length) return NODE_W + 24;
      const tw = ch.length * (NODE_W + 24);
      let cx = x - tw / 2 + (NODE_W + 24) / 2;
      ch.forEach(c => { place(c.id, cx, y + 140); cx += NODE_W + 24; });
    };
    let rx = CW / 2 - roots.length * (NODE_W + 60) / 2;
    roots.forEach(r => { place(r.id, rx, 60); rx += NODE_W + 60; });
    return pos;
  };

  const [roles, setRoles] = useState(initialRoles);
  const ORG_VERSION = "v3"; // bump this to force reset layout
  const DEFAULT_POS = {
    exec:        { x: 180,  y: 30  },
    ceo:         { x: 420,  y: 30  },
    packaging:   { x: 60,   y: 140 },
    creative:    { x: 310,  y: 140 },
    sales:       { x: 540,  y: 140 },
    content:     { x: 30,   y: 260 },
    agencies:    { x: 250,  y: 260 },
    coordinator: { x: 460,  y: 260 },
    puff:        { x: 160,  y: 380 },
    studio:      { x: 320,  y: 380 },
    field:       { x: 480,  y: 380 },
  };
  const [pos, setPos] = useState(() => {
    const saved = window.__savedOrgPos;
    if (saved && saved.__version === ORG_VERSION) return saved;
    return { ...DEFAULT_POS, __version: ORG_VERSION };
  });
  const [conns, setConns] = useState(() => {
    const saved = window.__savedOrgConns;
    if (saved && saved.__version === ORG_VERSION) return saved;
    const m = { __version: ORG_VERSION };
    initialRoles.filter(r => r.parentId).forEach(r => {
      m[r.id] = { from: r.parentId, to: r.id, c1: null, c2: null };
    });
    return m;
  });

  const [dragNode, setDragNode] = useState(null);
  const [dragHandle, setDragHandle] = useState(null); // { connId, which: 'c1'|'c2'|'from'|'to' }
  const [drawConn, setDrawConn] = useState(null); // { fromId, mx, my } while drawing new connection
  const [dropTarget, setDropTarget] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [addingUnder, setAddingUnder] = useState(null);
  const [addVal, setAddVal] = useState('');
  const [editMode, setEditMode] = useState(false);
  const canvasRef = useRef();
  const dragStart = useRef(null);

  const members = (id) => teamMembers.filter(m => m.role === id);

  // Persist pos and conns to SHARED storage so all users see the same chart
  useEffect(() => {
    const toSave = { ...pos, __version: ORG_VERSION };
    window.__savedOrgPos = toSave;
    try { window.storage?.set("ns-orgpos", JSON.stringify(toSave), true); } catch {}
  }, [pos]);
  useEffect(() => {
    const toSave = { ...conns, __version: ORG_VERSION };
    window.__savedOrgConns = toSave;
    try { window.storage?.set("ns-orgconns", JSON.stringify(toSave), true); } catch {}
  }, [conns]);

  const saveRoles = (newRoles) => {
    setRoles(newRoles);
    onRolesChange?.(newRoles);
  };

  const getCanvasXY = (e) => {
    const r = canvasRef.current?.getBoundingClientRect();
    const scroll = canvasRef.current;
    if (!r) return { x: 0, y: 0 };
    return { x: e.clientX - r.left + scroll.scrollLeft, y: e.clientY - r.top + scroll.scrollTop };
  };

  const nodeAt = (x, y, excludeId) => roles.find(r => {
    if (r.id === excludeId) return false;
    const p = pos[r.id];
    return p && x >= p.x && x <= p.x + NODE_W && y >= p.y && y <= p.y + NODE_H;
  });

  // Default connection points: center of bottom/top
  const connEndpoints = (connId) => {
    const conn = conns[connId];
    if (!conn) return null;
    const fp = pos[conn.from], tp = pos[conn.to];
    if (!fp || !tp) return null;
    const fromPt = { x: fp.x + NODE_W / 2, y: fp.y + NODE_H };
    const toPt = { x: tp.x + NODE_W / 2, y: tp.y };
    const c1 = conn.c1 || { x: fromPt.x, y: fromPt.y + 40 };
    const c2 = conn.c2 || { x: toPt.x, y: toPt.y - 40 };
    return { fromPt, toPt, c1, c2 };
  };

  // Global mouse move
  const onMove = useCallback((e) => {
    const { x, y } = getCanvasXY(e);

    if (dragNode) {
      const dx = e.clientX - dragNode.ox, dy = e.clientY - dragNode.oy;
      setPos(p => ({ ...p, [dragNode.id]: { x: Math.max(0, Math.min(CW - NODE_W, p[dragNode.id].x + dx)), y: Math.max(0, Math.min(CH - NODE_H, p[dragNode.id].y + dy)) } }));
      setDragNode(d => ({ ...d, ox: e.clientX, oy: e.clientY }));
      const hit = nodeAt(x, y, dragNode.id);
      setDropTarget(hit?.id || null);
    }

    if (dragHandle) {
      setConns(prev => {
        const conn = { ...prev[dragHandle.connId] };
        if (dragHandle.which === 'c1') conn.c1 = { x, y };
        else if (dragHandle.which === 'c2') conn.c2 = { x, y };
        else if (dragHandle.which === 'from') conn.fromPtOverride = { x, y };
        else if (dragHandle.which === 'to') conn.toPtOverride = { x, y };
        return { ...prev, [dragHandle.connId]: conn };
      });
    }

    if (drawConn) {
      setDrawConn(d => ({ ...d, mx: x, my: y }));
      const hit = nodeAt(x, y, drawConn.fromId);
      setDropTarget(hit?.id || null);
    }
  }, [dragNode, dragHandle, drawConn, roles, pos]);

  const onUp = useCallback((e) => {
    const { x, y } = getCanvasXY(e);
    const moved = dragStart.current && (Math.abs(e.clientX - dragStart.current.x) > 5 || Math.abs(e.clientY - dragStart.current.y) > 5);

    // Node drop — reparent
    if (dragNode && moved && dropTarget && editMode) {
      const isDesc = (cid, aid) => {
        let cur = roles.find(r => r.id === cid);
        while (cur?.parentId) { if (cur.parentId === aid) return true; cur = roles.find(r => r.id === cur.parentId); }
        return false;
      };
      if (!isDesc(dropTarget, dragNode.id)) {
        saveRoles(roles.map(r => r.id === dragNode.id ? { ...r, parentId: dropTarget } : r));
        setConns(prev => ({ ...prev, [dragNode.id]: { from: dropTarget, to: dragNode.id, c1: null, c2: null } }));
      }
    }

    // Finish drawing new connector
    if (drawConn && dropTarget && dropTarget !== drawConn.fromId) {
      const newId = `conn-${Date.now()}`;
      setConns(prev => ({ ...prev, [newId]: { from: drawConn.fromId, to: dropTarget, c1: null, c2: null } }));
    }

    setDragNode(null);
    setDragHandle(null);
    setDrawConn(null);
    setDropTarget(null);
    dragStart.current = null;
  }, [dragNode, dragHandle, drawConn, dropTarget, roles, editMode]);

  useEffect(() => {
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [onMove, onUp]);

  const renameRole = (id, title) => { saveRoles(roles.map(r => r.id === id ? { ...r, title } : r)); setEditing(null); };

  const removeRole = (id) => {
    const toRm = new Set([id]);
    let changed = true;
    while (changed) { changed = false; roles.forEach(r => { if (r.parentId && toRm.has(r.parentId) && !toRm.has(r.id)) { toRm.add(r.id); changed = true; } }); }
    saveRoles(roles.filter(r => !toRm.has(r.id)));
    setConns(prev => { const n = { ...prev }; toRm.forEach(id => delete n[id]); return n; });
    setPos(prev => { const n = { ...prev }; toRm.forEach(id => delete n[id]); return n; });
  };

  const removeConn = (id) => setConns(prev => { const n = { ...prev }; delete n[id]; return n; });

  const addRole = (parentId, title) => {
    if (!title.trim()) { setAddingUnder(null); return; }
    const id = `role-${Date.now()}`;
    saveRoles([...roles, { id, title: title.trim(), parentId }]);
    const pp = parentId && pos[parentId];
    setPos(p => ({ ...p, [id]: pp ? { x: pp.x + 160, y: pp.y + 140 } : { x: 400, y: 400 } }));
    if (parentId) setConns(prev => ({ ...prev, [id]: { from: parentId, to: id, c1: null, c2: null } }));
    setAddingUnder(null);
    setAddVal('');
  };

  // Build SVG path for a connector
  const connPath = (connId) => {
    const conn = conns[connId];
    if (!conn) return null;
    const fp = pos[conn.from], tp = pos[conn.to];
    if (!fp || !tp) return null;
    const fromPt = conn.fromPtOverride || { x: fp.x + NODE_W / 2, y: fp.y + NODE_H };
    const toPt   = conn.toPtOverride   || { x: tp.x + NODE_W / 2, y: tp.y };
    const c1 = conn.c1 || { x: fromPt.x, y: fromPt.y + Math.abs(toPt.y - fromPt.y) * 0.4 + 30 };
    const c2 = conn.c2 || { x: toPt.x,   y: toPt.y - Math.abs(toPt.y - fromPt.y) * 0.4 - 30 };
    return { path: `M${fromPt.x},${fromPt.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${toPt.x},${toPt.y}`, fromPt, toPt, c1, c2 };
  };

  const H = ({ x, y, connId, which, color }) => (
    <g>
      <line x1={which === 'c1' ? (conns[connId]?.fromPtOverride?.x || pos[conns[connId]?.from]?.x + NODE_W/2) : (conns[connId]?.toPtOverride?.x || pos[conns[connId]?.to]?.x + NODE_W/2)}
            y1={which === 'c1' ? (conns[connId]?.fromPtOverride?.y || pos[conns[connId]?.from]?.y + NODE_H) : (conns[connId]?.toPtOverride?.y || pos[conns[connId]?.to]?.y)}
            x2={x} y2={y} stroke={color} strokeWidth="1" strokeDasharray="3 2" strokeOpacity=".4" />
      <circle cx={x} cy={y} r="6" fill={color} stroke="var(--surface)" strokeWidth="2"
        style={{ cursor: "crosshair" }}
        onMouseDown={e => { e.stopPropagation(); setDragHandle({ connId, which }); }} />
    </g>
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        {canEdit && <button onClick={() => { setEditMode(e => !e); setEditing(null); setAddingUnder(null); setDrawConn(null); }}
          style={{ padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "var(--bf)", fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", background: editMode ? "rgba(77,158,142,.12)" : "var(--surface)", border: `1px solid ${editMode ? "rgba(77,158,142,.35)" : "var(--border)"}`, color: editMode ? "#4d9e8e" : "var(--text-muted)" }}>
          {editMode ? "✓ Done" : "✏ Edit Chart"}
        </button>}
        <button onClick={() => { setPos(buildPositions(roles)); setConns(c => { const n = {}; roles.filter(r => r.parentId).forEach(r => { n[r.id] = { from: r.parentId, to: r.id, c1: null, c2: null }; }); return n; }); }} style={{ padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "var(--bf)", fontSize: 11, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>⟳ Reset</button>
        {editMode && (
          <>
            {addingUnder === "root" ? (
              <div style={{ display: "flex", gap: 4 }}>
                <input autoFocus value={addVal} onChange={e => setAddVal(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addRole(null, addVal); if (e.key === "Escape") setAddingUnder(null); }} placeholder="New role…" style={{ padding: "5px 9px", borderRadius: 7, border: "1px solid rgba(77,158,142,.4)", background: "var(--surface2)", color: "var(--text)", fontSize: 11, fontFamily: "var(--bf)", outline: "none", width: 140 }} />
                <button onClick={() => addRole(null, addVal)} style={{ padding: "5px 9px", borderRadius: 7, border: "none", background: "#4d9e8e", color: "#fff", fontSize: 11, cursor: "pointer" }}>Add</button>
                <button onClick={() => setAddingUnder(null)} style={{ padding: "5px 9px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", fontSize: 11, cursor: "pointer" }}>✕</button>
              </div>
            ) : (
              <button onClick={() => { setAddingUnder("root"); setAddVal(""); }} style={{ padding: "7px 12px", borderRadius: 8, border: "1px dashed var(--border)", background: "transparent", color: "var(--text-muted)", fontSize: 11, cursor: "pointer", fontFamily: "var(--bf)" }}>+ Add role</button>
            )}
          </>
        )}
        <div style={{ fontSize: 10, color: "var(--text-muted)", fontStyle: "italic" }}>
          {editMode
            ? drawConn
              ? "Click any node to connect · Click + again to cancel"
              : "Drag nodes to move · Click + to draw a connection · Drag ● handles to bend lines · ✕ to remove"
            : "Double-click to rename · Click filled role to view profile"}
        </div>
      </div>

      <div ref={canvasRef} style={{ position: "relative", width: "100%", height: 540, overflow: "auto", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
        <div style={{ position: "relative", width: CW, height: CH, userSelect: "none" }}>

          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
            onMouseDown={e => { if (e.target === e.currentTarget) { /* click canvas */ } }}>

            {/* Connectors */}
            {Object.keys(conns).map(cid => {
              const cp = connPath(cid);
              if (!cp) return null;
              const { path, fromPt, toPt, c1, c2 } = cp;
              return (
                <g key={cid}>
                  {/* Wider invisible hit area */}
                  <path d={path} fill="none" stroke="transparent" strokeWidth="10" style={{ cursor: "pointer" }}
                    onClick={() => editMode && removeConn(cid)} />
                  {/* Visible line */}
                  <path d={path} fill="none" stroke="rgba(201,168,76,.35)" strokeWidth="1.5" />
                  {/* Arrow */}
                  <circle cx={toPt.x} cy={toPt.y} r="3" fill="rgba(201,168,76,.6)" />

                  {/* Edit handles */}
                  {editMode && (
                    <>
                      {/* Endpoint handles — diamond shape */}
                      <rect x={fromPt.x - 5} y={fromPt.y - 5} width="10" height="10"
                        fill="#4d9e8e" stroke="var(--surface)" strokeWidth="1.5"
                        transform={`rotate(45,${fromPt.x},${fromPt.y})`}
                        style={{ cursor: "crosshair" }}
                        onMouseDown={e => { e.stopPropagation(); setDragHandle({ connId: cid, which: 'from' }); }} />
                      <rect x={toPt.x - 5} y={toPt.y - 5} width="10" height="10"
                        fill="#8b7fc0" stroke="var(--surface)" strokeWidth="1.5"
                        transform={`rotate(45,${toPt.x},${toPt.y})`}
                        style={{ cursor: "crosshair" }}
                        onMouseDown={e => { e.stopPropagation(); setDragHandle({ connId: cid, which: 'to' }); }} />
                      {/* Control point handles — circles */}
                      <H x={c1.x} y={c1.y} connId={cid} which="c1" color="#c9a84c" />
                      <H x={c2.x} y={c2.y} connId={cid} which="c2" color="#e07b6a" />
                      {/* Remove button */}
                      <g onClick={() => removeConn(cid)} style={{ cursor: "pointer" }}>
                        <circle cx={(fromPt.x + toPt.x) / 2} cy={(fromPt.y + toPt.y) / 2} r="8" fill="rgba(224,123,106,.15)" stroke="rgba(224,123,106,.4)" strokeWidth="1" />
                        <text x={(fromPt.x + toPt.x) / 2} y={(fromPt.y + toPt.y) / 2 + 4} textAnchor="middle" fontSize="10" fill="#e07b6a">✕</text>
                      </g>
                    </>
                  )}
                </g>
              );
            })}

            {/* Live drawing line */}
            {drawConn && pos[drawConn.fromId] && (() => {
              const fp = pos[drawConn.fromId];
              const fx = fp.x + NODE_W / 2, fy = fp.y + NODE_H;
              const mid = (fy + drawConn.my) / 2;
              return <path d={`M${fx},${fy} C${fx},${mid} ${drawConn.mx},${mid} ${drawConn.mx},${drawConn.my}`} fill="none" stroke="#4d9e8e" strokeWidth="2" strokeDasharray="6 3" />;
            })()}

            {/* Drop target highlight */}
            {dropTarget && pos[dropTarget] && (
              <rect x={pos[dropTarget].x - 3} y={pos[dropTarget].y - 3} width={NODE_W + 6} height={NODE_H + 6} rx="12" fill="none" stroke="#4d9e8e" strokeWidth="2" strokeDasharray="5 3" />
            )}
          </svg>

          {/* Nodes */}
          {roles.map(role => {
            const p = pos[role.id] || { x: 100, y: 100 };
            const mems = members(role.id);
            const isMe = currentUser?.role === role.id;
            const filled = mems.length > 0;
            const isDragging = dragNode?.id === role.id;
            const borderColor = isMe ? "var(--gold)" : filled ? "rgba(201,168,76,.45)" : "var(--border)";

            return (
              <div key={role.id} style={{
                position: "absolute", left: p.x, top: p.y, width: NODE_W, height: NODE_H,
                zIndex: isDragging ? 100 : 2,
                transform: isDragging ? "scale(1.05)" : "scale(1)",
                transition: isDragging ? "none" : "transform .12s",
              }}>
                <div
                  style={{
                    width: "100%", height: "100%", borderRadius: 10, padding: "7px 10px",
                    border: `1.5px solid ${borderColor}`,
                    background: isMe ? "rgba(201,168,76,.07)" : filled ? "rgba(255,255,255,.03)" : "var(--surface2)",
                    boxShadow: isDragging ? "0 10px 36px rgba(0,0,0,.45)" : "0 2px 8px rgba(0,0,0,.2)",
                    display: "flex", flexDirection: "column", justifyContent: "center",
                    cursor: editMode ? (isDragging ? "grabbing" : "grab") : filled ? "pointer" : "default",
                    userSelect: "none",
                  }}
                  onMouseDown={e => { if (editMode && !drawConn) { e.stopPropagation(); dragStart.current = { x: e.clientX, y: e.clientY }; setDragNode({ id: role.id, ox: e.clientX, oy: e.clientY }); } }}
                  onClick={() => {
                    if (drawConn && drawConn.fromId !== role.id) {
                      // Complete connection
                      const newId = `conn-${Date.now()}`;
                      setConns(prev => ({ ...prev, [newId]: { from: drawConn.fromId, to: role.id, c1: null, c2: null, __version: ORG_VERSION } }));
                      setDrawConn(null);
                      setDropTarget(null);
                    } else if (!editMode && filled) {
                      onSelect(mems[0]);
                    }
                  }}
                  onDoubleClick={() => { setEditing(role.id); setEditVal(role.title); }}
                >
                  {editing === role.id ? (
                    <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)}
                      onBlur={() => renameRole(role.id, editVal || role.title)}
                      onKeyDown={e => { if (e.key === "Enter") renameRole(role.id, editVal || role.title); if (e.key === "Escape") setEditing(null); }}
                      onMouseDown={e => e.stopPropagation()}
                      style={{ background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 11, fontFamily: "var(--bf)", width: "100%", textAlign: "center" }} />
                  ) : (
                    <>
                      <div style={{ fontSize: 11, fontWeight: 600, color: isMe ? "var(--gold)" : filled ? "var(--text)" : "var(--text-muted)", textAlign: "center", lineHeight: 1.3 }}>{role.title}</div>
                      {filled && <div style={{ fontSize: 9, color: isMe ? "var(--gold)" : "var(--text-muted)", textAlign: "center", marginTop: 2 }}>{isMe ? "YOU" : mems[0].name}</div>}
                      {filled && (
                        <div style={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
                          {mems.slice(0, 3).map(m => (
                            <div key={m.name} style={{ width: 13, height: 13, borderRadius: "50%", background: m.color.bg, color: m.color.text, border: "1px solid var(--surface)", display: "grid", placeItems: "center", fontSize: 6, fontWeight: 700, marginLeft: -2 }}>{initials(m.name)}</div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Edit mode controls */}
                {editMode && editing !== role.id && (
                  <div style={{ position: "absolute", top: -10, right: -10, display: "flex", gap: 3 }} onMouseDown={e => e.stopPropagation()}>
                    <div
                      title="Draw a connection from this node — click then click another node"
                      style={{ width: 18, height: 18, borderRadius: "50%", border: "1px solid rgba(77,158,142,.5)", background: drawConn?.fromId === role.id ? "#4d9e8e" : "rgba(77,158,142,.15)", color: "#4d9e8e", fontSize: 13, cursor: "crosshair", display: "grid", placeItems: "center", transition: "background .15s" }}
                      onClick={e => {
                        e.stopPropagation();
                        if (drawConn?.fromId === role.id) {
                          setDrawConn(null); // cancel
                        } else {
                          const p2 = pos[role.id];
                          setDrawConn({ fromId: role.id, mx: p2.x + NODE_W / 2, my: p2.y + NODE_H });
                        }
                      }}>+</div>
                    <div title="Remove role"
                      style={{ width: 18, height: 18, borderRadius: "50%", border: "1px solid rgba(224,123,106,.5)", background: "rgba(224,123,106,.15)", color: "#e07b6a", fontSize: 10, cursor: "pointer", display: "grid", placeItems: "center" }}
                      onClick={e => { e.stopPropagation(); removeRole(role.id); }}>✕</div>
                  </div>
                )}

                {/* Drawing mode indicator */}
                {editMode && drawConn?.fromId === role.id && (
                  <div style={{ position: "absolute", bottom: -28, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", fontSize: 9, color: "#4d9e8e", background: "rgba(77,158,142,.1)", border: "1px solid rgba(77,158,142,.3)", padding: "2px 7px", borderRadius: 100, pointerEvents: "none" }}>
                    Click a node to connect →
                  </div>
                )}

                {/* Connection port dot — drag to draw */}
                {editMode && !drawConn && (
                  <div
                    title="Drag to draw a new connection"
                    style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)", width: 14, height: 14, borderRadius: "50%", background: "#4d9e8e", border: "2px solid var(--surface)", cursor: "crosshair", zIndex: 10 }}
                    onMouseDown={e => { e.stopPropagation(); const { x, y } = getCanvasXY(e); setDrawConn({ fromId: role.id, mx: x, my: y }); }}
                  />
                )}

                {/* Add role popover */}
                {addingUnder === role.id && (
                  <div style={{ position: "absolute", top: NODE_H + 10, left: "50%", transform: "translateX(-50%)", zIndex: 300, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 9, padding: "10px", display: "flex", gap: 5, boxShadow: "0 8px 24px rgba(0,0,0,.4)", whiteSpace: "nowrap" }} onMouseDown={e => e.stopPropagation()}>
                    <input autoFocus value={addVal} onChange={e => setAddVal(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") addRole(role.id, addVal); if (e.key === "Escape") setAddingUnder(null); }}
                      placeholder="Role title…"
                      style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(77,158,142,.4)", background: "var(--surface2)", color: "var(--text)", fontSize: 11, fontFamily: "var(--bf)", outline: "none", width: 130 }} />
                    <button onClick={() => addRole(role.id, addVal)} style={{ padding: "4px 8px", borderRadius: 6, border: "none", background: "#4d9e8e", color: "#fff", fontSize: 11, cursor: "pointer" }}>Add</button>
                    <button onClick={() => setAddingUnder(null)} style={{ padding: "4px 7px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", fontSize: 11, cursor: "pointer" }}>✕</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MembersGridView({ teamMembers, currentUser, orgRoles, onSelect, onChangeUser }) {
  if (teamMembers.length === 0) {
    return (
      <div style={{ padding: "60px 24px", textAlign: "center", border: "2px dashed var(--border)", borderRadius: 16 }}>
        <div style={{ fontSize: 36, marginBottom: 14, opacity: .25 }}>👥</div>
        <div style={{ fontSize: 15, color: "var(--text-dim)", marginBottom: 8 }}>No team members yet</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>Log in with a name and role to appear here and in the org chart</div>
        <button className="btn btn-gold" onClick={onChangeUser}>+ Join the Team</button>
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
      {teamMembers.map(m => {
        const roleLabel = orgRoles.find(r => r.id === m.role)?.title || "Team Member";
        const isMe = currentUser?.name === m.name;
        return (
          <div key={m.name} onClick={() => onSelect(m)} style={{
            padding: "18px 18px 16px", borderRadius: 13, cursor: "pointer",
            background: "var(--surface)", transition: "all .15s",
            border: `1px solid ${isMe ? "rgba(201,168,76,.3)" : "var(--border)"}`,
            boxShadow: isMe ? "0 0 0 1px rgba(201,168,76,.1)" : "none",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = isMe ? "rgba(201,168,76,.5)" : "rgba(255,255,255,.12)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = isMe ? "rgba(201,168,76,.3)" : "var(--border)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = isMe ? "0 0 0 1px rgba(201,168,76,.1)" : "none"; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", background: m.color.bg, color: m.color.text, display: "grid", placeItems: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>{initials(m.name)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", lineHeight: 1.2 }}>{m.name}</div>
                <div style={{ fontSize: 11, color: m.title ? "var(--text-dim)" : "var(--text-muted)", marginTop: 2, fontStyle: m.title ? "normal" : "italic" }}>{m.title || roleLabel}</div>
              </div>
              {isMe && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 100, background: "var(--gold-dim)", color: "var(--gold)", border: "1px solid rgba(201,168,76,.2)", flexShrink: 0 }}>You</span>}
            </div>
            {m.bio && <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.65, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{m.bio}</div>}
            {(m.skills?.length > 0) && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 4 }}>
                {m.skills.slice(0, 4).map(s => (
                  <span key={s} style={{ fontSize: 10, padding: "3px 9px", borderRadius: 100, background: `${m.color.bg}18`, border: `1px solid ${m.color.bg}30`, color: "var(--text-dim)", fontWeight: 500 }}>{s}</span>
                ))}
                {m.skills.length > 4 && <span style={{ fontSize: 10, color: "var(--text-muted)", alignSelf: "center" }}>+{m.skills.length - 4} more</span>}
              </div>
            )}
            {!m.bio && !m.skills?.length && !m.strengths?.length && (
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>No profile yet{isMe ? " — click Edit Profile to add yours" : ""}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TeamPanel({ teamMembers, currentUser, orgRoles, onSelect, onChangeUser, fullWidth }) {
  const membersForRole = (roleId) => teamMembers.filter(m => m.role === roleId);

  const OrgNode = ({ roleId, compact }) => {
    const role = orgRoles.find(r => r.id === roleId);
    if (!role) return null;
    const members = membersForRole(roleId);
    const isMe = currentUser?.role === roleId;
    const populated = members.length > 0;
    return (
      <div
        className={`org-node ${populated ? "populated" : ""} ${isMe ? "me" : ""}`}
        onClick={() => populated && onSelect(members[0])}
        title={`${role.title}${members.length ? ` — ${members.map(m => m.name).join(", ")}` : " — vacant"}`}
      >
        <div className="org-box" style={{ fontSize: compact ? "8px" : "9px", padding: compact ? "4px 6px" : "5px 9px" }}>
          {role.title}
          {isMe && <span style={{ display: "block", fontSize: 7, color: "var(--gold)", marginTop: 1, letterSpacing: ".08em" }}>YOU</span>}
        </div>
        {populated && (
          <div className="org-avs">
            {members.slice(0, 3).map(m => (
              <div key={m.name} className="org-av" style={{ background: m.color.bg, color: m.color.text }} title={m.name}>
                {initials(m.name)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Org chart connector helpers
  const Vert = ({ h = 10 }) => <div style={{ width: 1, height: h, background: "var(--border)", margin: "0 auto" }} />;
  const Horiz = ({ pct = "60%" }) => <div style={{ width: pct, height: 1, background: "var(--border)", margin: "0 auto" }} />;

  const OrgChartInner = () => (
    <div className="org-chart">
      <div className="org-level"><OrgNode roleId="ceo" /></div>
      <Vert h={8} /><Horiz pct="58%" />
      <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "0 8px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><Vert h={6} /><OrgNode roleId="creative" /></div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><Vert h={6} /><OrgNode roleId="strategy" /></div>
      </div>
      <Vert h={6} />
      <div style={{ borderBottom: "1px solid var(--border)", width: "80%", margin: "0 auto" }} />
      <div style={{ display: "flex", justifyContent: "space-around", padding: "0 4px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
          <Vert h={6} />
          <div style={{ display: "flex", gap: 3, justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><OrgNode roleId="content" compact /><Vert h={4} /><OrgNode roleId="email" compact /></div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><OrgNode roleId="design" compact /></div>
          </div>
        </div>
        <div style={{ width: 1, background: "var(--border)", alignSelf: "stretch", margin: "0 4px" }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
          <Vert h={6} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center" }}>
            {["paid","seo","partners","field"].map(id => <OrgNode key={id} roleId={id} compact />)}
          </div>
        </div>
      </div>
    </div>
  );

  if (fullWidth) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>
        {/* Org chart */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "22px 20px" }}>
          <div style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16, fontWeight: 500 }}>Org Chart</div>
          <OrgChartInner />
        </div>
        {/* Members */}
        <div>
          <div style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 12, fontWeight: 500 }}>Team Members · {teamMembers.length}</div>
          {teamMembers.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14 }}>
              <div style={{ fontSize: 28, marginBottom: 10, opacity: .3 }}>👥</div>
              No members yet. Log in to appear here.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {teamMembers.map(m => {
                const roleLabel = orgRoles.find(r => r.id === m.role)?.title || "Team Member";
                return (
                  <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 16px", borderRadius: 11, border: "1px solid var(--border2)", cursor: "pointer", background: "var(--surface)", transition: "all .15s" }}
                    onClick={() => onSelect(m)}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.12)"; e.currentTarget.style.background = "var(--surface2)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.background = "var(--surface)"; }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: m.color.bg, color: m.color.text, display: "grid", placeItems: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{initials(m.name)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{roleLabel}</div>
                      {m.bio && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.bio}</div>}
                    </div>
                    {currentUser?.name === m.name && <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 100, background: "var(--gold-dim)", color: "var(--gold)", border: "1px solid rgba(201,168,76,.2)", flexShrink: 0 }}>You</span>}
                  </div>
                );
              })}
            </div>
          )}
          <button className="tp-add-btn" style={{ marginTop: 12, width: "100%" }} onClick={onChangeUser}>
            {currentUser ? "✦ Update Your Profile" : "+ Join the Team"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tp">
      {/* ORG CHART */}
      <div className="tp-org">
        <div className="org-lbl">Org Chart</div>
        <div className="org-chart">
          {/* CEO */}
          <div className="org-level"><OrgNode roleId="ceo" /></div>
          <Vert h={8} />
          <Horiz pct="58%" />
          {/* L1 */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "0 8px", position: "relative" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Vert h={6} />
              <OrgNode roleId="creative" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Vert h={6} />
              <OrgNode roleId="strategy" />
            </div>
          </div>
          <Vert h={6} />
          {/* L2 — Creative branch */}
          <div style={{ borderBottom: "1px solid var(--border)", width: "80%", margin: "0 auto 0" }} />
          <div style={{ display: "flex", justifyContent: "space-around", padding: "0 4px" }}>
            {/* Creative sub */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, flex: 1 }}>
              <Vert h={6} />
              <div style={{ display: "flex", gap: 3, justifyContent: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><OrgNode roleId="content" compact /><Vert h={4} /><OrgNode roleId="email" compact /></div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}><OrgNode roleId="design" compact /></div>
              </div>
            </div>
            {/* Divider */}
            <div style={{ width: 1, background: "var(--border)", alignSelf: "stretch", margin: "0 4px" }} />
            {/* Strategy sub */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <Vert h={6} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center" }}>
                {["paid","seo","partners","field"].map(id => <OrgNode key={id} roleId={id} compact />)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MEMBER LIST */}
      <div className="tp-members">
        {teamMembers.length === 0 ? (
          <div className="empty-team">
            <div style={{ fontSize: 24, marginBottom: 8, opacity: .3 }}>👥</div>
            No team members yet.<br />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Log in to appear in the org chart.</span>
          </div>
        ) : (
          <>
            <div className="team-lbl">Team Members · {teamMembers.length}</div>
            {teamMembers.map(m => {
              const roleLabel = orgRoles.find(r => r.id === m.role)?.title || "Team Member";
              return (
                <div key={m.name} className="member-row" onClick={() => onSelect(m)}>
                  <div className="member-av" style={{ background: m.color.bg, color: m.color.text }}>{initials(m.name)}</div>
                  <div className="member-info">
                    <div className="member-name">{m.name}</div>
                    <div className="member-role">{roleLabel}</div>
                  </div>
                  {currentUser?.name === m.name && <div className="me-badge">You</div>}
                </div>
              );
            })}
          </>
        )}
        <button className="tp-add-btn" onClick={onChangeUser}>
          {currentUser ? "✦ Update Your Profile" : "+ Join the Team"}
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CHANNELS PANEL
// ════════════════════════════════════════════════════════════════════════════
function ChannelsPanel({ initiatives, pillars, pillarAccents, onInitClick, hlInitId, fullWidth }) {
  const total = initiatives.length;

  if (fullWidth) {
    const CHANNEL_SECTIONS = [
      {
        label: "Digital & Direct-to-Consumer",
        items: [
          { num: "01", title: "Packaging & QR Journey",     color: "#c9a84c", bullets: ["Redesign all packaging to brand standards", "QR on every product → mobile brand experience", "Product education, loyalty enrollment, review prompts", "Data capture begins at first scan"] },
          { num: "02", title: "In-House Loyalty & Rewards", color: "#4d9e8e", bullets: ["Tiered structure: entry, mid, top tier", "Points via purchase, QR, referrals, events", "Redemption: discounts, merch, early access", "BudDrops: verified limited-allocation drops (Head Change)"] },
          { num: "03", title: "Email & SMS Marketing",      color: "#8b7fc0", bullets: ["Direct-to-consumer: product drops, events, loyalty", "B2B dispensary channel: new arrivals, sell-through tools", "Segmented by brand, tier, purchase behavior", "Positions Cúrador as partner, not just vendor"] },
          { num: "04", title: "SEO & Web Ecosystem",        color: "#5a9ed4", bullets: ["Complete brand websites — mobile-first architecture", "QR → Web → Loyalty: frictionless 3-step conversion", "Local SEO + product/strain content authority", "Retargeting pixels + analytics from Day 1"] },
          { num: "05", title: "Online Menu Advertising",    color: "#a0624a", bullets: ["Paid placements on Weedmaps, Leafly, dispensary menus", "Featured product listings tied to drops & promotions", "Geo-targeted ads reaching active Missouri consumers", "Performance tracked by click-through & attributed sell-through"] },
        ]
      },
      {
        label: "Social, Events, PR & Field",
        items: [
          { num: "06", title: "Social Media Strategy",      color: "#e07b6a", bullets: ["Head Change: Instagram-first, connoisseur culture", "Safe Bet: broad reach, accessible lifestyle tone", "3–4 posts/week per brand; daily story cadence", "Content pillars: Product, Culture, Community, Education"] },
          { num: "07", title: "Reimagined Events",          color: "#c9a84c", bullets: ["Annual calendar set at fiscal year start", "Every event has a defined data capture goal", "Content team at every event: photo, video, social", "Min. 1 major consumer event per quarter per brand"] },
          { num: "08", title: "PR Strategy",                color: "#4d9e8e", bullets: ["MO trade, lifestyle, business & national cannabis press", "Core narratives: manufacturing excellence, expansion", "Product launch PR tied to BudDrops & major SKUs", "Target: 4–5% of annual sales into marketing"] },
          { num: "09", title: "Field Marketing Rework",     color: "#8b7fc0", bullets: ["Every visit has a defined objective & 24-hr report", "Integrated with marketing calendar — not siloed", "Pop-ups tied to data capture goals only", "Target: 20–30% cost reduction vs. prior period"] },
        ]
      },
      {
        label: "In-Store, Budtender & Merchandise",
        items: [
          { num: "10", title: "Tiered In-Store Display",         color: "#5a9ed4", bullets: ["Tier 1: Full branded fixtures, panels, merch placement", "Tier 2: Core kit — shelf talkers, tent cards, signage", "Tier 3: Standard — shelf talkers, product info cards", "Each brand has distinct display visual language"] },
          { num: "11", title: "Budtender Appreciation Program",  color: "#a0624a", bullets: ["BudDrops: exclusive verified limited allocations", "Quarterly education sessions at partner stores", "Recognition & rewards tied to sell-through data", "Budtender CRM: contacts, preferences, event attendance"] },
          { num: "12", title: "In-Store Consumer Education",     color: "#e07b6a", bullets: ["Branded \"How to Hash\" educational booklet at point of sale", "Covers concentrate types, consumption methods, dosing, strain profiles", "Positions Head Change as the authority on craft concentrates in Missouri", "Drives first-time concentrate buyers toward our brands"] },
          { num: "13", title: "Brand Merchandise Programs",      color: "#c9a84c", bullets: ["Head Change: Premium limited-run drops — apparel, accessories, collector items", "Safe Bet: Accessible, functional merch — everyday wearables and branded utilities", "Bubbles: Creative-forward, expressive items consistent with brand positioning"] },
        ]
      },
    ];

    return (
      <div>
        {CHANNEL_SECTIONS.map((section, si) => (
          <div key={section.label} style={{ marginBottom: si < CHANNEL_SECTIONS.length - 1 ? 32 : 0 }}>
            <div style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600, marginBottom: 14 }}>{section.label}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {section.items.map(ch => (
                <div key={ch.num} style={{ padding: "16px 18px", background: "var(--surface)", border: `1px solid ${ch.color}22`, borderTop: `2px solid ${ch.color}`, borderRadius: 11 }}>
                  <div style={{ fontFamily: "var(--df)", fontSize: 22, fontWeight: 300, color: ch.color, lineHeight: 1, marginBottom: 6 }}>{ch.num}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>{ch.title}</div>
                  {ch.bullets.map(b => (
                    <div key={b} style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.55, paddingLeft: 10, position: "relative", marginBottom: 4 }}>
                      <span style={{ position: "absolute", left: 0, color: ch.color, opacity: .6 }}>·</span>{b}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {si < CHANNEL_SECTIONS.length - 1 && <div style={{ height: 1, background: "var(--border)", margin: "28px 0 0" }} />}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div className="ch-hdr">
        <div className="ch-hdr-lbl">All Channels</div>
        <div className="ch-hdr-ct">{total} initiative{total !== 1 ? "s" : ""}</div>
      </div>
      {pillars.map((pillar, pi) => {
        const acc = pillarAccents[pi % pillarAccents.length];
        const items = initiatives.filter(i => i.channel === pillar);
        if (items.length === 0) return (
          <div key={pillar} className="ch-pillar">
            <div className="ch-p-hdr">
              <div className="ch-p-stripe" style={{ background: acc.solid }} />
              <div className="ch-p-name" style={{ color: acc.solid }}>{pillar}</div>
              <div className="ch-p-ct">0</div>
            </div>
          </div>
        );
        return (
          <div key={pillar} className="ch-pillar">
            <div className="ch-p-hdr">
              <div className="ch-p-stripe" style={{ background: acc.solid }} />
              <div className="ch-p-name" style={{ color: acc.solid }}>{pillar}</div>
              <div className="ch-p-ct">{items.length}</div>
            </div>
            {items.map(init => (
              <div
                key={init.id}
                className={`ch-card ${hlInitId === init.id ? "active" : ""}`}
                style={{ borderLeftColor: hlInitId === init.id ? "var(--gold)" : acc.solid }}
                onClick={() => onInitClick(init)}
              >
                <div className="ch-card-title">{init.title}</div>
                {init.description && <div className="ch-card-desc">{init.description}</div>}
                <div className="ch-card-meta">
                  <span>{init.owner}</span>
                  {init._brief && <span className="ch-card-badge">Brief</span>}
                </div>
              </div>
            ))}
          </div>
        );
      })}
      {total === 0 && (
        <div style={{ padding: "32px 14px", textAlign: "center", color: "var(--text-dim)", fontSize: 12, lineHeight: 1.75 }}>
          No initiatives yet.<br />Add one from the board.
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CAMPAIGNS PANEL
// ════════════════════════════════════════════════════════════════════════════
function CampaignsPanel({ campaigns, onNew, onSelect, onDelete, fullWidth }) {
  const counts = { idea: 0, brief: 0, approved: 0 };
  campaigns.forEach(c => { if (counts[c.status] !== undefined) counts[c.status]++; });

  if (fullWidth) {
    return (
      <div>
        {/* Status summary */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          {[["idea","var(--gold)","Idea"],["brief","#8b7fc0","Brief"],["approved","#4d9e8e","Approved"]].map(([s, c, label]) => (
            <div key={s} style={{ flex: 1, padding: "14px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 11, borderTop: `2px solid ${c}` }}>
              <div style={{ fontFamily: "var(--df)", fontSize: 32, fontWeight: 300, color: c, lineHeight: 1 }}>{counts[s]}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".1em", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
        {/* Campaign grid */}
        {campaigns.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", border: "2px dashed var(--border)", borderRadius: 14 }}>
            <div style={{ fontSize: 28, marginBottom: 12, opacity: .3 }}>🚀</div>
            <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 6 }}>No campaigns yet</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Use the AI assistant or click "+ New Brief" to generate campaign briefs</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {campaigns.map(c => {
              const sc = { idea: "#c9a84c", brief: "#8b7fc0", approved: "#4d9e8e" }[c.status] || "var(--text-muted)";
              return (
                <div key={c.id} style={{ background: "var(--surface)", border: "1px solid var(--border2)", borderLeft: `2px solid ${sc}`, borderRadius: 11, padding: "14px 16px", cursor: "pointer", transition: "all .15s" }}
                  onClick={() => onSelect(c)}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--surface2)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.borderColor = "var(--border2)"; }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", lineHeight: 1.3, flex: 1 }}>{c.title}</div>
                    <span className={`cmp-status ${c.status}`}>{c.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 10 }}>
                    {c.brief?.objective || c.concept}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.brand || "CÚRADOR"}</span>
                    <span style={{ fontSize: 11, color: sc }}>View brief →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
  return (
    <>
      <div className="cmp-hdr">
        <div>
          <div className="cmp-hdr-lbl">Campaigns · {campaigns.length}</div>
          {campaigns.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginTop: 5 }}>
              {[["idea","var(--gold)"],["brief","#8b7fc0"],["approved","#4d9e8e"]].map(([s, c]) => counts[s] > 0 && (
                <span key={s} style={{ fontSize: 9, padding: "1px 6px", borderRadius: 100, background: c + "18", color: c, border: `1px solid ${c}33`, letterSpacing: ".04em", textTransform: "uppercase" }}>
                  {counts[s]} {s}
                </span>
              ))}
            </div>
          )}
        </div>
        <button className="btn btn-sm btn-gold" onClick={onNew}>+ New Brief</button>
      </div>
      {campaigns.length === 0 ? (
        <div className="cmp-empty">
          <span className="cmp-empty-icon">🚀</span>
          No campaigns yet.<br />
          <span style={{ fontSize: 11 }}>Generate an AI brief — it becomes an initiative card automatically.</span>
        </div>
      ) : (
        <div className="cmp-list">
          {campaigns.map(c => {
            const statusColors = { idea: "#c9a84c", brief: "#8b7fc0", approved: "#4d9e8e" };
            const sc = statusColors[c.status] || "var(--text-muted)";
            return (
              <div key={c.id} className="cmp-card" style={{ borderLeftColor: sc }} onClick={() => onSelect(c)}>
                <div className="cmp-card-top">
                  <div className="cmp-card-title">{c.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div className={`cmp-status ${c.status}`}>{c.status}</div>
                    {onDelete && (
                      <button onClick={e => { e.stopPropagation(); if (confirm(`Delete "${c.title}"?`)) onDelete(c.id); }}
                        style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, border: "1px solid rgba(224,123,106,.3)", background: "transparent", color: "#e07b6a", cursor: "pointer", lineHeight: 1 }}>✕</button>
                    )}
                  </div>
                </div>
                <div className="cmp-card-desc">{c.brief?.objective || c.concept}</div>
                <div className="cmp-card-foot">
                  <div className="cmp-card-brand">{c.brand || "Curador Brands"}</div>
                  <div className="cmp-card-arr">→</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TEAM MEMBER MODAL
// ════════════════════════════════════════════════════════════════════════════
function TeamMemberModal({ member, currentUser, onClose, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(member.title || "");
  const [bio, setBio] = useState(member.bio || "");
  const [skillsText, setSkillsText] = useState((member.skills || []).join("\n"));
  const [strengthsText, setStrengthsText] = useState((member.strengths || []).join("\n"));
  const [keyPointsText, setKeyPointsText] = useState((member.keyPoints || []).join("\n"));
  const isMe = currentUser?.name === member.name;
  const roleLabel = ORG_ROLES.find(r => r.id === member.role)?.title || member.role || "Team Member";
  const displayTitle = member.title || roleLabel;

  const saveProfile = () => {
    onUpdate(member.name, {
      title,
      bio,
      skills: skillsText.split("\n").map(s => s.trim()).filter(Boolean),
      strengths: strengthsText.split("\n").map(s => s.trim()).filter(Boolean),
      keyPoints: keyPointsText.split("\n").map(s => s.trim()).filter(Boolean),
    });
    setEditing(false);
  };

  const hasContent = member.bio || member.title || member.skills?.length || member.strengths?.length || member.keyPoints?.length;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal wide" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="mhdr" style={{ borderTop: `3px solid ${member.color.bg}`, borderRadius: "16px 16px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: member.color.bg, color: member.color.text, display: "grid", placeItems: "center", fontSize: 18, fontWeight: 700, flexShrink: 0, boxShadow: `0 0 16px ${member.color.bg}55` }}>{initials(member.name)}</div>
            <div>
              <div style={{ fontFamily: "var(--df)", fontSize: 22, fontWeight: 400, color: "var(--text)" }}>{member.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{displayTitle}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {isMe && (
              <button className="edit-toggle" onClick={() => setEditing(e => !e)}>
                {editing ? "Cancel" : "Edit Profile"}
              </button>
            )}
            <button className="mclose" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="mbody">
          {editing ? (
            /* ── EDIT MODE ── */
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="ff" style={{ gridColumn: "1/-1" }}>
                <label className="fl">Job Title</label>
                <input className="fi" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Creative Director, Brand Strategist…" />
              </div>
              <div className="ff" style={{ gridColumn: "1/-1" }}>
                <label className="fl">Short Bio</label>
                <textarea className="fta" value={bio} onChange={e => setBio(e.target.value)} placeholder="A brief intro — your background, focus, and what you bring to the team…" style={{ minHeight: 80 }} />
              </div>
              <div className="ff">
                <label className="fl">Skills (one per line)</label>
                <textarea className="fta" value={skillsText} onChange={e => setSkillsText(e.target.value)} placeholder="e.g. Brand Strategy&#10;Social Media&#10;Copywriting&#10;Analytics" style={{ minHeight: 100 }} />
              </div>
              <div className="ff">
                <label className="fl">Strengths (one per line)</label>
                <textarea className="fta" value={strengthsText} onChange={e => setStrengthsText(e.target.value)} placeholder="e.g. Creative direction&#10;Cross-brand consistency&#10;Team leadership" style={{ minHeight: 100 }} />
              </div>
              <div className="ff" style={{ gridColumn: "1/-1" }}>
                <label className="fl">Key Points (one per line)</label>
                <textarea className="fta" value={keyPointsText} onChange={e => setKeyPointsText(e.target.value)} placeholder="e.g. Leads Headchange rebrand&#10;5 years cannabis marketing&#10;Manages 3 dispensary accounts" style={{ minHeight: 80 }} />
              </div>
            </div>
          ) : (
            /* ── VIEW MODE ── */
            <>
              {/* Bio */}
              {member.bio ? (
                <div className="tm-sec">
                  <div className="tm-lbl">About</div>
                  <div className="tm-bio">{member.bio}</div>
                </div>
              ) : isMe ? (
                <div style={{ padding: "10px 0 14px", color: "var(--text-muted)", fontSize: 12 }}>No bio yet — click <strong style={{ color: "var(--gold)" }}>Edit Profile</strong> to add yours.</div>
              ) : null}

              {/* Skills */}
              {(member.skills || []).length > 0 && (
                <div className="tm-sec">
                  <div className="tm-lbl">Skills</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                    {member.skills.map((s, i) => (
                      <span key={i} style={{ fontSize: 11, padding: "4px 11px", borderRadius: 100, background: `${member.color.bg}22`, border: `1px solid ${member.color.bg}44`, color: "var(--text-dim)", fontWeight: 500 }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {(member.strengths || []).length > 0 && (
                <div className="tm-sec">
                  <div className="tm-lbl">Strengths</div>
                  {member.strengths.map((s, i) => <div key={i} className="tm-str">{s}</div>)}
                </div>
              )}

              {/* Key Points */}
              {(member.keyPoints || []).length > 0 && (
                <div className="tm-sec">
                  <div className="tm-lbl">Key Points</div>
                  {member.keyPoints.map((k, i) => <div key={i} className="tm-kp">{k}</div>)}
                </div>
              )}

              {!hasContent && !isMe && (
                <div style={{ color: "var(--text-muted)", fontSize: 12, padding: "16px 0", lineHeight: 1.75 }}>
                  This team member hasn't filled out their profile yet.
                </div>
              )}
            </>
          )}
        </div>

        {editing && (
          <div className="mfoot">
            <button className="btn" onClick={() => setEditing(false)}>Cancel</button>
            <button className="btn btn-gold" onClick={saveProfile}>Save Profile</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CAMPAIGN MODAL — AI Brief Generator
// ════════════════════════════════════════════════════════════════════════════
function CampaignModal({ currentUser, pillars, onClose, onSave, onSaveAsInit }) {
  const [concept, setConcept] = useState("");
  const [brand, setBrand] = useState("Headchange");
  const [objective, setObjective] = useState("");
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState(null);
  const [err, setErr] = useState("");

  const generate = async () => {
    if (!concept.trim()) return;
    setLoading(true); setBrief(null); setErr("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a senior cannabis marketing strategist for Curador Brands (brands: Headchange, Bubbles, Safebet) operating in Missouri. Generate campaign briefs in valid JSON only, no markdown or preamble. Return exactly: {"title":"...","objective":"...","targetAudience":"...","keyMessages":["...","...","..."],"channels":["...","...","..."],"timeline":"...","estimatedBudget":"...","kpis":["...","...","..."],"description":"..."}`,
          messages: [{ role: "user", content: `Campaign concept: ${concept}. Primary brand: ${brand}. Core objective: ${objective || "drive brand awareness and sales"}. Make it specific to Missouri cannabis market.` }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      setBrief(JSON.parse(clean));
    } catch (e) { setErr("Couldn't generate brief. Check your connection and try again."); }
    setLoading(false);
  };

  const saveCampaign = (status = "idea") => {
    const c = { id: `cmp-${Date.now()}`, title: brief?.title || concept, concept, brand, objective, brief, status, createdBy: currentUser?.name || "Team", createdAt: new Date().toISOString() };
    onSave(c);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal xwide" onClick={e => e.stopPropagation()}>
        <div className="mhdr">
          <div><div className="mtitle">New Campaign Idea</div><div className="msub">Describe your concept · AI generates a full brief</div></div>
          <button className="mclose" onClick={onClose}>×</button>
        </div>
        <div className="mbody">
          {!brief ? (
            <>
              <div className="ff"><label className="fl">Campaign Concept *</label><textarea className="fta" style={{ minHeight: 88 }} placeholder="e.g. A terpene education series targeting dispensary budtenders — educational content that positions Headchange as the craft authority..." value={concept} onChange={e => setConcept(e.target.value)} /></div>
              <div className="frow">
                <div className="ff">
                  <label className="fl">Primary Brand</label>
                  <select className="fsel" value={brand} onChange={e => setBrand(e.target.value)}>
                    {["Headchange", "Bubbles", "Safebet", "All Brands"].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="ff"><label className="fl">Core Objective</label><input className="fi" placeholder="e.g. Increase brand awareness" value={objective} onChange={e => setObjective(e.target.value)} /></div>
              </div>
              {loading && <div className="ai-loading"><div className="ai-dot" /><div className="ai-dot" /><div className="ai-dot" /><span>Generating brief…</span></div>}
              {err && <div style={{ padding: "10px 12px", background: "rgba(224,123,106,.08)", border: "1px solid rgba(224,123,106,.2)", borderRadius: 8, fontSize: 12, color: "#e07b6a", marginTop: 8 }}>{err}</div>}
            </>
          ) : (
            <BriefDisplay brief={brief} />
          )}
        </div>
        <div className="mfoot">
          {!brief ? (
            <><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-gold" disabled={!concept.trim() || loading} onClick={generate}>✦ Generate Brief</button></>
          ) : (
            <><button className="btn" onClick={() => setBrief(null)}>← Regenerate</button><button className="btn" onClick={() => saveCampaign("brief")}>Save as Brief</button><button className="btn btn-gold" onClick={() => saveCampaign("approved")}>Save & Approve</button></>
          )}
        </div>
      </div>
    </div>
  );
}

function CampaignDetailModal({ campaign, pillars, onClose, onSaveAsInit }) {
  const [pillar, setPillar] = useState(pillars[0] || "");
  const [quarter, setQuarter] = useState("Q2 2026");

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal xwide" onClick={e => e.stopPropagation()}>
        <div className="mhdr">
          <div>
            <div className="mtitle">{campaign.title}</div>
            <div className="msub">{campaign.brand} · Created by {campaign.createdBy}</div>
          </div>
          <button className="mclose" onClick={onClose}>×</button>
        </div>
        <div className="mbody">
          {campaign.brief ? <BriefDisplay brief={campaign.brief} /> : (
            <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.75 }}>{campaign.concept}</div>
          )}
          {campaign.brief && campaign.status !== "approved" && (
            <div style={{ marginTop: 16, padding: "14px 16px", background: "var(--surface2)", borderRadius: 10, border: "1px solid var(--border2)" }}>
              <div className="fl" style={{ marginBottom: 10 }}>Save as Initiative</div>
              <div className="frow">
                <div className="ff">
                  <label className="fl">Pillar</label>
                  <select className="fsel" value={pillar} onChange={e => setPillar(e.target.value)}>{pillars.map(p => <option key={p}>{p}</option>)}</select>
                </div>
                <div className="ff">
                  <label className="fl">Quarter</label>
                  <select className="fsel" value={quarter} onChange={e => setQuarter(e.target.value)}>{QUARTERS.map(q => <option key={q}>{q}</option>)}</select>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mfoot">
          <button className="btn" onClick={onClose}>Close</button>
          {campaign.brief && campaign.status !== "approved" && (
            <button className="btn btn-gold" onClick={() => onSaveAsInit({ id: `init-${Date.now()}`, title: campaign.brief.title, description: campaign.brief.description, owner: campaign.createdBy, pillar, quarter, fileUrl: null, fileName: null, _brief: campaign.brief })}>
              → Save as Initiative
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BriefDisplay({ brief }) {
  return (
    <>
      {brief.objective && <div className="brief-sec"><div className="brief-lbl">Objective</div><div className="brief-val">{brief.objective}</div></div>}
      {brief.targetAudience && <div className="brief-sec"><div className="brief-lbl">Target Audience</div><div className="brief-val">{brief.targetAudience}</div></div>}
      {brief.description && <div className="brief-sec"><div className="brief-lbl">Campaign Overview</div><div className="brief-val">{brief.description}</div></div>}
      {/* Key Points — shown prominently when present */}
      {brief.keyPoints && brief.keyPoints.length > 0 && (
        <div className="brief-sec" style={{ borderColor: "rgba(201,168,76,.2)", background: "rgba(201,168,76,.04)" }}>
          <div className="brief-lbl" style={{ color: "var(--gold)" }}>Key Points</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 4 }}>
            {brief.keyPoints.map((pt, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(201,168,76,.15)", border: "1px solid rgba(201,168,76,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "var(--gold)", flexShrink: 0, marginTop: 2 }}>{i + 1}</div>
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {(brief.keyMessages || []).length > 0 && <div className="brief-sec"><div className="brief-lbl">Key Messages</div><div className="brief-chips">{(brief.keyMessages || []).map((m, i) => <span key={i} className="brief-chip">{m}</span>)}</div></div>}
      {(brief.channels || []).length > 0 && <div className="brief-sec"><div className="brief-lbl">Channels</div><div className="brief-chips">{(brief.channels || []).map((c, i) => <span key={i} className="brief-chip">{c}</span>)}</div></div>}
      {(brief.timeline || brief.estimatedBudget) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {brief.timeline && <div className="brief-sec"><div className="brief-lbl">Timeline</div><div className="brief-val">{brief.timeline}</div></div>}
          {brief.estimatedBudget && <div className="brief-sec"><div className="brief-lbl">Est. Budget</div><div className="brief-val">{brief.estimatedBudget}</div></div>}
        </div>
      )}
      {(brief.kpis || []).length > 0 && <div className="brief-sec"><div className="brief-lbl">KPIs</div><div className="brief-chips">{(brief.kpis || []).map((k, i) => <span key={i} className="brief-chip" style={{ background: "rgba(77,158,142,.08)", color: "#4d9e8e", borderColor: "rgba(77,158,142,.15)" }}>{k}</span>)}</div></div>}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// WHO ARE YOU MODAL
// ════════════════════════════════════════════════════════════════════════════
function WhoModal({ whoName, setWhoName, whoRole, setWhoRole, onSave, orgRoles }) {
  const preview = whoName.trim() ? colorForName(whoName.trim()) : null;
  const roles = orgRoles?.length ? orgRoles : ORG_ROLES;
  return (
    <div className="overlay">
      <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div className="who-inner">
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            {preview ? (
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: preview.bg, color: preview.text, display: "grid", placeItems: "center", fontSize: 18, fontWeight: 700, margin: "0 auto 12px" }}>{initials(whoName.trim())}</div>
            ) : (
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--surface2)", border: "1px solid var(--border)", display: "grid", placeItems: "center", fontSize: 22, margin: "0 auto 12px", opacity: .4 }}>👤</div>
            )}
            <div className="who-title">Who are you?</div>
            <div className="who-sub">Your name and role appear on the org chart and in notes.</div>
          </div>

          <div className="ff">
            <label className="fl">Your Name</label>
            <input className="fi" placeholder="e.g. Jordan Lee" value={whoName}
              onChange={e => setWhoName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && whoName.trim()) onSave(whoName.trim(), whoRole); }}
              autoFocus />
          </div>

          <div className="ff">
            <label className="fl">Your Role</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, maxHeight: 220, overflowY: "auto", padding: "2px 0" }}>
              {roles.map(r => (
                <button key={r.id}
                  onClick={() => setWhoRole(r.id)}
                  style={{
                    padding: "9px 12px", borderRadius: 8, border: `1px solid ${whoRole === r.id ? "var(--gold)" : "var(--border)"}`,
                    background: whoRole === r.id ? "var(--gold-dim)" : "var(--surface2)",
                    color: whoRole === r.id ? "var(--gold)" : "var(--text-muted)",
                    fontFamily: "var(--bf)", fontSize: 12, cursor: "pointer", textAlign: "left",
                    fontWeight: whoRole === r.id ? 600 : 400, transition: "all .13s",
                  }}
                  onMouseEnter={e => { if (whoRole !== r.id) e.currentTarget.style.borderColor = "rgba(255,255,255,.15)"; }}
                  onMouseLeave={e => { if (whoRole !== r.id) e.currentTarget.style.borderColor = "var(--border)"; }}
                >{r.title}</button>
              ))}
            </div>
          </div>

          {preview && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--surface2)", borderRadius: 8, marginBottom: 4 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: preview.bg, color: preview.text, display: "grid", placeItems: "center", fontSize: 8, fontWeight: 700 }}>{initials(whoName.trim())}</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                You'll appear as <strong style={{ color: "var(--text)" }}>{whoName.trim()}</strong> in <strong style={{ color: preview.label.toLowerCase() }}>{preview.label}</strong>
                {whoRole && <span> · <strong style={{ color: "var(--text)" }}>{roles.find(r => r.id === whoRole)?.title}</strong></span>}
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button className="btn btn-gold" disabled={!whoName.trim()} onClick={() => onSave(whoName.trim(), whoRole)}>Let's go →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DETAIL MODAL
// ════════════════════════════════════════════════════════════════════════════
function DetailModal({ init, getAccent, onClose, onFileClick }) {
  const acc = getAccent(init.channel);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal wide" onClick={e => e.stopPropagation()}>
        <div className="mhdr" style={{ borderTop: `2px solid ${acc.solid}`, borderRadius: "16px 16px 0 0" }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 6 }}>{init.channel}</div>
            <div className="mtitle">{init.title}</div>
          </div>
          <button className="mclose" onClick={onClose}>×</button>
        </div>
        <div className="mbody">
          <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.85, marginBottom: 18 }}>{init.description}</p>
          {init._brief && (
            <div style={{ marginBottom: 18 }}>
              <div className="fl" style={{ marginBottom: 10 }}>Campaign Brief</div>
              <BriefDisplay brief={init._brief} />
            </div>
          )}
          <div className="dgrid">
            <div><div className="dfield-lbl">Owner</div><div className="dfield-val">{init.owner}</div></div>
            
            {init.startDate && <div><div className="dfield-lbl">Start Date</div><div className="dfield-val">{fmtDate(init.startDate)}</div></div>}
            {(init.endDate || init.revolving) && (
              <div>
                <div className="dfield-lbl">End Date</div>
                <div className="dfield-val" style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  {init.revolving ? <span className="card-revolving">↻ Revolving / Ongoing</span> : fmtDate(init.endDate)}
                </div>
              </div>
            )}
            {init.startDate && init.endDate && !init.revolving && (() => {
              const pct = dateProgress(init.startDate, init.endDate);
              const acc2 = getAccent(init.channel);
              return (
                <div style={{ gridColumn: "1/-1" }}>
                  <div className="dfield-lbl" style={{ marginBottom: 6 }}>Progress</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, height: 5, background: "var(--surface2)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: acc2.solid, borderRadius: 3, transition: "width .4s" }} />
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", minWidth: 32 }}>{pct}%</span>
                  </div>
                </div>
              );
            })()}
            <div style={{ gridColumn: "1/-1" }}>
              <div className="dfield-lbl">Pillar</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: acc.grad, flexShrink: 0 }} />
                <div className="dfield-val">{init.channel}</div>
              </div>
            </div>
          </div>
          {init.fileUrl && (
            <div className="fpbar">
              <span>📎</span>
              <span className="fpname">{init.fileName || "Attached file"}</span>
              <button className="fpact" onClick={() => { const w = window.open(); if (init.fileUrl.startsWith("data:")) { w.document.write(`<iframe src="${init.fileUrl}" style="width:100%;height:100vh;border:none;"></iframe>`); } else { w.location = init.fileUrl; } }}>Open ↗</button>
              <button className="fpact" onClick={() => { onClose(); onFileClick(init.id); }}>Swap</button>
            </div>
          )}
        </div>
        <div className="mfoot">
          {!init.fileUrl && <button className="btn" onClick={() => { onClose(); onFileClick(init.id); }}>+ Attach File</button>}
          <button className="btn btn-gold" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FILE UPLOAD MODAL
// ════════════════════════════════════════════════════════════════════════════
function FileUploadModal({ initiative, onClose, onSave }) {
  const [dragging, setDragging] = useState(false);
  const [url, setUrl] = useState("");
  const [prevName, setPrevName] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const fileRef = useRef();
  const handleFile = (file) => { const r = new FileReader(); r.onload = e => { setPrevUrl(e.target.result); setPrevName(file.name); }; r.readAsDataURL(file); };
  const onDrop = useCallback(e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }, []);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="mhdr"><div><div className="mtitle">Attach File</div><div className="msub">{initiative?.title}</div></div><button className="mclose" onClick={onClose}>×</button></div>
        <div className="mbody">
          {initiative?.fileUrl && !prevName && <div className="fpbar"><span>📎</span><span className="fpname">Current: {initiative.fileName || "File"}</span></div>}
          {prevName ? (
            <div className="fpbar"><span>📄</span><span className="fpname">{prevName}</span><button className="fpact" onClick={() => { setPrevName(null); setPrevUrl(null); }}>Remove</button></div>
          ) : (
            <div className={`dzone ${dragging ? "drag" : ""}`} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => fileRef.current.click()}>
              <div className="dicon">📁</div><div className="dtxt">Drop file or click to browse</div><div className="dsub">HTML, PDF, DOCX — any file</div>
              <input ref={fileRef} type="file" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
            </div>
          )}
          <div className="divdr">or paste a link</div>
          <input className="url-in" placeholder="Google Docs, Notion, Figma, or any URL" value={url} onChange={e => setUrl(e.target.value)} />
        </div>
        <div className="mfoot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" disabled={!prevUrl && !url.trim()} onClick={() => { if (prevUrl) onSave(prevUrl, prevName); else if (url.trim()) onSave(url.trim(), url.trim()); }}>{initiative?.fileUrl ? "Swap File" : "Attach File"}</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ADD INITIATIVE — with integrated brief upload that auto-fills the form
// ════════════════════════════════════════════════════════════════════════════
function AddInitiativeModal({ pillars, brands, preselectedBrand, existing, onClose, onSave }) {
  const brandList = brands ? Object.values(brands) : [];
  const isEditing = !!existing;

  const [f, setF] = useState(() => ({
    title: existing?.title || "",
    description: existing?.description || "",
    owner: existing?.owner || "",
    channel: existing?.channel || CHANNELS[0],
    brandId: existing?.brandId || preselectedBrand || null,
    startDate: existing?.startDate || "",
    endDate: existing?.endDate || "",
    revolving: existing?.revolving || false,
  }));
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));
  const selectedBrand = f.brandId ? brandList.find(b => b.id === f.brandId) : null;
  const accentColor = selectedBrand?.color || "var(--gold)";

  // Right panel mode: "brief" | "concept"
  const [rightMode, setRightMode] = useState("brief");

  // Brief state
  const [briefFile, setBriefFile] = useState(null);
  const [briefParsed, setBriefParsed] = useState(null);
  const [briefProcessing, setBriefProcessing] = useState(false);
  const [briefError, setBriefError] = useState(null);
  const [briefDragging, setBriefDragging] = useState(false);
  const briefRef = useRef();
  const ACCEPTED = [".pdf",".doc",".docx",".txt",".md",".png",".jpg",".jpeg",".webp"];

  // Concept HTML state
  const [conceptHtml, setConceptHtml] = useState(null);
  const [conceptName, setConceptName] = useState(null);
  const [conceptDragging, setConceptDragging] = useState(false);
  const conceptRef = useRef();

  const handleBriefFile = (file) => {
    if (!file) return;
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ACCEPTED.some(a => ext === a)) { setBriefError("Unsupported type. Try PDF, Word, image, or text."); return; }
    setBriefFile(file); setBriefError(null); setBriefParsed(null);
  };

  const handleConceptFile = (file) => {
    if (!file?.name.endsWith(".html")) return;
    const r = new FileReader();
    r.onload = e => { setConceptHtml(e.target.result); setConceptName(file.name); };
    r.readAsText(file);
  };

  const parseBrief = async () => {
    if (!briefFile) return;
    setBriefProcessing(true); setBriefError(null);
    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader(); r.onload = e => res(e.target.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(briefFile);
      });
      const ext = briefFile.name.split(".").pop().toLowerCase();
      const isImage = ["png","jpg","jpeg","webp"].includes(ext);
      const isText = ["txt","md"].includes(ext);
      const mediaType = briefFile.type || (ext === "pdf" ? "application/pdf" : isImage ? `image/${ext}` : "text/plain");
      let msgContent;
      if (isText) msgContent = [{ type: "text", text: `Brief document:\n\n${atob(base64)}\n\nExtract key info.` }];
      else if (isImage) msgContent = [{ type: "image", source: { type: "base64", media_type: mediaType, data: base64 } }, { type: "text", text: "This is a brief document image. Extract key info." }];
      else msgContent = [{ type: "document", source: { type: "base64", media_type: mediaType, data: base64 } }, { type: "text", text: "This is a marketing brief. Extract key info." }];
      const brandContext = selectedBrand ? `for the brand "${selectedBrand.name}"` : "for CÚRADOR (all brands)";
      const resp = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1200,
          system: `You are a marketing strategist for CÚRADOR, a Missouri cannabis company. The user is uploading a brief ${brandContext}. Extract fields and respond ONLY with valid JSON, no markdown:
{"title":"short initiative title (max 8 words)","description":"2-3 sentence summary","owner":"owner or team (default: Brand Team)","channel":"one of: ${CHANNELS.join(", ")}","objective":"one sentence primary objective","keyMessages":["msg1","msg2"],"keyPoints":["Actionable point — max 12 words","Actionable point","Actionable point","Actionable point","Actionable point"]}`,
          messages: [{ role: "user", content: msgContent }],
        }),
      });
      const data = await resp.json();
      const raw = data.content?.find(c => c.type === "text")?.text || "{}";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setBriefParsed(parsed);
      if (parsed.title) s("title", parsed.title);
      if (parsed.description) s("description", parsed.description);
      if (parsed.owner) s("owner", parsed.owner);
      if (parsed.channel && CHANNELS.includes(parsed.channel)) s("channel", parsed.channel);
    } catch { setBriefError("Couldn't parse — check the file and try again."); }
    setBriefProcessing(false);
  };

  const handleSave = () => {
    onSave({
      ...f,
      id: `init-${Date.now()}`,
      fileUrl: null, fileName: briefFile?.name || null,
      _brief: briefParsed ? { objective: briefParsed.objective, keyMessages: briefParsed.keyMessages || [], keyPoints: briefParsed.keyPoints || [] } : null,
      _briefSource: briefFile?.name || null,
      htmlConcept: conceptHtml || null,
      htmlConceptName: conceptName || null,
    });
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal wide" onClick={e => e.stopPropagation()} style={{ maxWidth: 860 }}>
        <div className="mhdr" style={{ borderTop: `2px solid ${accentColor}`, borderRadius: "16px 16px 0 0" }}>
          <div className="mtitle">{isEditing ? "Edit Initiative" : "New Initiative"}</div>
          <button className="mclose" onClick={onClose}>×</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}>

          {/* LEFT — form */}
          <div style={{ padding: "18px 20px", overflowY: "auto", borderRight: "1px solid var(--border2)", maxHeight: "72vh" }}>
            {/* Brand selector */}
            <div className="ff">
              <label className="fl">Brand</label>
              <div className="brand-sel-row">
                <button className={`brand-sel-chip ${f.brandId === null ? "on" : ""}`}
                  style={{ borderColor: f.brandId === null ? "var(--gold)" : "var(--border)", background: f.brandId === null ? "var(--gold-dim)" : "transparent", color: f.brandId === null ? "var(--gold)" : "var(--text-muted)" }}
                  onClick={() => s("brandId", null)}>
                  <div className="brand-sel-pip" style={{ background: "var(--gold)" }} /> CÚRADOR
                </button>
                {brandList.map(b => (
                  <button key={b.id} className={`brand-sel-chip ${f.brandId === b.id ? "on" : ""}`}
                    style={{ borderColor: f.brandId === b.id ? b.color + "88" : "var(--border)", background: f.brandId === b.id ? b.color + "14" : "transparent", color: f.brandId === b.id ? b.color : "var(--text-muted)" }}
                    onClick={() => s("brandId", b.id)}>
                    <div className="brand-sel-pip" style={{ background: b.color }} />{b.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="ff"><label className="fl">Title *</label><input className="fi" placeholder="e.g. How to Hash Guide" value={f.title} onChange={e => s("title", e.target.value)} /></div>
            <div className="ff"><label className="fl">Description</label><textarea className="fta" placeholder="What does this initiative accomplish?" value={f.description} onChange={e => s("description", e.target.value)} /></div>
            <div className="ff"><label className="fl">Owner</label><input className="fi" placeholder="Team or person" value={f.owner} onChange={e => s("owner", e.target.value)} /></div>
            <div className="ff"><label className="fl">Channel</label>
              <select className="fsel" value={f.channel} onChange={e => s("channel", e.target.value)}>
                {CHANNELS.map(x => <option key={x}>{x}</option>)}
              </select>
            </div>
            <div className="frow">
              <div className="ff"><label className="fl">Start Date</label><input className="fi" type="date" value={f.startDate} onChange={e => s("startDate", e.target.value)} /></div>
              <div className="ff"><label className="fl">End Date</label><input className="fi" type="date" value={f.endDate} disabled={f.revolving} style={{ opacity: f.revolving ? 0.4 : 1 }} onChange={e => s("endDate", e.target.value)} /></div>
            </div>
            <div className="ff">
              <div className={`rev-toggle ${f.revolving ? "on" : ""}`} onClick={() => s("revolving", !f.revolving)}>
                <div className="rev-knob"><div className="rev-pip" /></div>
                <span className="rev-icon">↻</span>
                <div className="rev-info">
                  <div className="rev-lbl">Revolving / Ongoing</div>
                  <div className="rev-sub">{f.revolving ? "No end date — evergreen or recurring" : "Toggle on if this runs continuously"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — brief or concept */}
          <div style={{ display: "flex", flexDirection: "column", maxHeight: "72vh" }}>
            {/* Tab switcher */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--border2)", flexShrink: 0 }}>
              {[["brief","📎 Attach Brief"],["concept","🎨 HTML Concept"]].map(([mode, label]) => (
                <button key={mode} onClick={() => setRightMode(mode)} style={{
                  flex: 1, padding: "12px 0", border: "none", cursor: "pointer", fontFamily: "var(--bf)", fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", transition: "all .15s",
                  background: rightMode === mode ? "var(--surface2)" : "transparent",
                  color: rightMode === mode ? accentColor : "var(--text-muted)",
                  borderBottom: rightMode === mode ? `2px solid ${accentColor}` : "2px solid transparent",
                }}>{label}</button>
              ))}
            </div>

            <div style={{ flex: 1, padding: "16px 18px", overflowY: "auto" }}>
              {rightMode === "brief" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>Drop a PDF, Word doc, or image — AI reads it and fills the form automatically.</div>
                  {!briefFile ? (
                    <div className={`bu-zone ${briefDragging ? "drag" : ""}`}
                      style={{ minHeight: 130, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
                      onDragOver={e => { e.preventDefault(); setBriefDragging(true); }}
                      onDragLeave={() => setBriefDragging(false)}
                      onDrop={e => { e.preventDefault(); setBriefDragging(false); handleBriefFile(e.dataTransfer.files[0]); }}
                      onClick={() => briefRef.current.click()}>
                      <span className="bu-icon">📎</span>
                      <div className="bu-title">Drop brief here</div>
                      <div className="bu-sub">PDF · Word · Image · Text</div>
                      <input ref={briefRef} type="file" accept={ACCEPTED.join(",")} style={{ display: "none" }} onChange={e => handleBriefFile(e.target.files[0])} />
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div className="bu-file-row">
                        <span style={{ fontSize: 16 }}>📎</span>
                        <div className="bu-file-name">{briefFile.name}</div>
                        <button className="bu-file-rm" onClick={() => { setBriefFile(null); setBriefParsed(null); setBriefError(null); }}>✕</button>
                      </div>
                      {briefProcessing && (
                        <div className="bu-processing">
                          <div className="ai-dot" /><div className="ai-dot" /><div className="ai-dot" />
                          <div className="bu-proc-txt">Reading brief…</div>
                        </div>
                      )}
                      {briefParsed && !briefProcessing && (
                        <div style={{ padding: "10px 12px", background: "rgba(201,168,76,.06)", border: "1px solid rgba(201,168,76,.18)", borderRadius: 9 }}>
                          <div style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600, marginBottom: 6 }}>✦ Form filled from brief</div>
                          {briefParsed.objective && <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.65, marginBottom: 8 }}>{briefParsed.objective}</div>}
                          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                            {(briefParsed.keyPoints || []).map((pt, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 11, color: "var(--text-dim)" }}>
                                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(201,168,76,.15)", border: "1px solid rgba(201,168,76,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "var(--gold)", flexShrink: 0, marginTop: 1 }}>{i+1}</div>
                                <span>{pt}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {briefError && <div style={{ fontSize: 11, color: "#e07b6a", padding: "8px 10px", background: "rgba(224,123,106,.08)", borderRadius: 7 }}>{briefError}</div>}
                      {!briefParsed && !briefProcessing && (
                        <button className="btn btn-gold" style={{ width: "100%" }} onClick={parseBrief}>✦ Parse with AI</button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {rightMode === "concept" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>Drop an HTML file — presentations, mockups, interactive prototypes. It will preview on the initiative card and open full screen.</div>
                  {!conceptHtml ? (
                    <div className={`bu-zone ${conceptDragging ? "drag" : ""}`}
                      style={{ minHeight: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
                      onDragOver={e => { e.preventDefault(); setConceptDragging(true); }}
                      onDragLeave={() => setConceptDragging(false)}
                      onDrop={e => { e.preventDefault(); setConceptDragging(false); handleConceptFile(e.dataTransfer.files[0]); }}
                      onClick={() => conceptRef.current.click()}>
                      <span className="bu-icon">🎨</span>
                      <div className="bu-title">Drop HTML concept</div>
                      <div className="bu-sub">Any .html file · Renders live in the card</div>
                      <input ref={conceptRef} type="file" accept=".html" style={{ display: "none" }} onChange={e => handleConceptFile(e.target.files[0])} />
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div className="bu-file-row">
                        <span style={{ fontSize: 16 }}>🎨</span>
                        <div className="bu-file-name">{conceptName}</div>
                        <button className="bu-file-rm" onClick={() => { setConceptHtml(null); setConceptName(null); }}>✕</button>
                      </div>
                      {/* Mini preview */}
                      <div style={{ height: 180, borderRadius: 9, overflow: "hidden", position: "relative", background: "#111", border: "1px solid var(--border)" }}>
                        <iframe srcDoc={conceptHtml} style={{ width: "200%", height: "200%", border: "none", transform: "scale(0.5)", transformOrigin: "0 0", pointerEvents: "none" }} sandbox="allow-scripts" title="preview" />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 60%, rgba(7,7,15,.8) 100%)" }} />
                        <div style={{ position: "absolute", bottom: 8, left: 10, fontSize: 10, color: "var(--text-dim)" }}>Live preview · {conceptName}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mfoot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" disabled={!f.title.trim()} onClick={handleSave}>
            {isEditing ? "Save Changes" : `Add Initiative${briefFile ? " + Brief" : ""}${conceptHtml ? " + Concept" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// EDIT STRATEGY
// ════════════════════════════════════════════════════════════════════════════
function EditStrategyModal({ strategy, onClose, onSave }) {
  const [f, setF] = useState({ ...strategy, pillarsText: strategy.pillars.join("\n") });
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="mhdr"><div className="mtitle">Edit Strategy</div><button className="mclose" onClick={onClose}>×</button></div>
        <div className="mbody">
          <div className="ff"><label className="fl">Brand Name</label><input className="fi" value={f.brand} onChange={e => s("brand", e.target.value)} /></div>
          <div className="ff"><label className="fl">Tagline</label><input className="fi" value={f.tagline} onChange={e => s("tagline", e.target.value)} /></div>
          <div className="ff"><label className="fl">Vision Statement</label><textarea className="fta" style={{ minHeight: 90 }} value={f.vision} onChange={e => s("vision", e.target.value)} /></div>
          <div className="ff"><label className="fl">Strategic Pillars (one per line)</label><textarea className="fta" value={f.pillarsText} onChange={e => s("pillarsText", e.target.value)} /></div>
        </div>
        <div className="mfoot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" onClick={() => onSave({ ...f, pillars: f.pillarsText.split("\n").map(p => p.trim()).filter(Boolean) })}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BRIEF QUICK UPLOAD — header button with brand picker dropdown
// ════════════════════════════════════════════════════════════════════════════
function BriefQuickUpload({ brands, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className="btn" onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
        📎 Upload Brief
        <span style={{ fontSize: 9, opacity: .6 }}>▾</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 200, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "6px", minWidth: 180, boxShadow: "0 8px 32px rgba(0,0,0,.4)" }}>
          <div style={{ fontSize: 9, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--text-muted)", padding: "4px 8px 6px", fontWeight: 500 }}>Select brand</div>
          {Object.values(brands).map(b => (
            <button key={b.id} onClick={() => { onSelect(b.id); setOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "8px 10px", borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--bf)", transition: "background .12s", textAlign: "left" }}
              onMouseEnter={e => e.currentTarget.style.background = b.color + "14"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: b.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "var(--text)", fontWeight: 500 }}>{b.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BRIEF UPLOAD MODAL
// ════════════════════════════════════════════════════════════════════════════
function BriefUploadModal({ brandId, brand, pillars, onClose, onSave }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState(null); // base64
  const [processing, setProcessing] = useState(false);
  const [parsed, setParsed] = useState(null);   // AI-extracted fields
  const [error, setError] = useState(null);
  const fileRef = useRef();

  // Accept PDF, Word docs, images, text
  const ACCEPTED = [".pdf",".doc",".docx",".txt",".md",".png",".jpg",".jpeg",".webp"];

  const readFile = (f) => {
    if (!f) return;
    const ext = "." + f.name.split(".").pop().toLowerCase();
    if (!ACCEPTED.some(a => ext === a)) { setError("Unsupported file type. Try PDF, Word, image, or text."); return; }
    setFile(f);
    setError(null);
    setParsed(null);
    const reader = new FileReader();
    reader.onload = e => setFileData(e.target.result); // data URL
    reader.readAsDataURL(f);
  };

  const onDrop = useCallback(e => {
    e.preventDefault(); setDragging(false);
    readFile(e.dataTransfer.files[0]);
  }, []);

  const parseBrief = async () => {
    if (!file || !fileData) return;
    setProcessing(true); setError(null);
    try {
      const ext = file.name.split(".").pop().toLowerCase();
      const isImage = ["png","jpg","jpeg","webp"].includes(ext);
      const isPdf = ext === "pdf";
      const isText = ["txt","md"].includes(ext);
      const base64 = fileData.split(",")[1];
      const mediaType = file.type || (isPdf ? "application/pdf" : isImage ? `image/${ext}` : "text/plain");

      let msgContent;
      if (isText) {
        // Decode text and send as text
        const text = atob(base64);
        msgContent = [{ type: "text", text: `Here is a marketing brief document:\n\n${text}\n\nPlease extract the key information.` }];
      } else if (isImage) {
        msgContent = [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
          { type: "text", text: "This is a marketing brief document image. Please extract the key information." }
        ];
      } else {
        // PDF or Word — send as document
        msgContent = [
          { type: "document", source: { type: "base64", media_type: mediaType, data: base64 } },
          { type: "text", text: "This is a marketing brief. Please extract the key information." }
        ];
      }

      const systemPrompt = `You are a marketing strategist for CÚRADOR, a Missouri cannabis company. The user is uploading a brief document for the brand "${brand?.name || "Unknown"}".
Extract the following fields from the document and respond ONLY with a valid JSON object, no markdown, no backticks, no commentary:
{
  "title": "short initiative title (max 8 words)",
  "description": "2-3 sentence summary of the initiative objective",
  "owner": "who owns this initiative (person or team, if mentioned, otherwise 'Brand Team')",
  "channel": "one of: ${pillars.join(", ")} — pick the best fit",
  "quarter": "one of: Q1 2026, Q2 2026, Q3 2026, Q4 2026 — pick the most relevant",
  "keyMessages": ["key message 1", "key message 2"],
  "channels": ["channel 1", "channel 2"],
  "objective": "single sentence primary objective",
  "notes": "any other important context from the brief (max 2 sentences)"
}
If a field is not present, use a sensible default. Always return valid JSON only.`;

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: msgContent }],
        }),
      });

      const data = await resp.json();
      const raw = data.content?.find(c => c.type === "text")?.text || "{}";
      const clean = raw.replace(/```json|```/g, "").trim();
      const extracted = JSON.parse(clean);
      setParsed(extracted);
    } catch (e) {
      setError("Couldn't parse the brief — try a clearer PDF or paste the text manually.");
    }
    setProcessing(false);
  };

  const createCard = () => {
    if (!parsed) return;
    const init = {
      id: `init-${Date.now()}`,
      title: parsed.title || file.name.replace(/\.[^.]+$/, ""),
      description: parsed.description || "",
      owner: parsed.owner || "Brand Team",
      pillar: pillars.includes(parsed.pillar) ? parsed.pillar : pillars[0],
      quarter: parsed.quarter || "Q2 2026",
      brandId: brandId,
      fileUrl: null, fileName: file.name,
      _brief: { objective: parsed.objective, keyMessages: parsed.keyMessages || [], channels: parsed.channels || [] },
      _briefSource: file.name,
      _briefNotes: parsed.notes || "",
    };
    onSave(init);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal wide" onClick={e => e.stopPropagation()}>
        <div className="mhdr" style={{ borderTop: `2px solid ${brand?.color || "var(--gold)"}`, borderRadius: "16px 16px 0 0" }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 5 }}>
              {brand?.name || "Brand"} · Upload Brief
            </div>
            <div className="mtitle">Create Initiative from Brief</div>
          </div>
          <button className="mclose" onClick={onClose}>×</button>
        </div>

        <div className="mbody">
          {!file ? (
            /* Drop zone */
            <div
              className={`bu-zone ${dragging ? "drag" : ""}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current.click()}
            >
              <span className="bu-icon">📎</span>
              <div className="bu-title">Drop your brief here</div>
              <div className="bu-sub">PDF, Word doc, image, or text file — AI will extract the key info and build the card</div>
              <input ref={fileRef} type="file" accept={ACCEPTED.join(",")} style={{ display: "none" }} onChange={e => readFile(e.target.files[0])} />
            </div>
          ) : (
            <div>
              {/* File attached row */}
              <div className="bu-file-row">
                <span style={{ fontSize: 16 }}>📎</span>
                <div className="bu-file-name">{file.name}</div>
                <button className="bu-file-rm" onClick={() => { setFile(null); setFileData(null); setParsed(null); setError(null); }}>✕</button>
              </div>

              {/* Processing indicator */}
              {processing && (
                <div className="bu-processing">
                  <div className="ai-dot" /><div className="ai-dot" /><div className="ai-dot" />
                  <div className="bu-proc-txt">Reading brief and extracting initiative details…</div>
                </div>
              )}

              {/* Parsed preview */}
              {parsed && !processing && (
                <div className="bu-preview">
                  <div style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: brand?.color || "var(--gold)", marginBottom: 8, fontWeight: 600 }}>Extracted from Brief</div>
                  <div className="bu-prev-title">{parsed.title}</div>
                  <div className="bu-prev-body">{parsed.description}</div>
                  {parsed.objective && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, fontStyle: "italic" }}>Objective: {parsed.objective}</div>}
                  <div className="bu-prev-chips">
                    {(parsed.keyMessages || []).map(m => <span key={m} className="bu-prev-chip">{m}</span>)}
                    {(parsed.channels || []).map(c => <span key={c} className="bu-prev-chip" style={{ background: "rgba(77,158,142,.1)", color: "#4d9e8e", borderColor: "rgba(77,158,142,.2)" }}>{c}</span>)}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
                    {[["Pillar", parsed.pillar], ["Quarter", parsed.quarter], ["Owner", parsed.owner]].map(([l, v]) => (
                      <div key={l} style={{ padding: "8px 10px", background: "var(--surface)", borderRadius: 7, border: "1px solid var(--border2)" }}>
                        <div style={{ fontSize: 9, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 3 }}>{l}</div>
                        <div style={{ fontSize: 12, color: "var(--text)" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {parsed.notes && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10, padding: "8px 10px", background: "var(--surface)", borderRadius: 7, borderLeft: `2px solid ${brand?.color || "var(--gold)"}` }}>{parsed.notes}</div>}
                </div>
              )}

              {error && <div style={{ fontSize: 12, color: "#e07b6a", padding: "10px 12px", background: "rgba(224,123,106,.08)", borderRadius: 8, border: "1px solid rgba(224,123,106,.2)", marginBottom: 12 }}>{error}</div>}

              {/* Parse button if not yet processed */}
              {!parsed && !processing && (
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Ready to parse — click below to let AI extract the initiative details from your brief.</div>
              )}
            </div>
          )}
        </div>

        <div className="mfoot">
          <button className="btn" onClick={onClose}>Cancel</button>
          {file && !parsed && !processing && (
            <button className="btn btn-gold" onClick={parseBrief}>✦ Parse Brief with AI</button>
          )}
          {parsed && !processing && (
            <button className="btn btn-gold" onClick={createCard}>Create Initiative Card →</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// GANTT VIEWER
// ════════════════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════════════
// CONCEPTS PANEL — upload & host HTML files
// ════════════════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════════════
// CONCEPT VIEWER MODAL — full-screen HTML concept viewer for initiatives
// ════════════════════════════════════════════════════════════════════════════
function ConceptViewerModal({ init, onClose, onUpload }) {
  const color = getChannelColor(init.channel);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", flexDirection: "column", background: "#07070f" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,.07)", background: "rgba(7,7,15,.95)", backdropFilter: "blur(16px)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{init.title}</div>
            <div style={{ fontSize: 10, color, textTransform: "uppercase", letterSpacing: ".09em" }}>
              {(init.channel || "").split(" · ")[1] || init.channel}
              {init.htmlConceptName && <span style={{ color: "var(--text-muted)", marginLeft: 8 }}>· {init.htmlConceptName}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-sm" onClick={() => { const blob = new Blob([init.htmlConcept], { type: "text/html" }); window.open(URL.createObjectURL(blob), "_blank"); }}>Open Full Screen ↗</button>
          <button className="btn btn-sm" onClick={onUpload}>↺ Replace</button>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid rgba(255,255,255,.1)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontSize: 16, display: "grid", placeItems: "center" }}>×</button>
        </div>
      </div>
      <iframe srcDoc={init.htmlConcept} title={init.title} sandbox="allow-scripts allow-same-origin allow-forms allow-downloads" style={{ flex: 1, border: "none", width: "100%", background: "#fff" }} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CONCEPT HTML UPLOAD MODAL — attach HTML to an existing initiative
// ════════════════════════════════════════════════════════════════════════════
function ConceptHtmlUploadModal({ initName, onClose, onSave }) {
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();
  const handleFile = (file) => {
    if (!file?.name.endsWith(".html")) return;
    const r = new FileReader();
    r.onload = e => onSave(e.target.result, file.name);
    r.readAsText(file);
  };
  const onDrop = useCallback(e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }, []);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="mhdr">
          <div className="mtitle">Attach Concept</div>
          <button className="mclose" onClick={onClose}>×</button>
        </div>
        <div className="mbody">
          <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 18, lineHeight: 1.7 }}>
            Attach an HTML concept file to <strong style={{ color: "var(--text)" }}>{initName}</strong>.
          </div>
          <div className={`bu-zone ${dragging ? "drag" : ""}`}
            style={{ minHeight: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current.click()}>
            <span style={{ fontSize: 32, marginBottom: 12, opacity: .5 }}>🎨</span>
            <div style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 6 }}>Drop your HTML concept here</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Any .html file · Renders live</div>
            <input ref={fileRef} type="file" accept=".html" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
          </div>
        </div>
        <div className="mfoot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" onClick={() => fileRef.current.click()}>Browse Files</button>
        </div>
      </div>
    </div>
  );
}

function AddConceptModal({ brands, onClose, onSave }) {
  const brandList = brands ? Object.values(brands) : [];
  const [f, setF] = useState({ title: "", description: "", brandId: null, channel: CHANNELS[0] });
  const s = (k, v) => setF(p => ({ ...p, [k]: v }));
  const selectedBrand = f.brandId ? brandList.find(b => b.id === f.brandId) : null;
  const accentColor = selectedBrand?.color || "var(--gold)";
  const [rightMode, setRightMode] = useState("brief");

  // Brief
  const [briefFile, setBriefFile] = useState(null);
  const [briefParsed, setBriefParsed] = useState(null);
  const [briefProcessing, setBriefProcessing] = useState(false);
  const [briefError, setBriefError] = useState(null);
  const [briefDragging, setBriefDragging] = useState(false);
  const briefRef = useRef();
  const ACCEPTED = [".pdf",".doc",".docx",".txt",".md",".png",".jpg",".jpeg",".webp"];

  // HTML concept
  const [conceptHtml, setConceptHtml] = useState(null);
  const [conceptName, setConceptName] = useState(null);
  const [conceptDragging, setConceptDragging] = useState(false);
  const conceptRef = useRef();

  const handleBriefFile = (file) => {
    if (!file) return;
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ACCEPTED.some(a => ext === a)) { setBriefError("Unsupported type."); return; }
    setBriefFile(file); setBriefError(null); setBriefParsed(null);
  };

  const handleConceptFile = (file) => {
    if (!file?.name.endsWith(".html")) return;
    const r = new FileReader();
    r.onload = e => { setConceptHtml(e.target.result); setConceptName(file.name.replace(/\.html$/i,"")); if (!f.title) s("title", file.name.replace(/\.html$/i,"")); };
    r.readAsText(file);
  };

  const parseBrief = async () => {
    if (!briefFile) return;
    setBriefProcessing(true); setBriefError(null);
    try {
      const base64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = e => res(e.target.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(briefFile); });
      const ext = briefFile.name.split(".").pop().toLowerCase();
      const isImage = ["png","jpg","jpeg","webp"].includes(ext);
      const isText = ["txt","md"].includes(ext);
      const mediaType = briefFile.type || (ext === "pdf" ? "application/pdf" : isImage ? `image/${ext}` : "text/plain");
      let msgContent;
      if (isText) msgContent = [{ type: "text", text: `Brief:

${atob(base64)}` }];
      else if (isImage) msgContent = [{ type: "image", source: { type: "base64", media_type: mediaType, data: base64 } }, { type: "text", text: "Extract key info from this brief." }];
      else msgContent = [{ type: "document", source: { type: "base64", media_type: mediaType, data: base64 } }, { type: "text", text: "Extract key info from this brief." }];
      const resp = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `You are a marketing strategist for CÚRADOR. Extract fields from this brief and respond ONLY with valid JSON:
{"title":"short concept title (max 8 words)","description":"2-3 sentence summary","keyPoints":["Point 1","Point 2","Point 3","Point 4"]}`,
          messages: [{ role: "user", content: msgContent }],
        }),
      });
      const data = await resp.json();
      const raw = data.content?.find(x => x.type === "text")?.text || "{}";
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setBriefParsed(parsed);
      if (parsed.title) s("title", parsed.title);
      if (parsed.description) s("description", parsed.description);
    } catch { setBriefError("Couldn't parse — try again."); }
    setBriefProcessing(false);
  };

  const handleSave = () => {
    if (!f.title.trim() && !conceptName) return;
    onSave({
      id: `concept-${Date.now()}`,
      name: f.title.trim() || conceptName || "Untitled",
      description: f.description,
      brandId: f.brandId,
      channel: f.channel,
      html: conceptHtml || null,
      brief: briefParsed ? { keyPoints: briefParsed.keyPoints || [] } : null,
      briefFile: briefFile?.name || null,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal wide" onClick={e => e.stopPropagation()} style={{ maxWidth: 860 }}>
        <div className="mhdr" style={{ borderTop: `2px solid ${accentColor}`, borderRadius: "16px 16px 0 0" }}>
          <div className="mtitle">New Concept</div>
          <button className="mclose" onClick={onClose}>×</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}>
          {/* LEFT — form */}
          <div style={{ padding: "18px 20px", overflowY: "auto", borderRight: "1px solid var(--border2)", maxHeight: "68vh" }}>
            <div className="ff">
              <label className="fl">Brand</label>
              <div className="brand-sel-row">
                <button className={`brand-sel-chip ${f.brandId === null ? "on" : ""}`}
                  style={{ borderColor: f.brandId === null ? "var(--gold)" : "var(--border)", background: f.brandId === null ? "var(--gold-dim)" : "transparent", color: f.brandId === null ? "var(--gold)" : "var(--text-muted)" }}
                  onClick={() => s("brandId", null)}>
                  <div className="brand-sel-pip" style={{ background: "var(--gold)" }} /> CÚRADOR
                </button>
                {brandList.map(b => (
                  <button key={b.id} className={`brand-sel-chip ${f.brandId === b.id ? "on" : ""}`}
                    style={{ borderColor: f.brandId === b.id ? b.color+"88":"var(--border)", background: f.brandId === b.id ? b.color+"14":"transparent", color: f.brandId === b.id ? b.color:"var(--text-muted)" }}
                    onClick={() => s("brandId", b.id)}>
                    <div className="brand-sel-pip" style={{ background: b.color }} />{b.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="ff"><label className="fl">Title *</label><input className="fi" placeholder="e.g. Summer Campaign Concept" value={f.title} onChange={e => s("title", e.target.value)} /></div>
            <div className="ff"><label className="fl">Description</label><textarea className="fta" placeholder="What is this concept?" value={f.description} onChange={e => s("description", e.target.value)} /></div>
            <div className="ff"><label className="fl">Channel</label>
              <select className="fsel" value={f.channel} onChange={e => s("channel", e.target.value)}>
                {CHANNELS.map(x => <option key={x}>{x}</option>)}
              </select>
            </div>
          </div>
          {/* RIGHT — tabs */}
          <div style={{ display: "flex", flexDirection: "column", maxHeight: "68vh" }}>
            <div style={{ display: "flex", borderBottom: "1px solid var(--border2)", flexShrink: 0 }}>
              {[["brief","📎 Attach Brief"],["concept","🎨 HTML Concept"]].map(([mode, label]) => (
                <button key={mode} onClick={() => setRightMode(mode)} style={{
                  flex: 1, padding: "12px 0", border: "none", cursor: "pointer", fontFamily: "var(--bf)", fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase",
                  background: rightMode === mode ? "var(--surface2)" : "transparent",
                  color: rightMode === mode ? accentColor : "var(--text-muted)",
                  borderBottom: rightMode === mode ? `2px solid ${accentColor}` : "2px solid transparent",
                }}>{label}</button>
              ))}
            </div>
            <div style={{ flex: 1, padding: "16px 18px", overflowY: "auto" }}>
              {rightMode === "brief" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>Drop a brief — AI reads it and fills the form.</div>
                  {!briefFile ? (
                    <div className={`bu-zone ${briefDragging ? "drag" : ""}`} style={{ minHeight: 130, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
                      onDragOver={e => { e.preventDefault(); setBriefDragging(true); }} onDragLeave={() => setBriefDragging(false)}
                      onDrop={e => { e.preventDefault(); setBriefDragging(false); handleBriefFile(e.dataTransfer.files[0]); }}
                      onClick={() => briefRef.current.click()}>
                      <span className="bu-icon">📎</span>
                      <div className="bu-title">Drop brief here</div>
                      <div className="bu-sub">PDF · Word · Image · Text</div>
                      <input ref={briefRef} type="file" accept={ACCEPTED.join(",")} style={{ display: "none" }} onChange={e => handleBriefFile(e.target.files[0])} />
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div className="bu-file-row">
                        <span>📎</span><div className="bu-file-name">{briefFile.name}</div>
                        <button className="bu-file-rm" onClick={() => { setBriefFile(null); setBriefParsed(null); }}>✕</button>
                      </div>
                      {briefProcessing && <div className="bu-processing"><div className="ai-dot"/><div className="ai-dot"/><div className="ai-dot"/><div className="bu-proc-txt">Reading brief…</div></div>}
                      {briefParsed && !briefProcessing && (
                        <div style={{ padding:"10px 12px", background:"rgba(201,168,76,.06)", border:"1px solid rgba(201,168,76,.18)", borderRadius:9 }}>
                          <div style={{ fontSize:9, letterSpacing:".12em", textTransform:"uppercase", color:"var(--gold)", fontWeight:600, marginBottom:6 }}>✦ Form filled from brief</div>
                          {(briefParsed.keyPoints||[]).map((pt,i) => (
                            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:11, color:"var(--text-dim)", marginBottom:4 }}>
                              <div style={{ width:16, height:16, borderRadius:"50%", background:"rgba(201,168,76,.15)", border:"1px solid rgba(201,168,76,.25)", display:"grid", placeItems:"center", fontSize:8, fontWeight:700, color:"var(--gold)", flexShrink:0 }}>{i+1}</div>
                              <span>{pt}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {briefError && <div style={{ fontSize:11, color:"#e07b6a", padding:"8px 10px", background:"rgba(224,123,106,.08)", borderRadius:7 }}>{briefError}</div>}
                      {!briefParsed && !briefProcessing && <button className="btn btn-gold" style={{ width:"100%" }} onClick={parseBrief}>✦ Parse with AI</button>}
                    </div>
                  )}
                </div>
              )}
              {rightMode === "concept" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>Drop an HTML file — it renders live in the Concepts panel.</div>
                  {!conceptHtml ? (
                    <div className={`bu-zone ${conceptDragging ? "drag" : ""}`} style={{ minHeight: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
                      onDragOver={e => { e.preventDefault(); setConceptDragging(true); }} onDragLeave={() => setConceptDragging(false)}
                      onDrop={e => { e.preventDefault(); setConceptDragging(false); handleConceptFile(e.dataTransfer.files[0]); }}
                      onClick={() => conceptRef.current.click()}>
                      <span className="bu-icon">🎨</span>
                      <div className="bu-title">Drop HTML concept</div>
                      <div className="bu-sub">Any .html file · Renders live</div>
                      <input ref={conceptRef} type="file" accept=".html" style={{ display: "none" }} onChange={e => handleConceptFile(e.target.files[0])} />
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div className="bu-file-row">
                        <span>🎨</span><div className="bu-file-name">{conceptName}</div>
                        <button className="bu-file-rm" onClick={() => { setConceptHtml(null); setConceptName(null); }}>✕</button>
                      </div>
                      <div style={{ height: 180, borderRadius: 9, overflow: "hidden", position: "relative", background: "#111", border: "1px solid var(--border)" }}>
                        <iframe srcDoc={conceptHtml} style={{ width:"200%", height:"200%", border:"none", transform:"scale(0.5)", transformOrigin:"0 0", pointerEvents:"none" }} sandbox="allow-scripts" title="preview" />
                        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,transparent 60%,rgba(7,7,15,.8) 100%)" }} />
                        <div style={{ position:"absolute", bottom:8, left:10, fontSize:10, color:"var(--text-dim)" }}>Live preview · {conceptName}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mfoot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold" disabled={!f.title.trim() && !conceptName} onClick={handleSave}>
            Add Concept{briefFile ? " + Brief" : ""}{conceptHtml ? " + HTML" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConceptsPanel({ concepts, activeConceptId, setActiveConceptId, onAdd, onRemove, onRename, brands, canEdit }) {
  const [dragging, setDragging] = useState(false);
  const [renaming, setRenaming] = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [loadedHtml, setLoadedHtml] = useState({}); // { [id]: html } — loaded on demand

  // Load HTML from storage when concept is selected
  useEffect(() => {
    if (!activeConceptId) return;
    const concept = concepts.find(c => c.id === activeConceptId);
    if (!concept) return;
    // Already loaded inline (new upload not yet saved)
    if (concept.html && !loadedHtml[activeConceptId]) {
      setLoadedHtml(p => ({ ...p, [activeConceptId]: concept.html }));
      return;
    }
    if (loadedHtml[activeConceptId]) return;
    // Load from storage
    window.storage.get(`ns-ch-${activeConceptId}`, true)
      .then(r => { if (r?.value) setLoadedHtml(p => ({ ...p, [activeConceptId]: r.value })); })
      .catch(() => {});
  }, [activeConceptId, concepts]);

  const handleAdd = async (concept) => {
    const { html, ...meta } = concept;
    // Store HTML separately in shared storage (keeps metadata array small)
    if (html) {
      await window.storage.set(`ns-ch-${concept.id}`, html, true).catch(() => {});
      setLoadedHtml(p => ({ ...p, [concept.id]: html }));
    }
    onAdd(meta);
    setActiveConceptId(concept.id);
    setShowAddModal(false);
  };

  const handleRemove = async (id) => {
    await window.storage.delete(`ns-ch-${id}`, true).catch(() => {});
    setLoadedHtml(p => { const n = { ...p }; delete n[id]; return n; });
    onRemove(id);
  };

  const activeConcept = concepts.find(c => c.id === activeConceptId);
  const activeHtml = activeConceptId ? loadedHtml[activeConceptId] : null;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 57px)", overflow: "hidden" }}>
      {showAddModal && <AddConceptModal brands={brands} onClose={() => setShowAddModal(false)} onSave={handleAdd} />}

      {/* LEFT — list */}
      <div style={{ width: 230, flexShrink: 0, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", background: "var(--surface)" }}>
        <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid var(--border2)" }}>
          <div style={{ fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 600, marginBottom: 10 }}>Concepts · {concepts.length}</div>
          {canEdit && <button className="btn btn-gold" style={{ width: "100%", justifyContent: "center", fontSize: 11 }} onClick={() => setShowAddModal(true)}>
            + New Concept
          </button>}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "6px" }}>
          {concepts.length === 0 ? (
            <div style={{ padding: "20px 10px", textAlign: "center", color: "var(--text-muted)", fontSize: 11, lineHeight: 1.7, fontStyle: "italic" }}>
              No concepts yet.<br />Click + New Concept to add one.
            </div>
          ) : concepts.map(c => {
            const brand = c.brandId ? Object.values(brands || {}).find(b => b.id === c.brandId) : null;
            return (
              <div key={c.id} onClick={() => setActiveConceptId(c.id)} style={{
                padding: "9px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 3,
                background: activeConceptId === c.id ? "var(--gold-dim)" : "transparent",
                border: `1px solid ${activeConceptId === c.id ? "rgba(201,168,76,.3)" : "transparent"}`,
                transition: "all .13s",
              }}
                onMouseEnter={e => { if (activeConceptId !== c.id) e.currentTarget.style.background = "rgba(255,255,255,.03)"; }}
                onMouseLeave={e => { if (activeConceptId !== c.id) e.currentTarget.style.background = "transparent"; }}
              >
                {renaming === c.id ? (
                  <input autoFocus value={renameVal} onChange={e => setRenameVal(e.target.value)}
                    onBlur={() => { onRename(c.id, renameVal || c.name); setRenaming(null); }}
                    onKeyDown={e => { if (e.key === "Enter") { onRename(c.id, renameVal || c.name); setRenaming(null); } if (e.key === "Escape") setRenaming(null); }}
                    onClick={e => e.stopPropagation()}
                    style={{ width: "100%", background: "var(--surface2)", border: "1px solid var(--gold)", borderRadius: 4, padding: "2px 6px", color: "var(--text)", fontSize: 12, fontFamily: "var(--bf)", outline: "none" }} />
                ) : (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {brand && <div style={{ width: 7, height: 7, borderRadius: "50%", background: brand.color, flexShrink: 0 }} />}
                      <span style={{ fontSize: 12, color: activeConceptId === c.id ? "var(--gold)" : "var(--text)", fontWeight: activeConceptId === c.id ? 600 : 400, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                    </div>
                    {c.channel && <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(c.channel||"").split(" · ")[1] || c.channel}</div>}
                  </div>
                )}
                {activeConceptId === c.id && renaming !== c.id && (
                  <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                    <button onClick={e => { e.stopPropagation(); setRenaming(c.id); setRenameVal(c.name); }}
                      style={{ flex: 1, fontSize: 9, padding: "3px 0", background: "rgba(255,255,255,.05)", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-muted)", cursor: "pointer", letterSpacing: ".06em", textTransform: "uppercase" }}>Rename</button>
                    <button onClick={e => { e.stopPropagation(); handleRemove(c.id); }}
                      style={{ flex: 1, fontSize: 9, padding: "3px 0", background: "rgba(224,123,106,.08)", border: "1px solid rgba(224,123,106,.2)", borderRadius: 4, color: "#e07b6a", cursor: "pointer", letterSpacing: ".06em", textTransform: "uppercase" }}>Delete</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT — viewer */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {activeConcept && activeHtml ? (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px", borderBottom: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13 }}>🎨</span>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{activeConcept.name}</div>
                {activeConcept.channel && <div style={{ fontSize: 10, color: "var(--gold)", padding: "1px 8px", border: "1px solid rgba(201,168,76,.25)", borderRadius: 100 }}>{(activeConcept.channel||"").split(" · ")[1]||activeConcept.channel}</div>}
                <div style={{ fontSize: 10, color: "var(--text-muted)", padding: "1px 8px", border: "1px solid var(--border2)", borderRadius: 100 }}>
                  {new Date(activeConcept.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"2-digit"})}
                </div>
              </div>
              <div style={{ display: "flex", gap: 7 }}>
                <button className="btn btn-sm" onClick={() => { const blob = new Blob([activeHtml],{type:"text/html"}); window.open(URL.createObjectURL(blob),"_blank"); }}>Open ↗</button>
                <button className="btn btn-sm" onClick={() => { const blob = new Blob([activeHtml],{type:"text/html"}); const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=activeConcept.name+".html"; a.click(); }}>↓ Download</button>
              </div>
            </div>
            {activeConcept.brief?.keyPoints?.length > 0 && (
              <div style={{ padding: "10px 18px", borderBottom: "1px solid var(--border2)", background: "rgba(201,168,76,.03)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                {activeConcept.brief.keyPoints.map((pt, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 11, color: "var(--text-dim)" }}>
                    <div style={{ width: 15, height: 15, borderRadius: "50%", background: "rgba(201,168,76,.12)", border: "1px solid rgba(201,168,76,.2)", display: "grid", placeItems: "center", fontSize: 7, fontWeight: 700, color: "var(--gold)", flexShrink: 0 }}>{i+1}</div>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            )}
            <iframe key={activeConcept.id} srcDoc={activeHtml} title={activeConcept.name} sandbox="allow-scripts allow-same-origin allow-forms allow-downloads" style={{ flex: 1, border: "none", width: "100%", background: "#fff" }} />
          </>
        ) : activeConcept && !activeHtml ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 28, marginBottom: 12, opacity: .3 }}>🎨</div>
              <div style={{ fontSize: 13 }}>No HTML attached to this concept</div>
              <div style={{ fontSize: 11, marginTop: 4, opacity: .6 }}>Brief notes and metadata are saved</div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); }}
          >
            <div style={{ textAlign: "center", padding: "60px 40px", borderRadius: 20, border: `2px dashed ${dragging ? "var(--gold)" : "var(--border)"}`, background: dragging ? "rgba(201,168,76,.04)" : "transparent", transition: "all .2s", maxWidth: 480 }}>
              <div style={{ fontSize: 40, marginBottom: 18, opacity: .5 }}>🎨</div>
              <div style={{ fontFamily: "var(--df)", fontSize: 28, fontWeight: 300, color: "var(--text)", marginBottom: 10 }}>
                {concepts.length > 0 ? "Select a concept" : "No concepts yet"}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.75, marginBottom: 24 }}>
                Add concepts with briefs, HTML prototypes, or both. Stored and shared with the whole team.
              </div>
              <button className="btn btn-gold" onClick={() => setShowAddModal(true)}>+ New Concept</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GanttViewer({ ganttHtml, onUpdate, canEdit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(ganttHtml || "");
  const [saved, setSaved] = useState(false);
  const fileRef = useRef();
  const textareaRef = useRef();

  // Keep draft in sync if ganttHtml changes externally
  useEffect(() => {
    if (ganttHtml) { setDraft(ganttHtml); return; }
    fetch(DEFAULT_GANTT_URL).then(r=>r.text()).then(html=>{setDraft(html);onUpdate(html);}).catch(()=>{});
  }, [ganttHtml]);

  const handleFile = (file) => {
    if (!file?.name.endsWith(".html")) return;
    const r = new FileReader();
    r.onload = e => { setDraft(e.target.result); onUpdate(e.target.result); };
    r.readAsText(file);
  };

  const pushUpdate = () => {
    onUpdate(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const exitEditor = () => { setEditing(false); };

  if (editing) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 57px)" }}>
        {/* Editor toolbar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 18px", borderBottom: "1px solid var(--border)",
          background: "var(--surface)", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e07b6a", boxShadow: "0 0 6px #e07b6a" }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Timeline Editor</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", padding: "2px 8px", border: "1px solid var(--border2)", borderRadius: 100 }}>Live preview updates as you type</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-sm" onClick={exitEditor}>← Back to View</button>
            <button
              onClick={pushUpdate}
              style={{
                padding: "6px 16px", borderRadius: 7, border: "none", cursor: "pointer",
                background: saved ? "#4d9e8e" : "#c9a84c", color: "#07070f",
                fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase",
                transition: "background .3s", fontFamily: "var(--bf)",
              }}
            >
              {saved ? "✓ Saved" : "Push Update"}
            </button>
          </div>
        </div>

        {/* Split panel */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}>
          {/* Left — code editor */}
          <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", background: "#0a0a14" }}>
            <div style={{ padding: "7px 14px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <div style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 500 }}>HTML Source</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>· {draft.length.toLocaleString()} chars</div>
              <button className="btn btn-sm" style={{ marginLeft: "auto", fontSize: 9 }} onClick={() => fileRef.current.click()}>↺ Replace File</button>
              <input ref={fileRef} type="file" accept=".html" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
            </div>
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              spellCheck={false}
              style={{
                flex: 1, padding: "14px 16px",
                background: "transparent", border: "none", outline: "none",
                color: "#a8c4e0", fontFamily: "'DM Mono','Fira Code','Courier New',monospace",
                fontSize: 12, lineHeight: 1.65, resize: "none",
                overflowY: "auto", tabSize: 2,
              }}
            />
          </div>

          {/* Right — live preview */}
          <div style={{ display: "flex", flexDirection: "column", background: "#fff" }}>
            <div style={{ padding: "7px 14px", borderBottom: "1px solid rgba(0,0,0,.08)", background: "#f5f5f5", flexShrink: 0 }}>
              <div style={{ fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "#666", fontWeight: 500 }}>Live Preview</div>
            </div>
            <iframe
              key={draft.length}
              srcDoc={draft}
              title="Gantt Live Preview"
              sandbox="allow-scripts allow-same-origin allow-forms"
              style={{ flex: 1, border: "none", width: "100%" }}
            />
          </div>
        </div>
      </div>
    );
  }

  // View mode
  return (
    <div className="gv-wrap">
      <div className="gv-bar">
        <div className="gv-title">
          Curador Brands — Project Timeline
          <span>Interactive Gantt · Drag bars to reschedule</span>
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          {canEdit && <button className="btn btn-sm" onClick={() => setEditing(true)} style={{ borderColor: "rgba(201,168,76,.3)", color: "var(--gold)" }}>
            ✏ Edit
          </button>}
          <button className="btn btn-sm" onClick={() => fileRef.current.click()}>↺ Replace</button>
          <button className="btn btn-sm" onClick={() => { onUpdate(null); }}>↩ Reset</button>
          <input ref={fileRef} type="file" accept=".html" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
        </div>
      </div>
      <iframe
        className="gv-frame"
        srcDoc={ganttHtml}
        title="Timeline"
        sandbox="allow-scripts allow-same-origin allow-downloads allow-forms"
      />
    </div>
  );
}

import React, { useState, useRef } from "react";

// ─────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lora:wght@600;700&display=swap');
  * { box-sizing: border-box; }

  .zoom-card {
    transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease;
    cursor: pointer;
  }
  .zoom-card:hover {
    transform: scale(1.06);
    box-shadow: 0 16px 40px rgba(14,165,233,0.18);
    z-index: 5;
    position: relative;
  }
  .zoom-card:active { transform: scale(1.10); }

  .nav-btn {
    background: none; border: none; cursor: pointer;
    font-size: 15px; font-family: 'Plus Jakarta Sans', sans-serif;
    padding: 6px 16px; border-radius: 8px;
    transition: color 0.2s, background 0.2s;
  }

  .cta-primary {
    background: linear-gradient(135deg,#0ea5e9,#0284c7);
    color: #fff; border: none; padding: 13px 32px;
    border-radius: 50px; font-size: 15px; font-weight: 700;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
    box-shadow: 0 4px 18px rgba(14,165,233,0.35);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .cta-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(14,165,233,0.45); }

  .cta-outline {
    background: rgba(255,255,255,0.12); color: #fff;
    border: 2px solid rgba(255,255,255,0.5); padding: 13px 32px;
    border-radius: 50px; font-size: 15px; font-weight: 600;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
    transition: background 0.2s;
  }
  .cta-outline:hover { background: rgba(255,255,255,0.22); }

  .predict-btn {
    width: 100%; padding: 14px; border-radius: 12px; border: none;
    font-size: 16px; font-weight: 700; cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .predict-btn:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(14,165,233,0.3);
  }

  .section-divider {
    width: 56px; height: 4px; border-radius: 4px;
    background: linear-gradient(90deg,#0ea5e9,#38bdf8);
    margin: 0 auto 2rem;
  }

  input:focus, select:focus { outline: 2px solid #0ea5e9; outline-offset: 1px; }
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }

  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
    z-index: 999; animation: fadeIn 0.18s ease;
  }
  .modal-box {
    background: #fff; border-radius: 20px; padding: 2.5rem;
    max-width: 460px; width: 90%; position: relative;
    animation: popIn 0.28s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes popIn  { from{opacity:0;transform:scale(0.82)} to{opacity:1;transform:scale(1)} }
`;

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const NAV_LINKS = ["Home", "About", "Visualization", "Prediction"];

const AQI_CATEGORIES = [
  { label:"Good",        range:"0–30",    bg:"#dcfce7", border:"#86efac", text:"#15803d", badge:"#16a34a", desc:"Air quality is satisfactory. Little or no health risk." },
  { label:"Satisfactory",range:"31–60",   bg:"#fef9c3", border:"#fde047", text:"#854d0e", badge:"#ca8a04", desc:"Acceptable air quality. Slight risk for sensitive groups." },
  { label:"Moderate",    range:"61–90",   bg:"#ffedd5", border:"#fdba74", text:"#9a3412", badge:"#ea580c", desc:"Sensitive groups may experience health effects." },
  { label:"Poor",        range:"91–120",  bg:"#fee2e2", border:"#fca5a5", text:"#991b1b", badge:"#dc2626", desc:"Health effects increased for everyone." },
  { label:"Very Poor",   range:"121–250", bg:"#f3e8ff", border:"#d8b4fe", text:"#6b21a8", badge:"#9333ea", desc:"Health warning — most people will be affected." },
  { label:"Severe",      range:"250+",    bg:"#ffe4e6", border:"#fda4af", text:"#9f1239", badge:"#be123c", desc:"Emergency conditions. Everyone may experience serious effects." },
];

const MODELS = [
  { name:"🏆 Random Forest",  r2:0.5183, rmse:3.6039, mae:0.3391, time:63.35, best:true },
  { name:"Decision Tree",     r2:0.4348, rmse:3.9038, mae:0.3417, time:1.00 },
  { name:"KNN",               r2:0.3730, rmse:4.1116, mae:0.3607, time:21.88 },
  { name:"Gradient Boosting", r2:0.2334, rmse:4.5465, mae:0.6754, time:94.30 },
  { name:"Linear Regression", r2:0.0097, rmse:5.1673, mae:0.7153, time:0.17 },
];

const TECH_STACK = [
  { icon:"🐍", name:"Python",       desc:"Core Language",    color:"#dbeafe", accent:"#3b82f6" },
  { icon:"⚗️",  name:"Flask",        desc:"Web Framework",   color:"#dcfce7", accent:"#16a34a" },
  { icon:"🔬", name:"Scikit-learn", desc:"ML Library",      color:"#f3e8ff", accent:"#9333ea" },
  { icon:"🐼", name:"Pandas",       desc:"Data Processing", color:"#fef9c3", accent:"#ca8a04" },
  { icon:"📊", name:"Chart.js",     desc:"Visualization",   color:"#ffedd5", accent:"#ea580c" },
  { icon:"⚛️",  name:"React",        desc:"Frontend UI",     color:"#e0f2fe", accent:"#0284c7" },
];

const SAMPLE_DATA = [
  { state:"Andhra Pradesh",    so2:7.2,  no2:21.5, pm25:31.0 },
  { state:"Arunachal Pradesh", so2:4.4,  no2:9.9,  pm25:32.0 },
  { state:"Assam",             so2:18.9, no2:31.2, pm25:31.0 },
  { state:"Bihar",             so2:5.2,  no2:35.4, pm25:31.0 },
  { state:"Chandigarh",        so2:13.0, no2:24.5, pm25:19.0 },
  { state:"Delhi",             so2:9.4,  no2:31.2, pm25:51.0 },
  { state:"Goa",               so2:7.1,  no2:14.3, pm25:29.0 },
  { state:"Gujarat",           so2:11.8, no2:27.6, pm25:38.5 },
  { state:"Maharashtra",       so2:9.3,  no2:29.1, pm25:34.2 },
  { state:"Rajasthan",         so2:8.7,  no2:22.4, pm25:42.1 },
];

const STAT_CARDS = [
  { label:"SO2 Average",  unit:"µg/m³", value:"10.60", max:"909.00", icon:"💨", color:"#fff1f2", accent:"#f43f5e" },
  { label:"NO2 Average",  unit:"µg/m³", value:"25.67", max:"876.00", icon:"🌬️", color:"#f0fdfa", accent:"#14b8a6" },
  { label:"PM2.5 Average",unit:"µg/m³", value:"32.19", max:"504.00", icon:"☁️", color:"#eff6ff", accent:"#3b82f6" },
];

const STATES_LIST = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chandigarh",
  "Chhattisgarh","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh",
  "Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra",
  "Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal",
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getAQICategory(pm25) {
  if (pm25 <= 30)  return AQI_CATEGORIES[0];
  if (pm25 <= 60)  return AQI_CATEGORIES[1];
  if (pm25 <= 90)  return AQI_CATEGORIES[2];
  if (pm25 <= 120) return AQI_CATEGORIES[3];
  if (pm25 <= 250) return AQI_CATEGORIES[4];
  return AQI_CATEGORIES[5];
}

function mockPredict({ so2, no2, rspm, spm }) {
  const base = 0.15 * so2 + 0.22 * no2 + 0.08 * rspm + 0.04 * spm + 8.5;
  return Math.max(0, base + (Math.random() - 0.5) * 3);
}

// ─────────────────────────────────────────────
// ZOOM MODAL
// ─────────────────────────────────────────────

function ZoomModal({ data, onClose }) {
  if (!data) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position:"absolute", top:14, right:14,
          background:"#f1f5f9", border:"none", borderRadius:"50%",
          width:32, height:32, cursor:"pointer", fontSize:16, lineHeight:"32px",
        }}>✕</button>
        <div style={{ fontSize:52, textAlign:"center", marginBottom:14 }}>{data.icon}</div>
        <h2 style={{ fontFamily:"'Lora',serif", color:"#0f172a", textAlign:"center", marginBottom:6, fontSize:22 }}>
          {data.title}
        </h2>
        <p style={{ color:"#64748b", textAlign:"center", fontSize:14, marginBottom:18, lineHeight:1.6 }}>
          {data.subtitle}
        </p>
        {data.extra && (
          <div style={{ background:"#f8fafc", borderRadius:12, padding:"1rem", border:"1px solid #e2e8f0" }}>
            {data.extra.map((line, i) => (
              <div key={i} style={{
                display:"flex", justifyContent:"space-between", padding:"7px 0",
                borderTop: i > 0 ? "1px solid #f1f5f9" : "none",
              }}>
                <span style={{ color:"#64748b", fontSize:14 }}>{line.k}</span>
                <span style={{ fontWeight:700, color:"#0f172a", fontSize:14 }}>{line.v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────

function Navbar({ page, setPage }) {
  return (
    <nav style={{
      background:"#fff", borderBottom:"1px solid #e2e8f0",
      padding:"0 2.5rem", height:64,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      position:"sticky", top:0, zIndex:100,
      boxShadow:"0 2px 12px rgba(14,165,233,0.07)",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{
          width:36, height:36, borderRadius:10,
          background:"linear-gradient(135deg,#0ea5e9,#0284c7)",
          display:"flex", alignItems:"center", justifyContent:"center",
          color:"#fff", fontWeight:900, fontSize:18,
        }}>≋</div>
        <span style={{ fontFamily:"'Lora',serif", fontWeight:700, fontSize:20, color:"#0f172a" }}>
          Air<span style={{ color:"#0ea5e9" }}>Quality</span>{" "}
          <span style={{ color:"#94a3b8", fontWeight:500, fontSize:14 }}>AI</span>
        </span>
      </div>
      <div style={{ display:"flex", gap:4 }}>
        {NAV_LINKS.map((link) => (
          <button
            key={link}
            className="nav-btn"
            onClick={() => setPage(link)}
            style={{
              color: page === link ? "#0ea5e9" : "#475569",
              fontWeight: page === link ? 700 : 500,
              background: page === link ? "#e0f2fe" : "none",
            }}
          >{link}</button>
        ))}
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────

function Footer({ setPage }) {
  return (
    <footer style={{ background:"#0f172a", color:"#94a3b8", padding:"3.5rem 2.5rem 2rem" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1.5fr", gap:"2.5rem", marginBottom:"2.5rem" }}>

          {/* Brand */}
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <div style={{
                width:34, height:34, borderRadius:8,
                background:"linear-gradient(135deg,#0ea5e9,#0284c7)",
                display:"flex", alignItems:"center", justifyContent:"center",
                color:"#fff", fontWeight:900, fontSize:16,
              }}>≋</div>
              <span style={{ fontFamily:"'Lora',serif", color:"#fff", fontWeight:700, fontSize:18 }}>
                Air<span style={{ color:"#38bdf8" }}>Quality</span> AI
              </span>
            </div>
            <p style={{ fontSize:14, lineHeight:1.7, maxWidth:260 }}>
              Predicting air quality for a healthier tomorrow using advanced machine learning and real-time environmental data.
            </p>
            <div style={{ display:"flex", gap:10, marginTop:18 }}>
              {["🐙","🐦","💼"].map((icon, i) => (
                <div key={i} style={{
                  width:34, height:34, borderRadius:8,
                  background:"rgba(255,255,255,0.07)",
                  display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:16, cursor:"pointer",
                }}>{icon}</div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color:"#fff", marginBottom:16, fontSize:15, fontWeight:700 }}>Quick Links</h4>
            {NAV_LINKS.map((link) => (
              <button
                key={link}
                onClick={() => setPage(link)}
                style={{
                  display:"block", background:"none", border:"none",
                  color:"#94a3b8", fontSize:14, cursor:"pointer",
                  padding:"5px 0", fontFamily:"'Plus Jakarta Sans',sans-serif",
                  transition:"color 0.2s",
                }}
                onMouseEnter={(e) => { e.target.style.color="#38bdf8"; }}
                onMouseLeave={(e) => { e.target.style.color="#94a3b8"; }}
              >{link}</button>
            ))}
          </div>

          {/* Resources */}
          <div>
            <h4 style={{ color:"#fff", marginBottom:16, fontSize:15, fontWeight:700 }}>Resources</h4>
            {["Documentation","API Reference","Dataset Info","Privacy Policy"].map((item) => (
              <div key={item} style={{ color:"#94a3b8", fontSize:14, padding:"5px 0", cursor:"pointer" }}>
                {item}
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color:"#fff", marginBottom:16, fontSize:15, fontWeight:700 }}>Contact Us</h4>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                <span style={{ fontSize:16, marginTop:1, flexShrink:0 }}>📍</span>
                <span style={{ fontSize:14, lineHeight:1.5 }}>Surat, Gujarat, India</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:16, flexShrink:0 }}>👤</span>
                <span style={{ fontSize:14, color:"#e2e8f0", fontWeight:600 }}>Swapna</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:16, flexShrink:0 }}>📞</span>
                <a href="tel:+916300708369" style={{ fontSize:14, color:"#38bdf8", textDecoration:"none" }}>
                  +91 6300708369
                </a>
              </div>
              <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>✉️</span>
                <a
                  href="mailto:swapnakondapuram05@gmail.com"
                  style={{ fontSize:13, color:"#38bdf8", textDecoration:"none", wordBreak:"break-all", lineHeight:1.5 }}
                >
                  swapnakondapuram05@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:"1.5rem", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
          <p style={{ fontSize:13 }}>© 2025 AirQuality AI · Crafted with ❤️ in Surat, Gujarat</p>
          <p style={{ fontSize:13 }}>Powered by Random Forest ML · React + Flask</p>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────

function HomePage({ setPage }) {
  const [modal, setModal] = useState(null);

  const featureCards = [
    {
      icon:"🎯", title:"High Accuracy", color:"#eff6ff", accent:"#3b82f6",
      subtitle:"Random Forest model with R² of 0.5183 and cross-validation 0.4912.",
      extra:[{k:"R² Score",v:"0.5183"},{k:"CV Score",v:"0.4912"},{k:"RMSE",v:"3.6039"}],
    },
    {
      icon:"🌍", title:"India-wide Coverage", color:"#f0fdf4", accent:"#22c55e",
      subtitle:"Data from 30+ states — industrial, residential and rural zones.",
      extra:[{k:"States covered",v:"30+"},{k:"Area types",v:"3"},{k:"Data source",v:"Historical AQI"}],
    },
    {
      icon:"⚡", title:"Real-time Prediction", color:"#fff7ed", accent:"#f97316",
      subtitle:"Instant PM2.5 forecast with AQI classification and health guidance.",
      extra:[{k:"Response time",v:"< 1 sec"},{k:"AQI levels",v:"6 categories"},{k:"Input features",v:"8"}],
    },
    {
      icon:"🧬", title:"Pollutant Analysis", color:"#fdf4ff", accent:"#a855f7",
      subtitle:"Tracks SO2, NO2, RSPM and SPM alongside meteorological inputs.",
      extra:[{k:"Pollutants",v:"SO2, NO2, RSPM, SPM"},{k:"Time features",v:"Year, Month"},{k:"Geo features",v:"State, Area Type"}],
    },
    {
      icon:"📊", title:"Visual Dashboard", color:"#f0fdfa", accent:"#14b8a6",
      subtitle:"Interactive bar charts, tables and CSV upload support.",
      extra:[{k:"Chart types",v:"Bar, Table"},{k:"CSV upload",v:"Up to 5 files"},{k:"States shown",v:"Top 10"}],
    },
    {
      icon:"🛡️", title:"Health Alerts", color:"#fff1f2", accent:"#f43f5e",
      subtitle:"Colour-coded AQI warnings from Good to Severe with health guidance.",
      extra:[{k:"Alert levels",v:"6"},{k:"Good range",v:"0–30 µg/m³"},{k:"Severe range",v:"250+ µg/m³"}],
    },
  ];

  return (
    <div>
      {modal && <ZoomModal data={modal} onClose={() => setModal(null)} />}

      {/* Hero */}
      <div style={{
        background:"linear-gradient(135deg,#0c4a6e 0%,#0369a1 55%,#0ea5e9 100%)",
        padding:"6rem 2rem 5rem", textAlign:"center", color:"#fff",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute",top:-80,right:-80,width:320,height:320,borderRadius:"50%",background:"rgba(255,255,255,0.04)" }} />
        <div style={{ position:"absolute",bottom:-60,left:-60,width:240,height:240,borderRadius:"50%",background:"rgba(255,255,255,0.05)" }} />

        <div style={{
          display:"inline-block", background:"rgba(255,255,255,0.12)",
          border:"1px solid rgba(255,255,255,0.3)", borderRadius:50,
          padding:"6px 20px", fontSize:13, color:"#bae6fd",
          marginBottom:24, fontWeight:700,
        }}>
          🌿 India's PM2.5 Prediction Platform
        </div>

        <h1 style={{ fontSize:52, fontWeight:800, margin:"0 0 1.2rem", lineHeight:1.15, fontFamily:"'Lora',serif" }}>
          Breathe Smarter with<br />
          <span style={{ color:"#7dd3fc" }}>AI-Powered Air Quality</span>
        </h1>
        <p style={{ fontSize:18, color:"#bae6fd", maxWidth:580, margin:"0 auto 2.5rem", lineHeight:1.7 }}>
          Forecast PM2.5 concentrations across India using Random Forest regression
          trained on years of environmental monitoring data.
        </p>
        <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
          <button className="cta-primary" onClick={() => setPage("Prediction")}>🔮 Predict PM2.5</button>
          <button className="cta-outline" onClick={() => setPage("Visualization")}>📊 Explore Data</button>
        </div>

        <div style={{ display:"flex", gap:"1rem", justifyContent:"center", marginTop:"3rem", flexWrap:"wrap" }}>
          {[["0.5183","R² Score"],["3.6039","RMSE"],["0.3391","MAE"],["5","ML Models"]].map(([v, l]) => (
            <div key={l} style={{
              background:"rgba(255,255,255,0.12)",
              border:"1px solid rgba(255,255,255,0.2)",
              borderRadius:16, padding:"12px 24px", textAlign:"center",
            }}>
              <div style={{ fontSize:26, fontWeight:800, color:"#fff" }}>{v}</div>
              <div style={{ fontSize:12, color:"#bae6fd", marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature cards */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"4rem 2rem" }}>
        <div style={{ textAlign:"center", marginBottom:6 }}>
          <span style={{ background:"#e0f2fe", color:"#0284c7", fontSize:12, fontWeight:700, padding:"4px 14px", borderRadius:50, letterSpacing:"0.05em" }}>
            FEATURES
          </span>
        </div>
        <h2 style={{ textAlign:"center", fontFamily:"'Lora',serif", fontSize:32, color:"#0f172a", margin:"10px 0 4px" }}>
          Why Choose AirQuality AI?
        </h2>
        <p style={{ textAlign:"center", color:"#64748b", marginBottom:"2.5rem", fontSize:14 }}>
          Click any card to learn more
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.5rem" }}>
          {featureCards.map((card) => (
            <div
              key={card.title}
              className="zoom-card"
              onClick={() => setModal(card)}
              style={{
                background:card.color, borderRadius:16, padding:"1.75rem",
                border:`1.5px solid ${card.accent}22`,
              }}
            >
              <div style={{
                width:52, height:52, borderRadius:14, background:"#fff",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:26, marginBottom:14, boxShadow:`0 4px 12px ${card.accent}22`,
              }}>{card.icon}</div>
              <h3 style={{ color:"#0f172a", fontWeight:700, fontSize:17, marginBottom:8 }}>{card.title}</h3>
              <p style={{ color:"#475569", fontSize:14, lineHeight:1.6, margin:"0 0 12px" }}>{card.subtitle}</p>
              <span style={{ fontSize:12, color:card.accent, fontWeight:700 }}>Tap to explore →</span>
            </div>
          ))}
        </div>
      </div>

      {/* AQI Quick Guide */}
      <div style={{ background:"#fff", padding:"3.5rem 2rem" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <h2 style={{ textAlign:"center", fontFamily:"'Lora',serif", fontSize:28, color:"#0f172a", marginBottom:6 }}>
            AQI Quick Reference
          </h2>
          <div className="section-divider" />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"1rem" }}>
            {AQI_CATEGORIES.map((cat) => (
              <div
                key={cat.label}
                className="zoom-card"
                style={{
                  background:cat.bg, border:`1.5px solid ${cat.border}`,
                  borderRadius:14, padding:"1.25rem", textAlign:"center",
                }}
              >
                <div style={{
                  background:cat.badge, color:"#fff",
                  fontSize:11, fontWeight:700, padding:"3px 8px",
                  borderRadius:50, display:"inline-block", marginBottom:8,
                }}>{cat.range}</div>
                <div style={{ color:cat.text, fontWeight:700, fontSize:14 }}>{cat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ABOUT PAGE
// ─────────────────────────────────────────────

function AboutPage() {
  const [modal, setModal] = useState(null);

  return (
    <div style={{ background:"#f8fafc" }}>
      {modal && <ZoomModal data={modal} onClose={() => setModal(null)} />}

      <div style={{ background:"linear-gradient(135deg,#0c4a6e,#0369a1)", padding:"4.5rem 2rem", textAlign:"center", color:"#fff" }}>
        <span style={{ background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.25)", borderRadius:50, padding:"5px 18px", fontSize:12, fontWeight:700, color:"#bae6fd", letterSpacing:"0.05em" }}>
          ABOUT THE PROJECT
        </span>
        <h1 style={{ fontFamily:"'Lora',serif", fontSize:40, fontWeight:800, margin:"16px 0 10px" }}>How It Works</h1>
        <p style={{ color:"#bae6fd", fontSize:16, maxWidth:520, margin:"0 auto" }}>
          A deep dive into the machine learning approach powering India's air quality predictions.
        </p>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"3.5rem 2rem" }}>

        {/* Intro */}
        <div style={{ display:"grid", gridTemplateColumns:"3fr 2fr", gap:"2.5rem", marginBottom:"4rem", alignItems:"center" }}>
          <div>
            <span style={{ background:"#dbeafe", color:"#1d4ed8", fontSize:12, fontWeight:700, padding:"4px 14px", borderRadius:50 }}>OVERVIEW</span>
            <h2 style={{ fontFamily:"'Lora',serif", fontSize:28, color:"#0f172a", margin:"14px 0 16px" }}>What is This Project?</h2>
            <p style={{ color:"#475569", lineHeight:1.8, marginBottom:14 }}>
              The India Air Quality Prediction system is an advanced machine learning application designed to forecast
              <strong> PM2.5</strong> (Particulate Matter 2.5) levels based on environmental pollutants,
              trained on historical data from across India.
            </p>
            <p style={{ color:"#475569", lineHeight:1.8 }}>
              PM2.5 particles (≤ 2.5 microns) penetrate deep into lungs and enter the bloodstream, posing severe
              long-term health risks. Early prediction enables timely public health action.
            </p>
          </div>
          <div style={{ background:"linear-gradient(135deg,#0ea5e9,#0284c7)", borderRadius:20, padding:"2.5rem", textAlign:"center", color:"#fff" }}>
            <div style={{ fontSize:56 }}>🫁</div>
            <h3 style={{ fontFamily:"'Lora',serif", fontSize:22, margin:"14px 0 8px" }}>Health Impact</h3>
            <p style={{ fontSize:14, color:"#bae6fd", lineHeight:1.6 }}>
              PM2.5 monitoring is critical to protecting millions from respiratory and cardiovascular disease.
            </p>
          </div>
        </div>

        {/* ML Cards */}
        <h2 style={{ textAlign:"center", fontFamily:"'Lora',serif", fontSize:28, color:"#0f172a", marginBottom:6 }}>Machine Learning Model</h2>
        <div className="section-divider" />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.5rem", marginBottom:"4rem" }}>
          {[
            { icon:"🤖", title:"Algorithm",     name:"Random Forest Regressor", color:"#eff6ff", accent:"#3b82f6",
              extra:[{k:"Trees",v:"100"},{k:"Max depth",v:"Auto"},{k:"Type",v:"Ensemble"}] },
            { icon:"📈", title:"Performance",   name:"R² Score: 0.5183",         color:"#f0fdf4", accent:"#22c55e",
              extra:[{k:"R² Score",v:"0.5183"},{k:"RMSE",v:"3.6039"},{k:"MAE",v:"0.3391"},{k:"CV Score",v:"0.4912"}] },
            { icon:"🗂️", title:"Features Used", name:"8 Input Features",          color:"#fdf4ff", accent:"#a855f7",
              extra:[{k:"Pollutants",v:"SO2, NO2, RSPM, SPM"},{k:"Time",v:"Year, Month"},{k:"Location",v:"State, Area Type"}] },
          ].map((card) => (
            <div
              key={card.title}
              className="zoom-card"
              onClick={() => setModal(card)}
              style={{ background:card.color, borderRadius:16, padding:"1.75rem", border:`1.5px solid ${card.accent}22` }}
            >
              <div style={{ width:50,height:50,borderRadius:12,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,marginBottom:14,boxShadow:`0 4px 10px ${card.accent}22` }}>{card.icon}</div>
              <h3 style={{ color:"#0f172a", fontWeight:700, marginBottom:6 }}>{card.title}</h3>
              <p style={{ fontWeight:700, color:card.accent, marginBottom:6, fontSize:15 }}>{card.name}</p>
              <p style={{ color:"#64748b", fontSize:13 }}>Click to see details →</p>
            </div>
          ))}
        </div>

        {/* Algorithm table */}
        <h2 style={{ textAlign:"center", fontFamily:"'Lora',serif", fontSize:28, color:"#0f172a", marginBottom:6 }}>Algorithm Comparison</h2>
        <div className="section-divider" />
        <div style={{ background:"#fff", borderRadius:16, overflow:"hidden", border:"1px solid #e2e8f0", marginBottom:"4rem", boxShadow:"0 4px 20px rgba(0,0,0,0.04)" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"linear-gradient(90deg,#0c4a6e,#0369a1)" }}>
                {["Model","R² Score","RMSE","MAE","Train Time (s)"].map((h) => (
                  <th key={h} style={{ padding:"14px 16px", textAlign:"left", color:"#fff", fontWeight:600, fontSize:14 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODELS.map((m, i) => (
                <tr key={m.name} style={{ background:m.best?"#eff6ff":i%2===0?"#f8fafc":"#fff", borderTop:"1px solid #f1f5f9" }}>
                  <td style={{ padding:"12px 16px", fontWeight:m.best?700:500, color:m.best?"#1d4ed8":"#334155" }}>{m.name}</td>
                  <td style={{ padding:"12px 16px", fontWeight:m.best?700:400, color:m.best?"#1d4ed8":"#334155" }}>{m.r2}</td>
                  <td style={{ padding:"12px 16px", fontWeight:m.best?700:400, color:m.best?"#1d4ed8":"#334155" }}>{m.rmse}</td>
                  <td style={{ padding:"12px 16px", fontWeight:m.best?700:400, color:m.best?"#1d4ed8":"#334155" }}>{m.mae}</td>
                  <td style={{ padding:"12px 16px", fontWeight:m.best?700:400, color:m.best?"#1d4ed8":"#334155" }}>{m.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tech stack */}
        <h2 style={{ textAlign:"center", fontFamily:"'Lora',serif", fontSize:28, color:"#0f172a", marginBottom:6 }}>Tech Stack</h2>
        <div className="section-divider" />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"1.25rem", marginBottom:"4rem" }}>
          {TECH_STACK.map((tech) => (
            <div
              key={tech.name}
              className="zoom-card"
              style={{ background:tech.color, borderRadius:16, padding:"1.5rem", textAlign:"center", border:`1.5px solid ${tech.accent}22` }}
            >
              <div style={{ fontSize:40, marginBottom:10 }}>{tech.icon}</div>
              <p style={{ fontWeight:700, color:tech.accent, margin:"0 0 4px", fontSize:15 }}>{tech.name}</p>
              <p style={{ fontSize:12, color:"#64748b", margin:0 }}>{tech.desc}</p>
            </div>
          ))}
        </div>

        {/* AQI categories */}
        <h2 style={{ textAlign:"center", fontFamily:"'Lora',serif", fontSize:28, color:"#0f172a", marginBottom:6 }}>AQI Categories</h2>
        <div className="section-divider" />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.25rem" }}>
          {AQI_CATEGORIES.map((cat) => (
            <div
              key={cat.label}
              className="zoom-card"
              style={{ background:cat.bg, border:`1.5px solid ${cat.border}`, borderRadius:16, padding:"1.5rem" }}
            >
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ color:cat.text, fontWeight:800, fontSize:17 }}>{cat.label}</span>
                <span style={{ background:cat.badge, color:"#fff", padding:"3px 10px", borderRadius:50, fontSize:12, fontWeight:700 }}>{cat.range}</span>
              </div>
              <p style={{ fontSize:13, color:cat.text, margin:0, opacity:0.85, lineHeight:1.6 }}>{cat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// BAR CHART
// ─────────────────────────────────────────────

function BarChart({ data }) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.so2, d.no2, d.pm25)));
  const chartH = 220;
  const barW = 14;
  const gap = 4;
  const groupW = barW * 3 + gap * 2 + 24;

  return (
    <div style={{ overflowX:"auto" }}>
      <svg width={data.length * groupW + 60} height={chartH + 80} style={{ display:"block" }}>
        {[0,20,40,60].map((v) => (
          <g key={v}>
            <line x1={40} x2={data.length*groupW+50}
              y1={chartH-(v/maxVal)*chartH+10} y2={chartH-(v/maxVal)*chartH+10}
              stroke="#e2e8f0" strokeWidth={1} strokeDasharray="4,3" />
            <text x={36} y={chartH-(v/maxVal)*chartH+14} textAnchor="end" fontSize={11} fill="#94a3b8">{v}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = i * groupW + 50;
          return (
            <g key={d.state}>
              {[["so2","#f87171"],["no2","#34d399"],["pm25","#60a5fa"]].map(([key, color], j) => {
                const h = (d[key] / maxVal) * chartH;
                return (
                  <rect key={key} x={x+j*(barW+gap)} y={chartH-h+10}
                    width={barW} height={h} fill={color} rx={4} opacity={0.88} />
                );
              })}
              <text x={x+barW*1.5+gap} y={chartH+30}
                textAnchor="middle" fontSize={10} fill="#64748b"
                transform={`rotate(-35,${x+barW*1.5+gap},${chartH+30})`}>
                {d.state.length > 10 ? d.state.slice(0,10)+"…" : d.state}
              </text>
            </g>
          );
        })}
        {[["SO2 (µg/m³)","#f87171"],["NO2 (µg/m³)","#34d399"],["PM2.5 (µg/m³)","#60a5fa"]].map(([label, color], i) => (
          <g key={label} transform={`translate(${50+i*110},${chartH+62})`}>
            <rect width={12} height={12} fill={color} rx={3} />
            <text x={16} y={11} fontSize={11} fill="#64748b">{label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────
// VISUALIZATION PAGE
// ─────────────────────────────────────────────

function VisualizationPage() {
  const [tableData, setTableData] = useState(SAMPLE_DATA);
  const [fileNames, setFileNames] = useState([]);
  const [modal, setModal]         = useState(null);
  const fileRef = useRef();

  function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    setFileNames(files.map((f) => f.name));
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const lines   = ev.target.result.split("\n").filter(Boolean);
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
        const parsed  = lines.slice(1).map((line) => {
          const cols = line.split(",");
          const row  = {};
          headers.forEach((h, idx) => { row[h] = cols[idx]?.trim(); });
          return row;
        }).filter((r) => r.state);
        if (parsed.length > 0) setTableData((prev) => [...prev, ...parsed.slice(0,5)]);
      };
      reader.readAsText(file);
    });
  }

  return (
    <div style={{ background:"#f8fafc", minHeight:"100vh" }}>
      {modal && <ZoomModal data={modal} onClose={() => setModal(null)} />}

      <div style={{ background:"linear-gradient(135deg,#0c4a6e,#0369a1)", padding:"3.5rem 2rem", textAlign:"center", color:"#fff" }}>
        <span style={{ background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.25)", borderRadius:50, padding:"5px 18px", fontSize:12, fontWeight:700, color:"#bae6fd", letterSpacing:"0.05em" }}>
          DATA INSIGHTS
        </span>
        <h1 style={{ fontFamily:"'Lora',serif", fontSize:36, fontWeight:800, margin:"16px 0 8px" }}>Data Visualization</h1>
        <p style={{ color:"#bae6fd", fontSize:15 }}>Interactive charts and analytics for Indian air quality data</p>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"2.5rem 2rem" }}>

        {/* Upload */}
        <div style={{
          background:"#fff", borderRadius:16, padding:"2rem",
          border:"2px dashed #bae6fd", marginBottom:"2rem", textAlign:"center",
          boxShadow:"0 4px 20px rgba(14,165,233,0.06)",
        }}>
          <div style={{ fontSize:36, marginBottom:10 }}>📂</div>
          <p style={{ color:"#0f172a", fontWeight:600, marginBottom:4 }}>Upload your CSV location files</p>
          <p style={{ color:"#64748b", fontSize:13, marginBottom:16 }}>Supports up to 5 CSV files · Columns: state, so2, no2, pm25</p>
          <input ref={fileRef} type="file" accept=".csv" multiple onChange={handleFileUpload} style={{ display:"none" }} />
          <button className="cta-primary" onClick={() => fileRef.current.click()}>Choose CSV Files</button>
          {fileNames.length > 0 && (
            <div style={{ marginTop:14, display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
              {fileNames.map((name) => (
                <span key={name} style={{ background:"#e0f2fe", color:"#0284c7", fontSize:12, padding:"4px 14px", borderRadius:50, fontWeight:600 }}>
                  ✓ {name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stat cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.5rem", marginBottom:"2rem" }}>
          {STAT_CARDS.map((stat) => (
            <div
              key={stat.label}
              className="zoom-card"
              onClick={() => setModal({ icon:stat.icon, title:stat.label, subtitle:`Average concentration across all monitored stations in India.`, extra:[{k:"Average",v:`${stat.value} ${stat.unit}`},{k:"Maximum recorded",v:`${stat.max} ${stat.unit}`}] })}
              style={{ background:stat.color, borderRadius:16, padding:"1.5rem", border:`1.5px solid ${stat.accent}22`, display:"flex", alignItems:"center", gap:16 }}
            >
              <div style={{ width:56,height:56,borderRadius:14,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0,boxShadow:`0 4px 14px ${stat.accent}22` }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize:30, fontWeight:800, color:"#0f172a" }}>{stat.value}</div>
                <div style={{ fontSize:13, color:"#475569", fontWeight:500 }}>{stat.label}</div>
                <div style={{ fontSize:12, color:"#94a3b8" }}>Max: {stat.max}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart card */}
        <div style={{ background:"#fff", borderRadius:16, padding:"1.75rem", border:"1px solid #e2e8f0", marginBottom:"2rem", boxShadow:"0 4px 20px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
            <span style={{ fontSize:22 }}>🗺️</span>
            <h3 style={{ color:"#0f172a", fontWeight:700, fontSize:18 }}>Top 10 States by Pollution Levels</h3>
          </div>
          <p style={{ color:"#64748b", fontSize:14, marginBottom:"1.25rem" }}>Average pollutant concentrations (µg/m³) across Indian states</p>
          <BarChart data={tableData.slice(0,10)} />
        </div>

        {/* Table */}
        <div style={{ background:"#fff", borderRadius:16, padding:"1.75rem", border:"1px solid #e2e8f0", boxShadow:"0 4px 20px rgba(0,0,0,0.04)" }}>
          <h3 style={{ color:"#0f172a", fontWeight:700, marginBottom:"1.25rem", fontSize:18 }}>📋 State-wise PM2.5 Summary</h3>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
            <thead>
              <tr style={{ background:"#f1f5f9" }}>
                {["State","SO2 (µg/m³)","NO2 (µg/m³)","PM2.5 (µg/m³)","AQI Category"].map((h) => (
                  <th key={h} style={{ padding:"10px 14px", textAlign:"left", color:"#475569", fontWeight:600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.slice(0,10).map((row, i) => {
                const cat = getAQICategory(row.pm25);
                return (
                  <tr key={row.state+i} style={{ borderTop:"1px solid #f1f5f9", background:i%2===0?"#fff":"#f8fafc" }}>
                    <td style={{ padding:"10px 14px", fontWeight:600, color:"#0f172a" }}>{row.state}</td>
                    <td style={{ padding:"10px 14px", color:"#475569" }}>{Number(row.so2).toFixed(2)}</td>
                    <td style={{ padding:"10px 14px", color:"#475569" }}>{Number(row.no2).toFixed(2)}</td>
                    <td style={{ padding:"10px 14px", color:"#475569" }}>{Number(row.pm25).toFixed(2)}</td>
                    <td style={{ padding:"10px 14px" }}>
                      <span style={{ background:cat.badge, color:"#fff", padding:"4px 12px", borderRadius:50, fontSize:12, fontWeight:700 }}>{cat.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PREDICTION PAGE
// ─────────────────────────────────────────────

function PredictionPage() {
  const [inputs, setInputs] = useState({
    so2: "", no2: "", pm10: "", co: "", o3: "",
    temperature: "", relativehumidity: "", wind_speed: "", PS: "", AOD: "",
    hour: new Date().getHours(),
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
    location: "loc1"
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(key, value) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  // 🔥 REAL API CALL
  async function handlePredict() {
    setLoading(true);

    try {
      const response = await fetch("https://isro-bah-2025-5.onrender.com/predict"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location: inputs.location,

          so2: Number(inputs.so2),
          no2: Number(inputs.no2),
          pm10: Number(inputs.pm10),
          co: Number(inputs.co),
          o3: Number(inputs.o3),

          temperature: Number(inputs.temperature),
          relativehumidity: Number(inputs.relativehumidity),
          wind_speed: Number(inputs.wind_speed),
          PS: Number(inputs.PS),
          AOD: Number(inputs.AOD),

          hour: Number(inputs.hour),
          day: Number(inputs.day),
          month: Number(inputs.month),

          // lag (dummy for now — backend will improve later)
          pm25_lag1: 30,
          pm25_lag2: 28,
          pm25_roll3: 29,
          pm25_roll6: 31
        }),
      });

      const data = await response.json();
      console.log("Response:", data);

      alert("Prediction success!");
  } catch (error) {
    console.error("Error:", error);
    alert("Actual error: " + error.message);
  }
};
      if (data.error) {
        alert(data.error);
      } else {
        const pm25Val = data.pm25_prediction;
        const cat = getAQICategory(pm25Val);

        setResult({
          pm25: pm25Val.toFixed(2),
          cat,
          location: data.location,
          ts: new Date().toLocaleTimeString()
        });
      }

    } catch (err) {
      console.error(err);
      alert("Backend not connected!");
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🔮 Predict PM2.5</h2>

      {/* LOCATION */}
      <select
        value={inputs.location}
        onChange={(e) => handleChange("location", e.target.value)}
      >
        <option value="loc1">Delhi</option>
        <option value="loc2">Ahmedabad</option>
        <option value="loc3">Surat</option>
        <option value="loc4">Hyderabad</option>
        
      </select>

      {/* INPUTS */}
      {["so2","no2","pm10","co","o3","temperature","relativehumidity","wind_speed","PS","AOD"]
        .map((field) => (
        <input
          key={field}
          placeholder={field}
          type="number"
          value={inputs[field]}
          onChange={(e) => handleChange(field, e.target.value)}
          style={{ display: "block", margin: "8px 0", padding: "8px" }}
        />
      ))}

      <button onClick={handlePredict} disabled={loading}>
        {loading ? "Predicting..." : "Predict"}
      </button>

      {/* RESULT */}
      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>PM2.5: {result.pm25}</h3>
          <h4>{result.cat.label}</h4>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT COMPONENT
// ─────────────────────────────────────────────

function AirQuality() {
  const [page, setPage] = useState("Home");

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", minHeight:"100vh", background:"#f0f4f8" }}>
      <style>{GLOBAL_CSS}</style>
      <Navbar page={page} setPage={setPage} />
      {page === "Home"          && <HomePage          setPage={setPage} />}
      {page === "About"         && <AboutPage />}
      {page === "Visualization" && <VisualizationPage />}
      {page === "Prediction"    && <PredictionPage />}
      <Footer setPage={setPage} />
    </div>
  );
}

export default AirQuality;
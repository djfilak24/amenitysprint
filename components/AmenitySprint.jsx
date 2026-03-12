"use client";

import { useState, useEffect, useRef } from "react";
import { getAllProjects } from "@/lib/projects";

const NoiseOverlay = () => (
  <div style={{ position:'fixed', inset:0, zIndex:9999, pointerEvents:'none', opacity:0.025 }}>
    <svg width="100%" height="100%">
      <filter id="noise"><feTurbulence baseFrequency="0.65" numOctaves="4" stitchTiles="stitch"/></filter>
      <rect width="100%" height="100%" filter="url(#noise)"/>
    </svg>
  </div>
);

const useScrollReveal = (threshold = 0.1) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

const useIsMobile = () => {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
};

// Charcoal palette — warmer, lighter than pure black
const C = {
  bg:     "#1e2022",          // base page dark bg
  bgHero: "linear-gradient(150deg, #252729 0%, #1e2022 45%, #191b1d 100%)",
  bgSection: "linear-gradient(160deg, #242628 0%, #1e2022 60%, #1c1e20 100%)",
  bgFooter: "#191b1d",
  border: "rgba(255,255,255,0.09)",
  textDim: "rgba(255,255,255,0.38)",
};

const ImgPlaceholder = ({ label, aspectRatio = "16/9", style = {} }) => (
  <div style={{
    width:"100%", aspectRatio,
    background:"linear-gradient(145deg,#282a2c 0%,#1e2022 60%,#252729 100%)",
    borderRadius:"1.5rem", display:"flex",
    alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", ...style
  }}>
    <div style={{ position:"absolute", inset:0,
      backgroundImage:"linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)",
      backgroundSize:"28px 28px" }}/>
    {[0,1,2,3].map(c => (
      <div key={c} style={{
        position:"absolute",
        top: c < 2 ? 14 : "auto", bottom: c >= 2 ? 14 : "auto",
        left: c % 2 === 0 ? 14 : "auto", right: c % 2 === 1 ? 14 : "auto",
        width:18, height:18,
        borderTop: c < 2 ? "1.5px solid rgba(0,186,220,0.5)" : "none",
        borderBottom: c >= 2 ? "1.5px solid rgba(0,186,220,0.5)" : "none",
        borderLeft: c % 2 === 0 ? "1.5px solid rgba(0,186,220,0.5)" : "none",
        borderRight: c % 2 === 1 ? "1.5px solid rgba(0,186,220,0.5)" : "none",
      }}/>
    ))}
    <div style={{ position:"relative", zIndex:1, fontFamily:"'Poppins',sans-serif", fontSize:"0.58rem",
      fontWeight:500, letterSpacing:"0.18em", textTransform:"uppercase",
      color:"rgba(255,255,255,0.22)", textAlign:"center", padding:"0 1.5rem" }}>
      {label}
    </div>
  </div>
);

// ── CARD 1: DIAGNOSE — Scanning analysis animation ───────────────────────────
const DiagnoseCard = ({ active }) => {
  const metrics = [
    { label:"Vacancy Rate", value:34, unit:"%", status:"critical" },
    { label:"Amenity Score", value:2.1, unit:"/10", status:"low" },
    { label:"Broker Interest", value:12, unit:" leads", status:"low" },
    { label:"Market Position", value:"B–", unit:"", status:"warn" },
  ];
  const [scanLine, setScanLine] = useState(0);
  const [revealed, setRevealed] = useState([false,false,false,false]);

  useEffect(() => {
    if (!active) return;
    let i = 0;
    const t = setInterval(() => {
      setScanLine(i);
      setRevealed(prev => { const n=[...prev]; n[i]=true; return n; });
      i++;
      if (i >= metrics.length) { i = 0; setRevealed([false,false,false,false]); }
    }, 700);
    return () => clearInterval(t);
  }, [active]);

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", gap:"0.75rem" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.25rem" }}>
        <div style={{ width:7, height:7, borderRadius:"50%", background:"#00BADC",
          animation: active ? "pulseDot 1.4s infinite" : "none" }}/>
        <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.58rem", fontWeight:600,
          letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(255,255,255,0.35)" }}>
          Building Scan · Active
        </span>
      </div>
      {/* Metrics */}
      {metrics.map((m, i) => (
        <div key={i} style={{
          background:"rgba(255,255,255,0.04)",
          border:`1px solid ${revealed[i] ? (m.status==="critical" ? "rgba(255,100,80,0.4)" : m.status==="low" ? "rgba(255,180,60,0.3)" : "rgba(0,186,220,0.3)") : "rgba(255,255,255,0.07)"}`,
          borderRadius:"0.4rem",
          padding:"0.6rem 0.9rem",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          transition:"all 0.4s ease",
          transform: revealed[i] ? "translateX(0)" : "translateX(-6px)",
          opacity: revealed[i] ? 1 : 0.25,
        }}>
          <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.72rem", fontWeight:400, color:"rgba(255,255,255,0.5)" }}>{m.label}</span>
          <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.82rem", fontWeight:700,
            color: m.status==="critical" ? "#ff6450" : m.status==="low" ? "#ffb43c" : "#00BADC" }}>
            {m.value}{m.unit}
          </span>
        </div>
      ))}
      {/* Scan progress bar */}
      <div style={{ marginTop:"auto", height:2, background:"rgba(255,255,255,0.07)", borderRadius:1 }}>
        <div style={{
          height:"100%", background:"#00BADC", borderRadius:1,
          width:`${((scanLine + 1) / metrics.length) * 100}%`,
          transition:"width 0.5s ease",
          boxShadow:"0 0 8px rgba(0,186,220,0.6)"
        }}/>
      </div>
      <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem", fontWeight:400, color:"rgba(255,255,255,0.2)" }}>
        Analyzing competitive position &amp; leasing drivers
      </div>
    </div>
  );
};

// ── CARD 2: PROGRAM — Amenity matrix builder ─────────────────────────────────
const ProgramCard = ({ active }) => {
  const amenities = [
    { name:"Roof Deck", cost:"M", value:"H", selected:false },
    { name:"Tenant Lounge", cost:"S", value:"H", selected:false },
    { name:"Fitness Center", cost:"M", value:"M", selected:false },
    { name:"Conference Center", cost:"L", value:"H", selected:false },
    { name:"Coffee / F&B", cost:"M", value:"H", selected:false },
    { name:"Green Wall", cost:"S", value:"M", selected:false },
  ];
  const [items, setItems] = useState(amenities.map(a=>({...a})));
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) { setItems(amenities.map(a=>({...a}))); setStep(0); return; }
    // Sequence: select items one by one, then reset
    const sequence = [0,1,3,4,2,5]; // order of selection
    let idx = 0;
    const t = setInterval(() => {
      if (idx < sequence.length) {
        const target = sequence[idx];
        setItems(prev => prev.map((item, i) => i===target ? {...item, selected:true} : item));
        setStep(idx+1);
        idx++;
      } else {
        idx = 0;
        setItems(amenities.map(a=>({...a})));
        setStep(0);
      }
    }, 650);
    return () => clearInterval(t);
  }, [active]);

  const costColor = c => c==="S"?"#22c55e":c==="M"?"#00BADC":"#FF7F40";

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", gap:"0.5rem" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.25rem" }}>
        <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.58rem", fontWeight:600,
          letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(255,255,255,0.35)" }}>
          Amenity Matrix · Building
        </span>
        <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem", fontWeight:700, color:"#00BADC" }}>
          {step} selected
        </span>
      </div>
      {/* Column headers */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr auto auto", gap:"0.5rem",
        paddingBottom:"0.4rem", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.56rem", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.2)" }}>Amenity</span>
        <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.56rem", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.2)", textAlign:"center", width:28 }}>Cost</span>
        <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.56rem", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.2)", textAlign:"center", width:28 }}>Val</span>
      </div>
      {items.map((a, i) => (
        <div key={i} style={{
          display:"grid", gridTemplateColumns:"1fr auto auto", gap:"0.5rem",
          alignItems:"center", padding:"0.45rem 0.6rem",
          background: a.selected ? "rgba(0,186,220,0.1)" : "rgba(255,255,255,0.03)",
          border:`1px solid ${a.selected ? "rgba(0,186,220,0.35)" : "rgba(255,255,255,0.06)"}`,
          borderRadius:"0.3rem",
          transition:"all 0.35s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
            <div style={{ width:5, height:5, borderRadius:"50%",
              background: a.selected ? "#00BADC" : "rgba(255,255,255,0.15)",
              transition:"background 0.3s",
              boxShadow: a.selected ? "0 0 6px rgba(0,186,220,0.7)" : "none"
            }}/>
            <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.72rem", fontWeight: a.selected ? 600 : 400,
              color: a.selected ? "#fff" : "rgba(255,255,255,0.45)", transition:"all 0.3s" }}>{a.name}</span>
          </div>
          <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.65rem", fontWeight:700,
            color:costColor(a.cost), textAlign:"center", width:28 }}>{a.cost}</span>
          <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.65rem", fontWeight:700,
            color:a.value==="H"?"#22c55e":"#ffb43c", textAlign:"center", width:28 }}>{a.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── CARD 3: VISUALIZE — Layered floor plan reveal ────────────────────────────
const VisualizeCard = ({ active }) => {
  const layers = [
    { id:"shell", label:"Building Shell", color:"rgba(255,255,255,0.12)" },
    { id:"zones", label:"Zone Layout", color:"rgba(0,186,220,0.2)" },
    { id:"program", label:"Programming", color:"rgba(255,127,64,0.25)" },
    { id:"finish", label:"Design Language", color:"rgba(24,152,139,0.3)" },
  ];
  const [activeLayer, setActiveLayer] = useState(0);

  useEffect(() => {
    if (!active) { setActiveLayer(0); return; }
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % layers.length;
      setActiveLayer(i);
    }, 1100);
    return () => clearInterval(t);
  }, [active]);

  // Simple floor plan SVG shapes per layer
  const layerShapes = [
    // Shell — outer walls
    <g key="shell">
      <rect x="20" y="20" width="160" height="110" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
      <rect x="20" y="20" width="60" height="110" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 3"/>
      <rect x="110" y="20" width="70" height="50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 3"/>
    </g>,
    // Zones — colored fills
    <g key="zones">
      <rect x="22" y="22" width="56" height="106" fill="rgba(0,186,220,0.15)" stroke="rgba(0,186,220,0.4)" strokeWidth="1"/>
      <rect x="80" y="22" width="98" height="46" fill="rgba(255,127,64,0.12)" stroke="rgba(255,127,64,0.35)" strokeWidth="1"/>
      <rect x="80" y="70" width="98" height="58" fill="rgba(24,152,139,0.12)" stroke="rgba(24,152,139,0.35)" strokeWidth="1"/>
    </g>,
    // Program — furniture dots
    <g key="program">
      {[[38,55],[38,75],[38,95],[95,42],[115,42],[135,42],[95,88],[115,88],[155,88],[155,72],[135,72]].map(([cx,cy],i)=>(
        <circle key={i} cx={cx} cy={cy} r="5" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5"/>
      ))}
      <rect x="86" y="98" width="44" height="22" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" rx="2"/>
    </g>,
    // Design language — material hatches
    <g key="finish">
      <rect x="22" y="22" width="56" height="106" fill="url(#hatch1)" opacity="0.6"/>
      <rect x="80" y="22" width="98" height="46" fill="url(#hatch2)" opacity="0.5"/>
      <defs>
        <pattern id="hatch1" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(0,186,220,0.5)" strokeWidth="1.5"/>
        </pattern>
        <pattern id="hatch2" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1" fill="rgba(255,127,64,0.6)"/>
        </pattern>
      </defs>
    </g>
  ];

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", gap:"0.75rem" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.58rem", fontWeight:600,
          letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(255,255,255,0.35)" }}>
          Concept Layers · Building
        </span>
        <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem", fontWeight:600, color:"#00BADC" }}>
          {layers[activeLayer].label}
        </span>
      </div>
      {/* SVG floor plan */}
      <div style={{ flex:1, background:"rgba(255,255,255,0.03)", borderRadius:"0.5rem",
        border:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", justifyContent:"center",
        overflow:"hidden", minHeight:120 }}>
        <svg viewBox="0 0 200 150" width="100%" height="100%" style={{ maxHeight:140 }}>
          {/* Always show shell */}
          {layerShapes[0]}
          {/* Show layers up to active */}
          {layerShapes.slice(1, activeLayer + 1)}
          {/* North arrow */}
          <g transform="translate(178,25)">
            <line x1="0" y1="8" x2="0" y2="-8" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
            <polygon points="0,-8 -3,-2 3,-2" fill="rgba(255,255,255,0.5)"/>
            <text x="4" y="2" fontSize="6" fill="rgba(255,255,255,0.3)" fontFamily="Poppins">N</text>
          </g>
        </svg>
      </div>
      {/* Layer toggles */}
      <div style={{ display:"flex", gap:"0.4rem", flexWrap:"wrap" }}>
        {layers.map((l, i) => (
          <div key={i} style={{
            fontFamily:"'Poppins',sans-serif", fontSize:"0.58rem", fontWeight:500,
            padding:"0.2rem 0.55rem", borderRadius:99,
            background: i <= activeLayer ? "rgba(0,186,220,0.15)" : "rgba(255,255,255,0.04)",
            border:`1px solid ${i <= activeLayer ? "rgba(0,186,220,0.4)" : "rgba(255,255,255,0.1)"}`,
            color: i <= activeLayer ? "#00BADC" : "rgba(255,255,255,0.25)",
            transition:"all 0.4s ease",
          }}>{l.label}</div>
        ))}
      </div>
    </div>
  );
};

// ── SPRINT PROCESS SECTION ───────────────────────────────────────────────────
// ── LANDING JOURNEY TIMELINE ─────────────────────────────────────────────────
const SPRINT_JOURNEY = [
  { phase:"Sprint",  week:"Week 1",   label:"Site Visit + Audit",    color:"#00BADC", desc:"Walk the building. Map 10+ competitors in the submarket. Photograph every dead zone. Understand what the market needs — and what it's tired of seeing." },
  { phase:"Sprint",  week:"Week 2",   label:"Programming Workshop",  color:"#00BADC", desc:"Amenity Matrix workshop with ownership and leasing. Align on 6–8 high-value interventions from a field of 24. Budget scoped to your tier." },
  { phase:"Design",  week:"Wk 2–3",  label:"Concept Design",        color:"#18988B", desc:"2–3 distinct concept directions developed in parallel. Spatial narrative, materiality, and programming strategy defined." },
  { phase:"Design",  week:"Wk 3–4",  label:"Delivery Package",      color:"#18988B", desc:"Floor plans, renderings, axonometrics, design language board. Everything your team needs to move with conviction." },
  { phase:"Build",   week:"Mo 2–5",  label:"Design Development",    color:"#FF7F40", desc:"Full construction documents. MEP coordination. Contractor bid package. Construction sequenced around tenant operations." },
  { phase:"Outcome", week:"Mo 5+",   label:"Leasing Activation",    color:"#FFD53D", desc:"Broker launch. Tours begin within 30 days. Leases signed at premium. The sprint pays for itself before the lobby is done." },
];

const LandingJourneySection = () => {
  const mobile = useIsMobile();
  const [ref, visible] = useScrollReveal(0.08);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setActiveStep(s => (s + 1) % SPRINT_JOURNEY.length), 2800);
    return () => clearInterval(t);
  }, [visible]);

  const phases = ["Sprint","Design","Build","Outcome"];
  const phaseColors = { Sprint:"#00BADC", Design:"#18988B", Build:"#FF7F40", Outcome:"#FFD53D" };

  return (
    <section style={{ padding: mobile ? "4rem 5vw" : "8rem 6vw", background:"#1e2022", position:"relative", overflow:"hidden" }}>
      {/* Subtle grid texture */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)",
        backgroundSize:"48px 48px" }}/>

      <div ref={ref} style={{ maxWidth:1100, margin:"0 auto", position:"relative" }}>

        {/* Header */}
        <div style={{ marginBottom: mobile ? "3rem" : "4rem" }}>
          <div style={{ opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(20px)",
            transition:"all 0.7s ease 0s",
            fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem", fontWeight:600,
            letterSpacing:"0.22em", textTransform:"uppercase", color:"#00BADC", marginBottom:"1rem" }}>
            From Sketch to Keys
          </div>
          <h2 style={{ opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(20px)",
            transition:"all 0.7s ease 0.1s",
            fontFamily:"'Poppins',sans-serif", fontWeight:800,
            fontSize: mobile ? "clamp(1.7rem,7vw,2.2rem)" : "clamp(2rem,4vw,3rem)",
            color:"#fff", lineHeight:1.1, margin:0 }}>
            Concept to construction<br/>on a leasing timeline.
          </h2>
        </div>

        {/* Phase labels */}
        <div style={{ opacity:visible?1:0, transition:"opacity 0.7s ease 0.2s", display:"flex", marginBottom:"0.5rem" }}>
          {phases.map(phase => {
            const pSteps = SPRINT_JOURNEY.filter(s => s.phase === phase);
            const pct = (pSteps.length / SPRINT_JOURNEY.length) * 100;
            return (
              <div key={phase} style={{ width:`${pct}%` }}>
                <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.52rem", fontWeight:700,
                  letterSpacing:"0.18em", textTransform:"uppercase", color:phaseColors[phase] }}>{phase}</span>
              </div>
            );
          })}
        </div>

        {/* Progress track */}
        <div style={{ opacity:visible?1:0, transition:"opacity 0.7s ease 0.25s",
          position:"relative", height:2, background:"rgba(255,255,255,0.07)", marginBottom:"2.5rem" }}>
          <div style={{
            position:"absolute", left:0, top:0, height:"100%",
            width:`${((activeStep + 1) / SPRINT_JOURNEY.length) * 100}%`,
            background:SPRINT_JOURNEY[activeStep].color,
            transition:"width 0.55s ease, background 0.4s",
            boxShadow:`0 0 8px ${SPRINT_JOURNEY[activeStep].color}99`,
          }}/>
          {SPRINT_JOURNEY.map((s, i) => (
            <div key={i} onClick={() => setActiveStep(i)} style={{
              position:"absolute",
              left:`${(i / (SPRINT_JOURNEY.length - 1)) * 100}%`,
              top:"50%", transform:"translate(-50%,-50%)",
              width: i === activeStep ? 16 : 10,
              height: i === activeStep ? 16 : 10,
              borderRadius:"50%",
              background: i <= activeStep ? s.color : "#1e2022",
              border:`2px solid ${i <= activeStep ? s.color : "rgba(255,255,255,0.15)"}`,
              cursor:"pointer", transition:"all 0.3s ease", zIndex:2,
              boxShadow: i === activeStep ? `0 0 12px ${s.color}99` : "none",
            }}/>
          ))}
        </div>

        {/* Step cards */}
        {mobile ? (
          <div>
            {SPRINT_JOURNEY.map((s, i) => (
              <div key={i} onClick={() => setActiveStep(i)} style={{
                display:"flex", gap:"1.1rem", paddingBottom:"1.75rem",
                position:"relative", cursor:"pointer",
                opacity:visible?1:0, transform:visible?"translateX(0)":"translateX(-12px)",
                transition:`opacity 0.6s ease ${0.1+i*0.08}s, transform 0.6s ease ${0.1+i*0.08}s`,
              }}>
                {i < SPRINT_JOURNEY.length - 1 && (
                  <div style={{ position:"absolute", left:13, top:28, bottom:0,
                    width:1, background:"rgba(255,255,255,0.06)" }}/>
                )}
                <div style={{ flexShrink:0, width:26, height:26, borderRadius:"50%",
                  background:"#1e2022",
                  border:`2px solid ${i <= activeStep ? s.color : "rgba(255,255,255,0.1)"}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  position:"relative", zIndex:1, transition:"border-color 0.4s" }}>
                  <div style={{ width:7, height:7, borderRadius:"50%",
                    background: i <= activeStep ? s.color : "rgba(255,255,255,0.15)",
                    transition:"background 0.4s" }}/>
                </div>
                <div style={{ paddingTop:2 }}>
                  <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.55rem", fontWeight:700,
                    letterSpacing:"0.16em", textTransform:"uppercase",
                    color: i <= activeStep ? s.color : "rgba(255,255,255,0.2)",
                    marginBottom:"0.2rem", transition:"color 0.3s" }}>
                    {s.phase} · {s.week}
                  </div>
                  <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.85rem", fontWeight:700,
                    color: i === activeStep ? "#fff" : "rgba(255,255,255,0.45)",
                    marginBottom:"0.3rem", transition:"color 0.3s" }}>{s.label}</div>
                  <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.74rem", fontWeight:300,
                    color:"rgba(255,255,255,0.32)", lineHeight:1.7,
                    opacity: i === activeStep ? 1 : 0,
                    transition:"opacity 0.4s ease" }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:`repeat(${SPRINT_JOURNEY.length},1fr)`, gap:"0.4rem" }}>
            {SPRINT_JOURNEY.map((s, i) => (
              <div key={i} onClick={() => setActiveStep(i)} style={{
                padding:"1rem 0.75rem",
                background: i === activeStep ? "rgba(255,255,255,0.05)" : "transparent",
                border:`1px solid ${i === activeStep ? s.color + "44" : "transparent"}`,
                borderRadius:"0.5rem", cursor:"pointer",
                opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(16px)",
                transitionProperty:"opacity,transform,background,border-color",
                transitionDuration:`0.6s,0.6s,0.3s,0.3s`,
                transitionDelay:`${0.15+i*0.07}s,${0.15+i*0.07}s,0s,0s`,
              }}>
                <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.52rem", fontWeight:600,
                  letterSpacing:"0.14em", textTransform:"uppercase",
                  color: i <= activeStep ? s.color : "rgba(255,255,255,0.18)",
                  marginBottom:"0.35rem", transition:"color 0.3s" }}>{s.week}</div>
                <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.74rem", fontWeight:700,
                  color: i === activeStep ? "#fff" : "rgba(255,255,255,0.38)",
                  lineHeight:1.35, marginBottom:"0.35rem", transition:"color 0.3s" }}>{s.label}</div>
                <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.65rem", fontWeight:300,
                  color:"rgba(255,255,255,0.28)", lineHeight:1.65,
                  opacity: i === activeStep ? 1 : 0.35,
                  transition:"opacity 0.4s ease" }}>{s.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const SprintProcessSection = () => {
  const [ref, visible] = useScrollReveal(0.08);
  const [activeCard, setActiveCard] = useState(0);
  const mobile = useIsMobile();

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setActiveCard(c => (c+1)%3), 4000);
    return () => clearInterval(t);
  }, [visible]);

  const steps = [
    { n:"01", title:"Diagnose the Asset", color:"#00BADC",
      body:"We analyze the building's competitive position, existing amenity mix, leasing drivers, and site conditions. Every sprint begins with understanding what the market actually needs." },
    { n:"02", title:"Program & Concept", color:"#18988B",
      body:"Using our Amenity Matrix framework, we identify high-value interventions relative to cost — then develop a full design concept including spatial narrative, materiality, and programming strategy." },
    { n:"03", title:"Visualize & Deliver", color:"#FF7F40",
      body:"Floor plans, renderings, axonometrics, design language, and presentation-ready assets. Everything your team needs to brief ownership, activate brokers, and move with conviction." },
  ];

  const cards = [
    <DiagnoseCard active={activeCard===0}/>,
    <ProgramCard active={activeCard===1}/>,
    <VisualizeCard active={activeCard===2}/>,
  ];

  return (
    <section style={{ padding:"0", background:C.bgSection, position:"relative", overflow:"hidden" }}>
      {/* Background texture */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        <div style={{ position:"absolute", inset:0,
          backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize:"36px 36px" }}/>
        <div style={{ position:"absolute", inset:0,
          background:"radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,186,220,0.04) 0%, transparent 70%)" }}/>
        <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
          width:"60vw", height:"1px",
          background:"linear-gradient(90deg,transparent,rgba(0,186,220,0.35),transparent)" }}/>
      </div>

      <div ref={ref} style={{ maxWidth:1200, margin:"0 auto",
        padding: mobile ? "5rem 5vw 4rem" : "9rem 6vw", position:"relative", zIndex:1 }}>

        {/* Header */}
        <div style={{ marginBottom: mobile ? "3rem" : "5rem" }}>
          <div style={{ opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(20px)",
            transition:"all 0.7s ease 0s",
            fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem", fontWeight:600,
            letterSpacing:"0.22em", textTransform:"uppercase", color:"#00BADC", marginBottom:"1rem" }}>
            The Sprint Process
          </div>
          <h2 style={{ opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(20px)",
            transition:"all 0.7s ease 0.1s",
            fontFamily:"'Poppins',sans-serif", fontWeight:800,
            fontSize: mobile ? "clamp(1.7rem,7vw,2.2rem)" : "clamp(2rem,4vw,3.5rem)",
            color:"#fff", lineHeight:1.15 }}>
            From brief to concept<br/>in weeks, not months.
          </h2>
        </div>

        {/* MOBILE layout: stacked accordion steps + card below */}
        {mobile ? (
          <div style={{ display:"flex", flexDirection:"column", gap:"0" }}>
            {steps.map((s, i) => (
              <div key={i} onClick={() => setActiveCard(i)} style={{
                borderBottom:`1px solid rgba(255,255,255,0.07)`, cursor:"pointer",
                opacity:visible?1:0, transform:visible?"translateX(0)":"translateX(-16px)",
                transition:`opacity 0.6s ease ${0.12+i*0.1}s, transform 0.6s ease ${0.12+i*0.1}s`,
              }}>
                {/* Step header row */}
                <div style={{ display:"flex", alignItems:"center", gap:"1rem", padding:"1.25rem 0" }}>
                  <div style={{ width:3, alignSelf:"stretch", background:activeCard===i?s.color:"transparent",
                    borderRadius:2, flexShrink:0, transition:"background 0.3s" }}/>
                  <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"1.1rem", fontWeight:800,
                    color:activeCard===i?"rgba(255,255,255,0.18)":"rgba(255,255,255,0.08)", flexShrink:0, width:36 }}>{s.n}</div>
                  <div style={{ width:activeCard===i?24:16, height:3, background:activeCard===i?s.color:"rgba(255,255,255,0.12)",
                    borderRadius:2, flexShrink:0, transition:"all 0.35s" }}/>
                  <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.95rem", fontWeight:700,
                    color:activeCard===i?"#fff":"rgba(255,255,255,0.45)", transition:"color 0.3s", flex:1 }}>{s.title}</div>
                  <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"1rem",
                    color:activeCard===i?s.color:"rgba(255,255,255,0.2)", transition:"color 0.3s", flexShrink:0 }}>
                    {activeCard===i ? "−" : "+"}
                  </div>
                </div>
                {/* Expanded body + mini card */}
                {activeCard===i && (
                  <div style={{ paddingBottom:"1.5rem", paddingLeft:"3.25rem" }}>
                    <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.82rem", fontWeight:300,
                      color:"rgba(255,255,255,0.5)", lineHeight:1.75, marginBottom:"1.25rem" }}>{s.body}</p>
                    {/* Animated card — full width on mobile */}
                    <div style={{ background:"rgba(255,255,255,0.05)", border:`1px solid rgba(255,255,255,0.1)`,
                      borderRadius:"0.75rem", padding:"1.25rem", position:"relative", overflow:"hidden" }}>
                      <div style={{ position:"absolute", top:0, left:0, right:0, height:2,
                        background:s.color, boxShadow:`0 0 10px ${s.color}88` }}/>
                      <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.58rem", fontWeight:600,
                        letterSpacing:"0.16em", textTransform:"uppercase", color:s.color, marginBottom:"1rem" }}>
                        Step {s.n}
                      </div>
                      {cards[i]}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* Mobile progress dots */}
            <div style={{ display:"flex", gap:"0.5rem", paddingTop:"2rem", alignItems:"center" }}>
              {steps.map((_,i) => (
                <div key={i} onClick={()=>setActiveCard(i)} style={{
                  width:activeCard===i?24:6, height:6, borderRadius:3,
                  background:activeCard===i?"#00BADC":"rgba(255,255,255,0.15)",
                  cursor:"pointer", transition:"all 0.35s ease" }}/>
              ))}
            </div>
          </div>
        ) : (
          /* DESKTOP layout: steps left, sticky card right */
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5rem", alignItems:"start" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:"0" }}>
              {steps.map((s, i) => (
                <div key={i} onClick={() => setActiveCard(i)} style={{
                  padding:"2rem 0", borderBottom:"1px solid rgba(255,255,255,0.07)",
                  cursor:"pointer",
                  opacity:visible?1:0, transform:visible?"translateX(0)":"translateX(-20px)",
                  transition:`opacity 0.7s ease ${0.15+i*0.12}s, transform 0.7s ease ${0.15+i*0.12}s`,
                  position:"relative",
                }}>
                  <div style={{ position:"absolute", left:"-2rem", top:0, bottom:0, width:3,
                    background:activeCard===i?s.color:"transparent", transition:"background 0.3s", borderRadius:2 }}/>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:"1.5rem" }}>
                    <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"1.8rem", fontWeight:800, lineHeight:1,
                      color:activeCard===i?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.07)",
                      flexShrink:0, width:48, transition:"color 0.3s" }}>{s.n}</div>
                    <div>
                      <div style={{ width:activeCard===i?32:20, height:3,
                        background:activeCard===i?s.color:"rgba(255,255,255,0.15)",
                        borderRadius:2, marginBottom:"0.75rem", transition:"all 0.4s" }}/>
                      <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"1rem", fontWeight:700,
                        color:activeCard===i?"#fff":"rgba(255,255,255,0.45)",
                        marginBottom:"0.5rem", transition:"color 0.3s" }}>{s.title}</div>
                      <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.82rem", fontWeight:300,
                        color:activeCard===i?"rgba(255,255,255,0.55)":"rgba(255,255,255,0.25)",
                        lineHeight:1.75,
                        opacity:activeCard===i?1:0.4,
                        transition:"color 0.3s, opacity 0.4s" }}>{s.body}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ display:"flex", gap:"0.5rem", paddingTop:"2rem", alignItems:"center" }}>
                {steps.map((_,i) => (
                  <div key={i} onClick={()=>setActiveCard(i)} style={{
                    width:activeCard===i?24:6, height:6, borderRadius:3,
                    background:activeCard===i?"#00BADC":"rgba(255,255,255,0.15)",
                    cursor:"pointer", transition:"all 0.35s" }}/>
                ))}
                <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.58rem", fontWeight:400,
                  color:"rgba(255,255,255,0.2)", marginLeft:"0.5rem" }}>Click to explore</span>
              </div>
            </div>

            {/* RIGHT sticky card */}
            <div style={{ opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(24px)",
              transition:"opacity 0.7s ease 0.4s, transform 0.7s ease 0.4s",
              position:"sticky", top:"8rem" }}>
              <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:"1rem", padding:"2rem", backdropFilter:"blur(8px)",
                minHeight:380, position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:2,
                  background:steps[activeCard].color, transition:"background 0.4s",
                  boxShadow:`0 0 12px ${steps[activeCard].color}88` }}/>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
                  <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem", fontWeight:600,
                    letterSpacing:"0.18em", textTransform:"uppercase",
                    color:steps[activeCard].color, transition:"color 0.3s" }}>Step {steps[activeCard].n}</div>
                  <div style={{ display:"flex", gap:"0.3rem" }}>
                    {steps.map((_,i) => (
                      <div key={i} style={{ width:5, height:5, borderRadius:"50%",
                        background:i===activeCard?steps[activeCard].color:"rgba(255,255,255,0.12)",
                        transition:"background 0.3s" }}/>
                    ))}
                  </div>
                </div>
                <div>{cards[activeCard]}</div>
              </div>
              <div style={{ position:"absolute", inset:0, zIndex:-1,
                background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)",
                borderRadius:"1rem", transform:"translateY(8px) scale(0.97)" }}/>
            </div>
          </div>
        )}
      </div>

      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"4rem",
        background:`linear-gradient(to bottom, transparent, ${C.bg})`, pointerEvents:"none" }}/>
    </section>
  );
};

// ── TESTIMONIALS ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "The Sprint process gave us the visual story we needed to walk into every broker meeting with conviction. First new tenant signed within 90 days of delivery.",
    name: "Sarah T.",
    title: "VP Asset Management",
    company: "Midwest REIT",
    color: "#00BADC",
  },
  {
    quote: "We'd been staring at the same lobby for three years. NELSON came in, ran the Sprint, and in four weeks we had a concept that ownership actually got excited about.",
    name: "David K.",
    title: "Principal",
    company: "CRE Capital Partners",
    color: "#18988B",
  },
  {
    quote: "The Amenity Matrix alone was worth the engagement. Understanding which interventions move the needle — and which don't — saved us from a very expensive mistake.",
    name: "Maria R.",
    title: "Director of Leasing",
    company: "Commercial Properties Group",
    color: "#FF7F40",
  },
];

const TestimonialsSection = () => {
  const mobile = useIsMobile();
  const [ref, visible] = useScrollReveal(0.08);
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActive(prev => (prev + 1) % TESTIMONIALS.length);
        setFading(false);
      }, 320);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const t = TESTIMONIALS[active];

  return (
    <section style={{
      background: "#191b1d",
      padding: mobile ? "5rem 5vw" : "9rem 6vw",
      position: "relative", overflow: "hidden",
    }}>
      {/* Subtle dot grid */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize:"36px 36px" }}/>
      {/* Accent glow behind active color */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", transition:"opacity 1.2s ease",
        background:`radial-gradient(ellipse 60% 50% at 50% 60%, ${t.color}08 0%, transparent 70%)` }}/>

      <div ref={ref} style={{ maxWidth:900, margin:"0 auto", position:"relative" }}>
        {/* Label */}
        <div style={{ opacity:visible?1:0, transition:"opacity 0.7s ease",
          fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem", fontWeight:600,
          letterSpacing:"0.22em", textTransform:"uppercase", color:"#00BADC",
          marginBottom: mobile ? "2.5rem" : "3.5rem" }}>
          What Clients Say
        </div>

        {/* Quote body */}
        <div style={{
          opacity: visible ? (fading ? 0 : 1) : 0,
          transform: fading ? "translateY(6px)" : "translateY(0)",
          transition: "opacity 0.32s ease, transform 0.32s ease",
        }}>
          {/* Giant quote mark */}
          <div style={{
            fontFamily:"'Poppins',sans-serif", fontSize: mobile ? "5rem" : "8rem",
            fontWeight:800, lineHeight:0.7, color:t.color,
            opacity:0.35, marginBottom: mobile ? "1.25rem" : "1.75rem",
            userSelect:"none",
          }}>"</div>

          <p style={{
            fontFamily:"'Poppins',sans-serif",
            fontSize: mobile ? "clamp(1.1rem,4.5vw,1.4rem)" : "clamp(1.25rem,2.2vw,1.75rem)",
            fontWeight:300, lineHeight:1.65,
            color:"rgba(255,255,255,0.88)",
            marginBottom: mobile ? "2rem" : "2.75rem",
            letterSpacing:"-0.01em",
          }}>{t.quote}</p>

          {/* Attribution */}
          <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
            <div style={{
              width:36, height:36, borderRadius:"50%",
              background:`${t.color}22`,
              border:`1.5px solid ${t.color}55`,
              display:"flex", alignItems:"center", justifyContent:"center",
              flexShrink:0,
            }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:t.color }} />
            </div>
            <div>
              <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.82rem", fontWeight:600,
                color:"#fff" }}>{t.name}</div>
              <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.68rem", fontWeight:400,
                color:"rgba(255,255,255,0.35)", letterSpacing:"0.04em" }}>
                {t.title} · {t.company}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation dots */}
        <div style={{ display:"flex", gap:"0.5rem", alignItems:"center",
          marginTop: mobile ? "2.5rem" : "3.5rem" }}>
          {TESTIMONIALS.map((_,i) => (
            <div key={i} onClick={() => { setFading(true); setTimeout(() => { setActive(i); setFading(false); }, 280); }}
              style={{
                width: active===i ? 28 : 6, height:6, borderRadius:3,
                background: active===i ? TESTIMONIALS[i].color : "rgba(255,255,255,0.15)",
                cursor:"pointer", transition:"all 0.35s cubic-bezier(0.16,1,0.3,1)",
                boxShadow: active===i ? `0 0 10px ${TESTIMONIALS[i].color}66` : "none",
              }}/>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── MEET THE LEAD ─────────────────────────────────────────────────────────────
// Replace with your Vercel Blob URL after uploading: POST /api/blob/upload
const DAVID_PHOTO_URL = "https://wjwrbcw7qoosooaa.public.blob.vercel-storage.com/David26%27.png";

const MeetTheLeadSection = () => {
  const mobile = useIsMobile();
  const [ref, visible] = useScrollReveal(0.08);
  return (
    <section style={{ background:"#191b1d", position:"relative", overflow:"hidden" }}>
      {/* Subtle grid texture */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.022) 1px, transparent 1px)",
        backgroundSize:"32px 32px" }}/>
      <div style={{
        display:"flex", flexDirection: mobile ? "column" : "row",
        minHeight: mobile ? "auto" : "72vh",
        alignItems:"stretch",
      }}>
        {/* Photo panel */}
        <div style={{
          flex: mobile ? "none" : "0 0 44%",
          position:"relative",
          minHeight: mobile ? 280 : "auto",
          overflow:"hidden",
        }}>
          {DAVID_PHOTO_URL ? (
            <img src={DAVID_PHOTO_URL} alt="David Filak — Sprint Lead"
              style={{ position:"absolute", inset:0, width:"100%", height:"100%",
                objectFit:"cover", objectPosition:"center top" }}/>
          ) : (
            <div style={{ position:"absolute", inset:0,
              background:"linear-gradient(145deg,#282a2c 0%,#1e2022 60%,#252729 100%)" }}>
              <div style={{ position:"absolute", inset:0,
                backgroundImage:"linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)",
                backgroundSize:"28px 28px" }}/>
              {[0,1,2,3].map(c=>(
                <div key={c} style={{
                  position:"absolute",
                  top:c<2?20:"auto", bottom:c>=2?20:"auto",
                  left:c%2===0?20:"auto", right:c%2===1?20:"auto",
                  width:24, height:24,
                  borderTop:c<2?"1.5px solid rgba(0,186,220,0.4)":"none",
                  borderBottom:c>=2?"1.5px solid rgba(0,186,220,0.4)":"none",
                  borderLeft:c%2===0?"1.5px solid rgba(0,186,220,0.4)":"none",
                  borderRight:c%2===1?"1.5px solid rgba(0,186,220,0.4)":"none",
                }}/>
              ))}
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", gap:"0.5rem" }}>
                <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.54rem", fontWeight:600,
                  letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(0,186,220,0.5)" }}>
                  Photo · Upload to Blob
                </div>
              </div>
            </div>
          )}
          {/* Right-edge gradient fade into content */}
          {!mobile && (
            <div style={{ position:"absolute", top:0, right:0, bottom:0, width:"30%",
              background:"linear-gradient(to right, transparent, #191b1d)", pointerEvents:"none" }}/>
          )}
          {mobile && (
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"40%",
              background:"linear-gradient(to bottom, transparent, #191b1d)", pointerEvents:"none" }}/>
          )}
        </div>

        {/* Content panel */}
        <div ref={ref} style={{
          flex:1, display:"flex", flexDirection:"column", justifyContent:"center",
          padding: mobile ? "2rem 5vw 4rem" : "5rem 6vw 5rem 4vw",
          position:"relative", zIndex:1,
        }}>
          <div style={{ opacity:visible?1:0, transform:visible?"none":"translateY(16px)",
            transition:"all 0.7s ease",
            fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem", fontWeight:600,
            letterSpacing:"0.22em", textTransform:"uppercase", color:"#00BADC", marginBottom:"1rem" }}>
            Meet Your Sprint Lead
          </div>
          <h2 style={{ opacity:visible?1:0, transform:visible?"none":"translateY(18px)",
            transition:"all 0.75s ease 0.08s",
            fontFamily:"'Poppins',sans-serif", fontWeight:800,
            fontSize: mobile?"clamp(1.8rem,7vw,2.4rem)":"clamp(2rem,3vw,2.8rem)",
            color:"#fff", lineHeight:1.1, marginBottom:"0.5rem" }}>
            David Filak
          </h2>
          <div style={{ opacity:visible?1:0, transition:"all 0.7s ease 0.14s",
            fontFamily:"'Poppins',sans-serif", fontSize:"0.78rem", fontWeight:400,
            color:"rgba(255,255,255,0.4)", letterSpacing:"0.06em", marginBottom:"1.75rem" }}>
            Principal, Asset Strategy · NELSON Worldwide
          </div>
          <p style={{ opacity:visible?1:0, transform:visible?"none":"translateY(12px)",
            transition:"all 0.75s ease 0.2s",
            fontFamily:"'Poppins',sans-serif", fontSize: mobile?"0.88rem":"0.95rem",
            fontWeight:300, color:"rgba(255,255,255,0.55)", lineHeight:1.85,
            maxWidth:440, marginBottom:"2.25rem" }}>
            I've run Amenity Sprints on 40-story Loop towers, suburban flex parks, and everything in between. The Sprint process exists because I was tired of watching owners spend six months deciding whether to spend $800K — when a $10K concept would answer the question in four weeks.
          </p>
          {/* Stats row */}
          <div style={{ opacity:visible?1:0, transition:"all 0.7s ease 0.28s",
            display:"flex", gap:"2rem", flexWrap:"wrap", marginBottom:"2.5rem",
            paddingTop:"1.5rem", borderTop:"1px solid rgba(255,255,255,0.07)" }}>
            {[["10+","Sprints Led"],["5","Markets"],["$400M+","Assets Repositioned"]].map(([v,l])=>(
              <div key={l}>
                <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"1.1rem", fontWeight:800,
                  color:"#fff" }}>{v}</div>
                <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.54rem", fontWeight:500,
                  color:"rgba(255,255,255,0.28)", letterSpacing:"0.1em", textTransform:"uppercase",
                  marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
          {/* CTA */}
          <div style={{ opacity:visible?1:0, transition:"all 0.7s ease 0.34s" }}>
            <a href="https://app.hubspot.com/meetings/dfilak" target="_blank" rel="noopener noreferrer"
              style={{
                display:"inline-flex", alignItems:"center", gap:"0.5rem",
                background:"#00BADC", color:"#fff", textDecoration:"none",
                fontFamily:"'Poppins',sans-serif", fontSize:"0.8rem", fontWeight:700,
                padding:"0.875rem 2rem", borderRadius:9999,
                boxShadow:"0 0 24px rgba(0,186,220,0.4)",
                transition:"background 0.2s, transform 0.2s",
              }}
              onMouseOver={e=>{e.currentTarget.style.background="#009abb";e.currentTarget.style.transform="translateY(-2px)"}}
              onMouseOut={e=>{e.currentTarget.style.background="#00BADC";e.currentTarget.style.transform="none"}}
            >
              <div style={{ width:7, height:7, borderRadius:"50%", background:"rgba(255,255,255,0.8)",
                animation:"onlineRing 2s ease-out infinite" }}/>
              Schedule a Call with David
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── PROJECTS DATA ────────────────────────────────────────────────────────────
const PROJECTS = getAllProjects();

const SIZE_CONFIG = {
  S:{ label:"S", name:"Targeted", color:"#18988B" },
  M:{ label:"M", name:"Strategic", color:"#00BADC" },
  L:{ label:"L", name:"Comprehensive", color:"#FF7F40" },
  XL:{ label:"XL", name:"Transformative", color:"#4C0049" },
};

const ProjectCard = ({ p, delay }) => {
  const [ref, visible] = useScrollReveal(0.05);
  const [hovered, setHovered] = useState(false);
  const sz = SIZE_CONFIG[p.size] || SIZE_CONFIG.M;
  const imgSrc = p.cardImage || p.img;
  const typeLabel = p.tagline || p.type || '';
  const duration = p.sprintDuration || p.duration || '';
  const deliverables = (p.concept && p.concept.deliverables) || p.deliverables || [];
  return (
    <a ref={ref} href={`/projects/${p.slug}`}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{
        display:"block", textDecoration:"none", position:"relative",
        background:"#242628",
        borderRadius:"1.5rem",
        overflow:"hidden",
        opacity:visible?1:0,
        transform:visible?(hovered?"translateY(-6px)":"translateY(0)"):"translateY(32px)",
        transition:`opacity 0.7s ease ${delay}s, transform 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease`,
        boxShadow:hovered
          ? `0 32px 64px rgba(0,0,0,0.55), 0 0 0 1px ${sz.color}55`
          : "0 4px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05)",
      }}>
      {/* Tier color top glow strip */}
      <div style={{ height:2, background:sz.color, width:"100%",
        boxShadow:`0 0 16px 2px ${sz.color}88` }}/>
      {/* Full-bleed image */}
      <div style={{ position:"relative", aspectRatio:"16/9", overflow:"hidden" }}>
        {imgSrc ? (
          <img src={imgSrc} alt={p.name} style={{
            width:"100%", height:"100%", objectFit:"cover", objectPosition:"top center",
            transition:"transform 0.6s ease",
            transform: hovered ? "scale(1.06)" : "scale(1)",
            display:"block",
          }}/>
        ) : (
          <div style={{ width:"100%", height:"100%",
            background:"linear-gradient(145deg,#2a2c2e 0%,#1e2022 100%)",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem",
              color:"rgba(255,255,255,0.12)", letterSpacing:"0.12em", textTransform:"uppercase" }}>{p.name}</span>
          </div>
        )}
        {/* Persistent bottom gradient for name legibility */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none",
          background:"linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.8) 100%)" }}/>
        {/* Deliverables overlay on hover */}
        <div style={{
          position:"absolute", inset:0,
          background:"rgba(10,10,14,0.94)",
          opacity:hovered?1:0, transition:"opacity 0.3s ease",
          display:"flex", flexDirection:"column", justifyContent:"center", padding:"1.5rem",
        }}>
          <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.54rem", fontWeight:700,
            letterSpacing:"0.2em", textTransform:"uppercase", color:sz.color, marginBottom:"0.85rem" }}>
            Sprint Deliverables
          </div>
          {deliverables.slice(0,4).map((d,i) => (
            <div key={i} style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.73rem", fontWeight:400,
              color:"rgba(255,255,255,0.78)", paddingBottom:"0.38rem",
              borderBottom:"1px solid rgba(255,255,255,0.07)", marginBottom:"0.38rem",
              display:"flex", alignItems:"center", gap:"0.5rem" }}>
              <span style={{ width:3, height:3, borderRadius:"50%", background:sz.color,
                flexShrink:0, display:"inline-block", boxShadow:`0 0 6px ${sz.color}` }}/>
              {d}
            </div>
          ))}
          <div style={{ marginTop:"0.9rem", fontFamily:"'Poppins',sans-serif", fontSize:"0.58rem",
            fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase",
            color:"rgba(255,255,255,0.35)" }}>View Case Study →</div>
        </div>
      </div>
      {/* Card metadata */}
      <div style={{ padding:"1rem 1.25rem 1.25rem" }}>
        <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.52rem", fontWeight:600,
          letterSpacing:"0.18em", textTransform:"uppercase",
          color:"rgba(255,255,255,0.25)", marginBottom:"0.2rem" }}>{p.tag}</div>
        <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.96rem", fontWeight:700,
          color:"#fff", lineHeight:1.2, marginBottom:"0.18rem" }}>{p.name}</div>
        <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.68rem", fontWeight:400,
          color:"rgba(255,255,255,0.35)", marginBottom:"0.9rem", lineHeight:1.5 }}>{typeLabel}</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
          borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:"0.75rem" }}>
          <span style={{
            background:sz.color, color:"#fff",
            fontFamily:"'Poppins',sans-serif", fontSize:"0.56rem", fontWeight:700,
            letterSpacing:"0.09em", textTransform:"uppercase",
            padding:"0.22rem 0.65rem", borderRadius:99,
            boxShadow:`0 2px 10px ${sz.color}55`, flexShrink:0,
          }}>{sz.label} · {sz.name}</span>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.8rem", fontWeight:700,
              color:"#fff", lineHeight:1 }}>{p.investment}</div>
            <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.56rem", fontWeight:400,
              color:"rgba(255,255,255,0.28)", marginTop:"0.12rem" }}>{duration}</div>
          </div>
        </div>
      </div>
    </a>
  );
};

// REPLACE these img paths with your actual images placed in /public/images/
const TIERS = [
  { label:"S", range:"$2K–$6K", weeks:"2–3 weeks", desc:"Targeted upgrades with immediate impact — entry refresh, signage, lighting, finish improvements. Fast ROI, minimal disruption.", img:"/images/tier-s.jpg" },
  { label:"M", range:"$5K–$10K", weeks:"2.5–4 weeks", desc:"Significant public-space improvements that open revenue opportunities and solve internal building problems.", img:"/images/tier-m.jpg" },
  { label:"L", range:"$8K–$15K", weeks:"4–6 weeks", desc:"High-investment repositioning that substantially elevates current and future real estate value.", img:"/images/tier-l.jpg" },
  { label:"XL", range:"Custom", weeks:"6+ weeks", desc:"Large-scale rebranding, infrastructure overhaul, circulation redesign. Full market repositioning for flagship assets.", img:"/images/tier-xl.jpg" },
];

const SprintTier = ({ tier, active }) => {
  const sz = SIZE_CONFIG[tier.label];
  return (
    <div style={{
      borderRadius:"2rem",
      border: active
        ? `1.5px solid ${sz.color}55`
        : `1px solid rgba(255,255,255,0.08)`,
      background: active
        ? `rgba(8,10,14,0.72)`
        : `rgba(8,10,14,0.48)`,
      backdropFilter:"blur(32px) saturate(1.4)",
      WebkitBackdropFilter:"blur(32px) saturate(1.4)",
      transition:"all 0.55s cubic-bezier(0.16,1,0.3,1)",
      boxShadow: active
        ? `0 24px 56px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px ${sz.color}22`
        : "0 8px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)",
      transform: active ? "translateY(-4px) scale(1.01)" : "scale(1)",
      padding:"2rem",
      display:"flex", flexDirection:"column",
      height:"100%", overflow:"hidden",
      position:"relative",
    }}>
      {/* Tier-color top accent bar */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:3,
        background:sz.color,
        boxShadow:`0 0 16px ${sz.color}88`,
        opacity: active ? 1 : 0.4,
        transition:"opacity 0.5s ease",
        borderRadius:"2rem 2rem 0 0",
      }}/>

      {/* Tier badge — top right */}
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:"0.5rem", marginTop:"0.25rem" }}>
        <div style={{
          fontFamily:"'Poppins',sans-serif", fontSize:"0.5rem", fontWeight:700,
          letterSpacing:"0.18em", textTransform:"uppercase",
          color: active ? sz.color : "rgba(255,255,255,0.45)",
          background: active ? `${sz.color}18` : "rgba(255,255,255,0.06)",
          border:`1px solid ${active ? sz.color+"44" : "rgba(255,255,255,0.1)"}`,
          padding:"0.25rem 0.7rem", borderRadius:99,
          transition:"all 0.5s ease",
        }}>{sz.name}</div>
      </div>

      {/* HERO LETTER — Poppins 800, massive, fills the card */}
      <div style={{
        fontFamily:"'Poppins',sans-serif",
        fontSize: tier.label==="XL" ? "clamp(6rem,9vw,10rem)" : "clamp(7rem,10.5vw,12rem)",
        fontWeight:800,
        fontStyle:"normal",
        lineHeight:0.85,
        color: sz.color,
        opacity: active ? 1 : 0.5,
        transition:"all 0.55s ease",
        letterSpacing:"-0.05em",
        flex:1,
        display:"flex", alignItems:"center",
        filter: active ? `drop-shadow(0 0 32px ${sz.color}66)` : "none",
      }}>{tier.label}</div>

      {/* Bottom info */}
      <div style={{ paddingTop:"1.25rem", borderTop:`1px solid ${sz.color}22` }}>
        <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:"0.5rem" }}>
          <div style={{
            fontFamily:"'Poppins',sans-serif", fontSize:"1.15rem", fontWeight:800,
            color:"rgba(255,255,255,0.95)", letterSpacing:"-0.02em",
            opacity: active ? 1 : 0.6, transition:"opacity 0.5s",
          }}>{tier.range}</div>
          <div style={{
            fontFamily:"'Poppins',sans-serif", fontSize:"0.68rem", fontWeight:600,
            color: sz.color, letterSpacing:"0.02em",
            opacity: active ? 1 : 0.6, transition:"opacity 0.5s",
          }}>{tier.weeks}</div>
        </div>
        <div style={{
          fontFamily:"'Poppins',sans-serif", fontSize:"0.73rem", fontWeight:400,
          color:"rgba(255,255,255,0.55)", lineHeight:1.7,
          opacity: active ? 1 : 0.4, transition:"opacity 0.4s ease",
        }}>{tier.desc}</div>
      </div>
    </div>
  );
};

// ── MAIN ──────────────────────────────��──────────────────────────────────────
export default function AmenitySprint({ projects = [] }) {
  const [scrolled, setScrolled] = useState(false);
  const [heroIn, setHeroIn] = useState(false);
  const [activeTier, setActiveTier] = useState(0);
  const [filterSize, setFilterSize] = useState("ALL");

  useEffect(() => {
    const id = setInterval(() => setActiveTier(prev => (prev + 1) % 4), 2800);
    return () => clearInterval(id);
  }, []);
  const mobile = useIsMobile();

  const [tierRef, tierVis] = useScrollReveal(0.06);
  const [projRef, projVis] = useScrollReveal(0.05);
  const [delivRef, delivVis] = useScrollReveal(0.06);
  const [ctaRef, ctaVis] = useScrollReveal(0.1);

  useEffect(() => {
    setTimeout(() => setHeroIn(true), 100);
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive:true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });
  const fade = (vis, delay=0) => ({
    opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(24px)",
    transition:`opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
  });
  const filteredProjects = filterSize==="ALL" ? projects : projects.filter(p=>p.size===filterSize);

  return (
    <div style={{ fontFamily:"'Poppins',sans-serif", background:"#f7f7f7", color:"#000", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.7)}}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes onlineRing{0%{transform:scale(1);opacity:0.8}70%{transform:scale(2.2);opacity:0}100%{transform:scale(2.2);opacity:0}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#f7f7f7}::-webkit-scrollbar-thumb{background:#00BADC}
      `}</style>
      <NoiseOverlay />

      {/* ── NAV — dark floating pill ── */}
      <nav style={{
        position:"fixed", zIndex:1000,
        top: mobile ? "0.75rem" : "1.25rem",
        left:"50%", transform:"translateX(-50%)",
        width: mobile ? "calc(100vw - 2rem)" : "auto",
        display:"flex", alignItems:"center",
        gap: mobile ? "0.75rem" : "1.5rem",
        padding: mobile ? "0 1rem 0 0.875rem" : "0 0.875rem 0 1.25rem",
        height: mobile ? 52 : 56,
        background:"rgba(16,18,20,0.88)",
        backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)",
        border:"1px solid rgba(255,255,255,0.1)",
        borderRadius:9999,
        boxShadow:`0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05)`,
        transition:"box-shadow 0.4s ease",
        justifyContent: mobile ? "space-between" : "flex-start",
      }}>
        {/* Logo */}
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NELSON_whiteBlueFin-BHENwe28ggL1i46CvcW16xy4UDxTTw.png"
          alt="NELSON"
          style={{ height:22, width:"auto", flexShrink:0 }}
        />

        {!mobile && (
          <>
            {/* Divider */}
            <div style={{ width:1, height:18, background:"rgba(255,255,255,0.12)", flexShrink:0 }}/>
            {/* Nav links */}
            {[["approach","Approach"],["projects","Projects"],["deliverables","Deliverables"]].map(([id,label])=>(
              <button key={id} onClick={()=>scrollTo(id)} style={{
                background:"none", border:"none", cursor:"pointer",
                fontFamily:"'Poppins',sans-serif", fontSize:"0.7rem", fontWeight:500,
                letterSpacing:"0.06em", color:"rgba(255,255,255,0.55)", transition:"color 0.2s",
                whiteSpace:"nowrap", padding:"0 0.25rem",
              }}
                onMouseOver={e=>e.target.style.color="#fff"}
                onMouseOut={e=>e.target.style.color="rgba(255,255,255,0.55)"}
              >{label}</button>
            ))}
          </>
        )}

        {/* Spacer */}
        {!mobile && <div style={{ flex:1 }}/>}

        {/* Pulsing online indicator */}
        <div style={{ display:"flex", alignItems:"center", gap:"0.35rem", flexShrink:0 }}>
          <div style={{ position:"relative", width:8, height:8, flexShrink:0 }}>
            <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"#22c55e",
              animation:"onlineRing 2s ease-out infinite" }}/>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e",
              position:"relative", zIndex:1 }}/>
          </div>
          {!mobile && (
            <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.54rem", fontWeight:600,
              letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.4)",
              whiteSpace:"nowrap" }}>Online</span>
          )}
        </div>

        {/* Calendar CTA */}
        <a href="https://app.hubspot.com/meetings/dfilak" target="_blank" rel="noopener noreferrer"
          style={{
            background:"#00BADC", border:"none", cursor:"pointer",
            fontFamily:"'Poppins',sans-serif", fontSize: mobile?"0.66rem":"0.7rem", fontWeight:700,
            color:"#fff", padding: mobile?"0.45rem 1rem":"0.5rem 1.25rem",
            borderRadius:9999, transition:"background 0.2s, transform 0.2s",
            textDecoration:"none", display:"flex", alignItems:"center", gap:"0.35rem",
            whiteSpace:"nowrap", flexShrink:0,
            boxShadow:"0 0 16px rgba(0,186,220,0.35)",
          }}
          onMouseOver={e=>{e.currentTarget.style.background="#009abb";e.currentTarget.style.transform="scale(1.03)"}}
          onMouseOut={e=>{e.currentTarget.style.background="#00BADC";e.currentTarget.style.transform="scale(1)"}}
        >Book a Call</a>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight:"100dvh",
        display:"flex", flexDirection:"column",
        justifyContent: mobile ? "center" : "flex-end",
        padding: mobile ? "88px 5vw 5vh" : "0 6vw 10vh",
        position:"relative", overflow:"hidden",
      }}>
        {/* Full-bleed background video — replace HERO_VIDEO_URL with your Vercel Blob video URL */}
        {/* To upload: POST /api/blob/upload with file + folder:"hero" fields */}
        <video
          autoPlay muted loop playsInline
          style={{
            position:"absolute", inset:0,
            width:"100%", height:"100%",
            objectFit:"cover",
            objectPosition: mobile ? "center center" : "center right",
            zIndex:0,
            transform:"translateZ(0)",
            willChange:"transform",
            backfaceVisibility:"hidden",
          }}
        >
          <source src="https://wjwrbcw7qoosooaa.public.blob.vercel-storage.com/Untitled%20%282%29.mp4" type="video/mp4" />
          {/* Fallback image shown if video fails to load */}
          <div style={{
            position:"absolute", inset:0,
            backgroundImage:"url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/22_0000716_000_N5_medium-m4fS8AmlXfInTVjcQUVXfg6kpNJxsd.jpg')",
            backgroundSize:"cover", backgroundPosition:"center right",
          }}/>
        </video>
        {/* Gradient overlay — photo shows through on both sides, text area darkened */}
        <div style={{
          position:"absolute",
          inset:0,
          background: mobile
            ? "linear-gradient(180deg, rgba(30,32,34,0.88) 0%, rgba(30,32,34,0.78) 50%, rgba(30,32,34,0.65) 100%)"
            : "linear-gradient(90deg, rgba(30,32,34,0.82) 0%, rgba(30,32,34,0.68) 40%, rgba(30,32,34,0.32) 62%, rgba(30,32,34,0.06) 82%, transparent 100%)",
          zIndex:1,
        }}/>


        {/* Hero copy */}
        <div style={{ maxWidth: mobile ? "100%" : "55vw", position:"relative", zIndex:3 }}>
          <div style={{ ...fade(heroIn,0.15), fontFamily:"'Poppins',sans-serif",
            fontSize: mobile ? "0.6rem" : "0.65rem", fontWeight:600,
            letterSpacing:"0.22em", textTransform:"uppercase", color:"#00BADC", marginBottom:"1rem" }}>
            Amenity Sprint — Rapid Concept Design
          </div>
          <h1 style={{ ...fade(heroIn,0.25), fontFamily:"'Poppins',sans-serif", fontWeight:800,
            fontSize: mobile ? "clamp(2.2rem,9vw,3rem)" : "clamp(2.8rem,5.5vw,5.5rem)",
            lineHeight:1.08, color:"#fff", marginBottom:"1rem" }}>
            Every asset has<br/><span style={{ color:"#00BADC" }}>a better version.</span>
          </h1>
          <p style={{ ...fade(heroIn,0.38), fontFamily:"'Poppins',sans-serif",
            fontSize: mobile ? "0.88rem" : "clamp(0.9rem,1.4vw,1.05rem)",
            fontWeight:300, color:"rgba(255,255,255,0.5)", lineHeight:1.8,
            maxWidth: mobile ? "100%" : 520, marginBottom: mobile ? "2rem" : "2.75rem" }}>
            NELSON Asset Strategy delivers a full amenity concept — competitive analysis, programming, design language, and visualization — in 2 to 6 weeks. At a price point built for ownership decisions.
          </p>



          <div style={{ ...fade(heroIn,0.48), display:"flex", gap:"0.75rem", flexWrap:"wrap" }}>
            <button onClick={()=>scrollTo("approach")} style={{ background:"#00BADC", border:"none", cursor:"pointer",
              fontFamily:"'Poppins',sans-serif", fontSize: mobile?"0.78rem":"0.78rem", fontWeight:600, color:"#fff",
              padding: mobile?"0.8rem 1.6rem":"0.875rem 2rem", borderRadius:4, transition:"background 0.2s" }}
              onMouseOver={e=>e.currentTarget.style.background="#009abb"}
              onMouseOut={e=>e.currentTarget.style.background="#00BADC"}
            >See the Approach</button>
            <button onClick={()=>scrollTo("projects")} style={{ background:"transparent",
              border:"1px solid rgba(255,255,255,0.2)", cursor:"pointer",
              fontFamily:"'Poppins',sans-serif", fontSize:"0.78rem", fontWeight:500,
              color:"rgba(255,255,255,0.8)", padding: mobile?"0.8rem 1.6rem":"0.875rem 2rem", borderRadius:4,
              transition:"border-color 0.2s, color 0.2s" }}
              onMouseOver={e=>{e.currentTarget.style.borderColor="#00BADC";e.currentTarget.style.color="#00BADC"}}
              onMouseOut={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.2)";e.currentTarget.style.color="rgba(255,255,255,0.8)"}}
            >View Projects</button>
          </div>

          {/* Stats row */}
          <div style={{ ...fade(heroIn,0.58),
            display:"grid",
            gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4,auto)",
            gap: mobile ? "1.25rem 2rem" : "0 2.5rem",
            marginTop: mobile ? "2.5rem" : "3.5rem",
            paddingTop: mobile ? "2rem" : "2rem",
            borderTop:"1px solid rgba(255,255,255,0.07)" }}>
            {[["10+","Completed Sprints"],["5","Markets"],["2–6 wks","Turnaround"],["S–XL","Scalable Scope"]].map(([n,l])=>(
              <div key={l}>
                <div style={{ fontFamily:"'Poppins',sans-serif", fontSize: mobile?"1.2rem":"1.4rem",
                  fontWeight:800, color:"#fff", lineHeight:1 }}>{n}</div>
                <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem", fontWeight:400,
                  color:"rgba(255,255,255,0.3)", marginTop:4, letterSpacing:"0.04em" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div style={{ background:"#2a2d30", padding:"1.1rem 0", overflow:"hidden", borderTop:"1px solid rgba(255,255,255,0.06)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex", gap:"1.5rem", animation:"marquee 50s linear infinite", whiteSpace:"nowrap", width:"max-content" }}>
          {[...Array(3)].map((_,r)=>(
            [
              {name:"Amenity Sprint", icon:"M13 10V3L4 14h7v7l9-11h-7z"},
              {name:"Lobby Activation", icon:"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"},
              {name:"Roof Deck Concept", icon:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"},
              {name:"Tenant Lounge", icon:"M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"},
              {name:"Building Reposition", icon:"M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"},
              {name:"Campus Study", icon:"M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"},
              {name:"Competitive Analysis", icon:"M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"},
              {name:"Design Language", icon:"M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"},
              {name:"Visualization", icon:"M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"},
              {name:"Floor Plans", icon:"M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"},
            ].map((item,i)=>(
              <span key={`${r}-${i}`} style={{ 
                fontFamily:"'Poppins',sans-serif", 
                fontSize:"0.6rem", 
                fontWeight:600, 
                letterSpacing:"0.12em", 
                textTransform:"uppercase", 
                color:"#fff",
                background:"rgba(0,186,220,0.12)",
                padding:"0.45rem 1rem 0.45rem 0.7rem",
                borderRadius:99,
                border:"1px solid rgba(0,186,220,0.3)",
                display:"inline-flex",
                alignItems:"center",
                gap:"0.5rem",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00BADC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon}/>
                </svg>
                {item.name}
              </span>
            ))
          ))}
        </div>
      </div>

      {/* ── JOURNEY TIMELINE ── */}
      <LandingJourneySection />

      {/* ��─ TIERS ── */}
      <section id="approach-tiers" style={{
        backgroundImage:"url('https://wjwrbcw7qoosooaa.public.blob.vercel-storage.com/FSS.jpeg')",
        backgroundSize:"cover", backgroundPosition:"center",
        overflow:"hidden", position:"relative",
      }}>
        {/* Gradient overlay — dark on text side, very light on card side */}
        <div style={{
          position:"absolute", inset:0, zIndex:0,
          background: mobile
            ? "linear-gradient(180deg, rgba(20,22,24,0.75) 0%, rgba(20,22,24,0.55) 100%)"
            : "linear-gradient(90deg, rgba(20,22,24,0.94) 0%, rgba(20,22,24,0.8) 34%, rgba(20,22,24,0.22) 58%, rgba(20,22,24,0.04) 100%)",
        }}/>
        <div ref={tierRef} style={{
          display:"flex", flexDirection: mobile ? "column" : "row",
          alignItems:"stretch",
          minHeight: mobile ? "auto" : "100vh",
          position:"relative", zIndex:1,
        }}>
          {/* Left: text panel — vertically centered */}
          <div style={{
            flexShrink:0,
            width: mobile ? "100%" : "34vw",
            padding: mobile ? "4rem 5vw 2.5rem" : "0 5vw 0 6vw",
            display:"flex", flexDirection:"column", justifyContent:"center",
          }}>
            <div style={{ ...fade(tierVis,0), fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem",
              fontWeight:600, letterSpacing:"0.2em", textTransform:"uppercase",
              color:"#00BADC", marginBottom:"1rem" }}>Scalable Scope</div>
            <h2 style={{ ...fade(tierVis,0.1), fontFamily:"'Poppins',sans-serif", fontWeight:800,
              fontSize: mobile?"clamp(2rem,7vw,2.8rem)":"clamp(2rem,3.2vw,3rem)",
              lineHeight:1.1, color:"#fff", marginBottom:"1.25rem" }}>
              One size<br/>never fits all.
            </h2>
            <p style={{ ...fade(tierVis,0.2), fontFamily:"'Poppins',sans-serif", fontSize:"0.88rem",
              fontWeight:400, color:"rgba(255,255,255,0.55)", lineHeight:1.85, maxWidth:320 }}>
              Our S / M / L / XL framework matches scope to your asset, budget, and timeline.
            </p>
          </div>

          {/* Right: 2×2 card grid — fills full height */}
          <div style={{ ...fade(tierVis,0.12),
            flex:1,
            display:"grid", gridTemplateColumns:"1fr 1fr",
            gridTemplateRows:"1fr 1fr",
            gap: mobile ? "0.875rem" : "1rem",
            padding: mobile ? "0 5vw 4rem" : "3rem 3vw 3rem 1.5vw",
            alignItems:"stretch",
          }}>
            {TIERS.map((t,i)=>(
              <SprintTier key={t.label} tier={t} active={activeTier===i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SPRINT PROCESS ── */}
      <SprintProcessSection />

      {/* ── PROJECTS ── */}
      <section id="projects" style={{
        padding: mobile?"4rem 4vw 5rem":"6rem 5vw 7rem",
        background:"#1e2022",
        position:"relative",
      }}>
        {/* Noise texture */}
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
          backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")" }}/>
        <div style={{ maxWidth:"100%", margin:"0 auto", position:"relative", zIndex:1 }}>
          <div ref={projRef} style={{ display:"flex", justifyContent:"space-between",
            alignItems: mobile?"flex-start":"flex-end",
            flexDirection: mobile?"column":"row",
            gap:"1.25rem", marginBottom:"2.75rem" }}>
            <div>
              <div style={{ ...fade(projVis,0), fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem", fontWeight:600,
                letterSpacing:"0.2em", textTransform:"uppercase", color:"#00BADC", marginBottom:"0.6rem" }}>Sprint Portfolio</div>
              <h2 style={{ ...fade(projVis,0.1), fontFamily:"'Poppins',sans-serif", fontWeight:800,
                fontSize: mobile?"clamp(1.7rem,6vw,2.2rem)":"clamp(1.8rem,3vw,2.5rem)", color:"#fff" }}>
                10 Sprints. 5 Markets.
              </h2>
            </div>
            <div style={{ ...fade(projVis,0.15), display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
              {["ALL","S","M","L","XL"].map(f=>{
                const fc = f==="S"?"#18988B":f==="M"?"#00BADC":f==="L"?"#FF7F40":f==="XL"?"#4C0049":null;
                return (
                  <button key={f} onClick={()=>setFilterSize(f)} style={{
                    background: filterSize===f ? (fc||"#fff") : "rgba(255,255,255,0.06)",
                    border: filterSize===f ? "none" : "1px solid rgba(255,255,255,0.1)",
                    color: filterSize===f ? "#fff" : "rgba(255,255,255,0.5)",
                    fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem", fontWeight:600,
                    letterSpacing:"0.1em", textTransform:"uppercase",
                    padding:"0.35rem 0.9rem", borderRadius:99, cursor:"pointer", transition:"all 0.2s",
                    boxShadow: filterSize===f && fc ? `0 0 12px ${fc}55` : "none",
                  }}>{f==="ALL"?"All":f}</button>
                );
              })}
            </div>
          </div>
          <div style={{ display:"grid",
            gridTemplateColumns: mobile ? "1fr" : "repeat(4, 1fr)",
            gap:"1.25rem" }}>
            {filteredProjects.map((p,i)=><ProjectCard key={p.slug} p={p} delay={mobile?0:0.05*(i%4)}/>)}
          </div>
          <div style={{ marginTop:"1.75rem", fontFamily:"'Poppins',sans-serif", fontSize:"0.65rem",
            fontWeight:400, color:"rgba(255,255,255,0.22)", textAlign:"center", letterSpacing:"0.05em" }}>
            {mobile ? "Tap any project to see sprint deliverables." : "Hover any project to see deliverables — click to view the full case study."}
          </div>
        </div>
      </section>

      {/* ── DELIVERABLES ── */}
      <section id="deliverables" style={{ padding: mobile?"4rem 5vw":"8rem 6vw", background:C.bgSection }}>
        <div ref={delivRef} style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{
            display:"grid",
            gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
            gap: mobile ? "2.5rem" : "6rem",
            alignItems:"center"
          }}>
            <div>
              <div style={{ ...fade(delivVis,0), fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem", fontWeight:600,
                letterSpacing:"0.2em", textTransform:"uppercase", color:"#00BADC", marginBottom:"1rem" }}>What You Receive</div>
              <h2 style={{ ...fade(delivVis,0.1), fontFamily:"'Poppins',sans-serif", fontWeight:800,
                fontSize: mobile?"clamp(1.7rem,6vw,2.2rem)":"clamp(1.8rem,3vw,2.5rem)",
                color:"#fff", lineHeight:1.2, marginBottom:"1.25rem" }}>
                Visual assets<br/>that tell stories.
              </h2>
              <p style={{ ...fade(delivVis,0.2), fontFamily:"'Poppins',sans-serif", fontSize:"0.88rem",
                fontWeight:300, color:C.textDim, lineHeight:1.8, marginBottom:"2rem" }}>
                Every sprint delivers fully developed design concepts your team can use immediately — not wireframes or rough sketches.
              </p>
              <div style={{ ...fade(delivVis,0.28), display:"flex", flexDirection:"column" }}>
                {[
                  { icon:"▣", label:"Annotated Floor Plans", desc:"Programmatic zones, adjacencies, and activation areas." },
                  { icon:"◈", label:"3D Renderings", desc:"Photorealistic perspectives that make the vision real." },
                  { icon:"◆", label:"Axonometric Views", desc:"Bird's-eye diagrams showing how the space lives." },
                  { icon:"◉", label:"Design Language", desc:"Materials, mood, and the spatial narrative behind every decision." },
                  { icon:"▷", label:"Animation (select tiers)", desc:"Walkthrough video for board presentations and broker tours." },
                  { icon:"⬡", label:"360° Tours (select tiers)", desc:"Immersive virtual experiences for remote stakeholders." },
                ].map((d,i)=>(
                  <div key={i} style={{ ...fade(delivVis,0.3+i*0.06),
                    display:"flex", gap:"0.875rem", alignItems:"flex-start",
                    padding:"0.875rem 0", borderBottom:`1px solid ${C.border}` }}>
                    <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.85rem", color:"#00BADC", flexShrink:0, marginTop:2 }}>{d.icon}</span>
                    <div>
                      <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.85rem", fontWeight:600, color:"#fff" }}>{d.label}</div>
                      <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.75rem", fontWeight:300, color:C.textDim, marginTop:2 }}>{d.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Image grid — hidden on mobile to avoid clutter, shown on desktop */}
            {!mobile && (
              <div style={{ ...fade(delivVis,0.2), display:"flex", flexDirection:"column", gap:"1rem" }}>
                <ImgPlaceholder label="3D Rendering — Interior Perspective" aspectRatio="4/3"/>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                  <ImgPlaceholder label="Axon / Floor Plan" aspectRatio="1/1"/>
                  <ImgPlaceholder label="Design Language Board" aspectRatio="1/1"/>
                </div>
                <ImgPlaceholder label="Animation / 360 Tour Still" aspectRatio="16/7"/>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── MEET THE LEAD ── */}
      <MeetTheLeadSection />

      {/* ── TESTIMONIALS ── */}
      <TestimonialsSection />

      {/* ── CTA ── */}
      <section id="contact" style={{
        padding: mobile?"5rem 5vw":"9rem 6vw",
        background:"linear-gradient(135deg,#00BADC 0%,#0083b5 100%)",
        position:"relative", overflow:"hidden"
      }}>
        <div style={{ position:"absolute", inset:0,
          backgroundImage:"linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)",
          backgroundSize:"48px 48px", pointerEvents:"none" }}/>
        <div ref={ctaRef} style={{ maxWidth:700, margin:"0 auto", textAlign:"center", position:"relative", zIndex:1 }}>
          <div style={{ ...fade(ctaVis,0), fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem", fontWeight:600,
            letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(255,255,255,0.6)", marginBottom:"1.25rem" }}>
            Start a Sprint
          </div>
          <h2 style={{ ...fade(ctaVis,0.1), fontFamily:"'Poppins',sans-serif", fontWeight:800,
            fontSize: mobile?"clamp(1.8rem,7vw,2.5rem)":"clamp(2rem,4vw,3.5rem)",
            color:"#fff", lineHeight:1.15, marginBottom:"1.25rem" }}>
            Ready to reposition<br/>your asset?
          </h2>
          <p style={{ ...fade(ctaVis,0.2), fontFamily:"'Poppins',sans-serif",
            fontSize: mobile?"0.88rem":"0.95rem", fontWeight:300,
            color:"rgba(255,255,255,0.8)", lineHeight:1.8, marginBottom:"2.25rem" }}>
            Tell us your building address and your challenge. We'll scope the right sprint and have a concept in your hands in 2–6 weeks.
          </p>
          <div style={{ ...fade(ctaVis,0.3), display:"flex", gap:"0.875rem",
            justifyContent:"center", flexDirection: mobile?"column":"row", alignItems:"center" }}>
            <button style={{ background:"#fff", border:"none", cursor:"pointer",
              fontFamily:"'Poppins',sans-serif", fontSize:"0.82rem", fontWeight:700,
              color:"#000", padding:"1rem 2.5rem", borderRadius:4,
              width: mobile?"100%":"auto", transition:"transform 0.2s, box-shadow 0.2s" }}
              onMouseOver={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.18)"}}
              onMouseOut={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none"}}
            >Begin a Conversation</button>
            <button style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.4)", cursor:"pointer",
              fontFamily:"'Poppins',sans-serif", fontSize:"0.82rem", fontWeight:600,
              color:"#fff", padding:"1rem 2.5rem", borderRadius:4,
              width: mobile?"100%":"auto", transition:"border-color 0.2s" }}
              onMouseOver={e=>e.currentTarget.style.borderColor="#fff"}
              onMouseOut={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.4)"}
            >Download Capabilities</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:C.bgFooter, padding: mobile?"3rem 5vw 2.5rem":"4rem 6vw 2.5rem" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{
            display:"grid",
            gridTemplateColumns: mobile ? "1fr 1fr" : "2fr 1fr 1fr 1fr",
            gap: mobile ? "2rem" : "3rem",
            paddingBottom:"2.5rem",
            borderBottom:`1px solid ${C.border}`
          }}>
            {/* Brand block — full width on mobile */}
            <div style={{ gridColumn: mobile?"1 / -1":"auto" }}>
              <img 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NELSON_whiteBlueFin-BHENwe28ggL1i46CvcW16xy4UDxTTw.png" 
                alt="NELSON" 
                style={{ height: 24, width: "auto", marginBottom:"0.875rem" }}
              />
              <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.68rem", fontWeight:500,
                color:"rgba(255,255,255,0.25)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"0.875rem" }}>
                Asset Strategy &amp; Repositioning
              </div>
              <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.78rem", fontWeight:300,
                color:"rgba(255,255,255,0.28)", lineHeight:1.7, maxWidth:300 }}>
                A design and real estate consultancy focused on eliminating vacancy, retaining tenants, and making buildings more market competitive.
              </p>
            </div>
            {[
              { heading:"Practice", links:["Asset Strategy","Building Repositioning","Tenant Planning","Space Management"] },
              { heading:"Markets", links:["Minneapolis","Chicago","Atlanta","Philadelphia","Boston"] },
              mobile ? null :
              { heading:"Sprint Scope", links:["S — Targeted","M — Strategic","L — Comprehensive","XL — Transformative"] },
            ].filter(Boolean).map(col=>(
              <div key={col.heading}>
                <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem", fontWeight:600,
                  letterSpacing:"0.18em", textTransform:"uppercase", color:"#00BADC", marginBottom:"1.1rem" }}>{col.heading}</div>
                {col.links.map(l=>(
                  <div key={l} style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.78rem", fontWeight:300,
                    color:"rgba(255,255,255,0.38)", marginBottom:"0.5rem" }}>{l}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
            paddingTop:"1.75rem", flexWrap:"wrap", gap:"1rem" }}>
            <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.65rem", fontWeight:300, color:"rgba(255,255,255,0.18)" }}>
              © 2025 NELSON Worldwide · Asset Strategy Practice
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#00BADC", animation:"pulseDot 2.4s infinite" }}/>
              <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem", fontWeight:500,
                letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(255,255,255,0.2)" }}>Practice Active</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

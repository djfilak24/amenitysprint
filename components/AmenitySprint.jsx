"use client";

import { useState, useEffect, useRef } from "react";

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
    background:"linear-gradient(135deg,#1a1a1a 0%,#2a2a2a 50%,#1a1a1a 100%)",
    borderRadius:"0.5rem", display:"flex", flexDirection:"column",
    alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", ...style
  }}>
    <div style={{ position:"absolute", inset:0,
      backgroundImage:"linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",
      backgroundSize:"32px 32px" }}/>
    {[["0","0"],["0","auto"],["auto","0"],["auto","auto"]].map(([t,b],i) => (
      <div key={i} style={{
        position:"absolute",
        top:t==="0"?12:"auto", bottom:b==="auto"?12:"auto",
        left:i<2?12:"auto", right:i>=2?12:"auto",
        width:16, height:16,
        borderTop:t==="0"?"1.5px solid rgba(0,186,220,0.4)":"none",
        borderBottom:b==="auto"?"1.5px solid rgba(0,186,220,0.4)":"none",
        borderLeft:i<2?"1.5px solid rgba(0,186,220,0.4)":"none",
        borderRight:i>=2?"1.5px solid rgba(0,186,220,0.4)":"none",
      }}/>
    ))}
    <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem", fontWeight:500,
      letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(255,255,255,0.2)", textAlign:"center", padding:"0 1rem" }}>
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
                    maxHeight: i === activeStep ? "6rem" : "0",
                    overflow:"hidden", transition:"max-height 0.4s ease" }}>{s.desc}</div>
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
                  maxHeight: i === activeStep ? "6rem" : "2.8rem",
                  overflow:"hidden", transition:"max-height 0.4s ease" }}>{s.desc}</div>
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
                        lineHeight:1.75, transition:"color 0.3s",
                        maxHeight:activeCard===i?"6rem":"3.2rem", overflow:"hidden",
                        transitionProperty:"color, max-height", transitionDuration:"0.3s, 0.4s" }}>{s.body}</div>
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

// ── PROJECTS DATA ────────────────────────────────────────────────────────────
const PROJECTS = [
  { id:1, slug:"zna-hq",            tag:"Campus & Master Plan",  name:"ZNA HQ BUILDING",    city:"Chicago, IL",      duration:"6 Weeks",   investment:"$12K–$14K", type:"The Sculpture in the Park · Campus Reposition",deliverables:["Base Scheme","Alternate Plans","Signage Study","Conference Center"],       img:"https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image.png-3tVTOHYMNTjMaF04lEslNvttObsczE.jpeg",  size:"L" },
  { id:2, slug:"cbre-concourse",     tag:"Building Reposition",  name:"CBRE CONCOURSE",     city:"Atlanta, GA",      duration:"2.5 Weeks", investment:"$5K–$8K",   type:"Lobby Activation · Modular Trellis System",   deliverables:["Construction Docs","Floor Plan","Demolition Plan","Renderings"],          img:"https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image.png-glrIqPS69Tknu73CvN3HyEvXpjmqL0.jpeg",  size:"M" },
  { id:3, slug:"50-south-sixth",     tag:"Building Reposition",  name:"50 SOUTH SIXTH ST.", city:"Minneapolis, MN",  duration:"6 Weeks",   investment:"$2K–$4K",   type:"Atrium Redesign · 5-Step Reposition",         deliverables:["Renderings","Material Palette","Floor Plans","360 Tour"],                 img:"https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image.png-5FbHwo7bDssQx82qA5OErzhvk0jOni.jpeg",  size:"S" },
  { id:4, slug:"two22-tower",        tag:"Building Reposition",  name:"TWO22 TOWER",        city:"Minneapolis, MN",  duration:"2 Weeks",   investment:"$5K–$8K",   type:"2nd Floor Connection · Tenant Lounge",        deliverables:["Renderings","Floor Plans","Storytelling Mockup","Animation"],             img:"https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image.png-oh4A18thJrrAjfLmhvM5C4TJzZsfq3.jpeg",  size:"M" },
  { id:5, slug:"boston-experience",  tag:"Building Reposition",  name:"BOSTON EXPERIENCE",  city:"Boston, MA",       duration:"2.5 Weeks", investment:"$8K–$10K",  type:"Exhibit Zoning · Site Activation",            deliverables:["Site Analysis","Exhibit Zoning","Egress Plan","Activation Strategy"],     img:"https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image.png-oh8dzCX4ZfHFea8mF094IxEXuDAmT1.jpeg",  size:"M" },
  { id:6, slug:"55-west-monroe",     tag:"Building Reposition",  name:"55 WEST MONROE",     city:"Chicago, IL",      duration:"4 Weeks",   investment:"$12K–$15K", type:"The Urban Eddy · Ground Floor Lobby",         deliverables:["Axonometric Plan","Floor Plan","Explorations","Animation"],               img:"https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image.png-YS9pTq3PGeOOm9zXBQIrbKr9BXQp83.jpeg",  size:"L" },
  { id:7, slug:"crest-ridge",        tag:"Single-to-Multi Tenant",name:"CREST RIDGE",       city:"Minnetonka, MN",   duration:"6 Months",  investment:"$3K–$6K",   type:"Agile Planning · Tenant Strategy",            deliverables:["Stacking Plans","Agile Timeline","Comp Analysis","Dashboard"],            img:"https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image.png-KcuP5TSelDQyQamU5IP3CHQTaD6bIM.jpeg",  size:"S" },
  { id:8, slug:"golden-hills",       tag:"Building Reposition",  name:"GOLDEN HILLS",       city:"Minneapolis, MN",  duration:"3 Weeks",   investment:"$2K–$4K",   type:"Concept Design · Finish Palette",             deliverables:["Concept Plan","Finish Palette","Sketches","360 Tour"],                    img:"https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image.png-p0LyzpBiXl3uSl3ERNXt8c7R2qP0bf.jpeg",  size:"S" },
  { id:9, slug:"1500-spring-garden", tag:"Building Reposition",  name:"1500 SPRING GARDEN", city:"Philadelphia, PA", duration:"3 Weeks",   investment:"$8K–$10K",  type:"Rooftop Activation · Garden Courtyard",       deliverables:["Rooftop Plan","Exterior Study","Entry Sequence","Analysis"],              img:"https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image.png-3Reb5Y0KBRbojqzyrWQEqzk9wJlJeg.jpeg",  size:"M" },
  ];

const SIZE_CONFIG = {
  S:{ label:"S", name:"Targeted", color:"#18988B" },
  M:{ label:"M", name:"Strategic", color:"#00BADC" },
  L:{ label:"L", name:"Comprehensive", color:"#FF7F40" },
  XL:{ label:"XL", name:"Transformative", color:"#4C0049" },
};

const ProjectCard = ({ p, delay }) => {
  const [ref, visible] = useScrollReveal(0.05);
  const [hovered, setHovered] = useState(false);
  const sz = SIZE_CONFIG[p.size];
  return (
    <a ref={ref} href={`/projects/${p.slug}`}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{
        display:"block", textDecoration:"none",
        background:"#fff",
        border:`1px solid ${hovered ? "rgba(0,0,0,0.14)" : "rgba(0,0,0,0.07)"}`,
        borderRadius:"1.25rem",
        overflow:"hidden",
        opacity:visible?1:0, transform:visible?(hovered?"translateY(-4px)":"translateY(0)"):"translateY(24px)",
        transition:`opacity 0.7s ease ${delay}s, transform 0.5s ease, box-shadow 0.4s ease, border-color 0.3s ease`,
        boxShadow:hovered
          ? `0 20px 50px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)`
          : "0 3px 14px rgba(0,0,0,0.07)",
      }}>
<div style={{ position:"relative", overflow:"hidden" }}>
  {/* Widescreen 16:9 thumbnail */}
  <div style={{ width:"100%", aspectRatio:"16/9", position:"relative" }}>
    <img
      src={p.img}
      alt={p.name}
      style={{
        width:"100%",
        height:"100%",
        objectFit:"cover",
        objectPosition:"top center",
        transition:"transform 0.55s ease",
        transform: hovered ? "scale(1.04)" : "scale(1)",
        display:"block",
      }}
    />
    {/* Subtle gradient overlay for contrast */}
    <div style={{
      position:"absolute", inset:0,
      background:"linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.18) 100%)",
      pointerEvents:"none",
    }}/>
  </div>
        <div style={{
          position:"absolute", inset:0, background:"rgba(0,0,0,0.88)",
          opacity:hovered?1:0, transition:"opacity 0.35s ease",
          display:"flex", flexDirection:"column", justifyContent:"center", padding:"1.5rem",
        }}>
          <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem", fontWeight:600,
            letterSpacing:"0.18em", textTransform:"uppercase", color:"#00BADC", marginBottom:"0.75rem" }}>
            Deliverables
          </div>
          {p.deliverables.map((d,i) => (
            <div key={i} style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.78rem", fontWeight:400,
              color:"rgba(255,255,255,0.85)", paddingBottom:"0.4rem",
              borderBottom:"1px solid rgba(255,255,255,0.07)", marginBottom:"0.4rem",
              display:"flex", alignItems:"center", gap:"0.5rem" }}>
              <span style={{ width:4,height:4,borderRadius:"50%",background:"#00BADC",flexShrink:0,display:"inline-block" }}/>
              {d}
            </div>
          ))}
        </div>
        <div style={{ position:"absolute", top:12, right:12, background:sz.color, color:"#fff",
          fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem", fontWeight:700,
          letterSpacing:"0.1em", textTransform:"uppercase", padding:"0.2rem 0.6rem", borderRadius:99 }}>
          {sz.label}
        </div>
      </div>
      <div style={{ padding:"1.1rem 1.4rem 1.4rem" }}>
        <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.58rem", fontWeight:600,
          letterSpacing:"0.16em", textTransform:"uppercase", color:"#aaa", marginBottom:"0.3rem" }}>{p.tag}</div>
        <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"1.05rem", fontWeight:700,
          color:"#0a0a0a", lineHeight:1.2, marginBottom:"0.3rem" }}>{p.name}</div>
        <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.73rem", fontWeight:400,
          color:"#777", marginBottom:"0.9rem", lineHeight:1.5 }}>{p.type}</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end",
          borderTop:"1px solid rgba(0,0,0,0.06)", paddingTop:"0.8rem" }}>
          <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.58rem", fontWeight:600,
            textTransform:"uppercase", letterSpacing:"0.12em", color:"#bbb" }}>{p.city}</div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.82rem", fontWeight:700,
              color:"#111", lineHeight:1 }}>{p.investment}</div>
            <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem", fontWeight:400,
              color:"#bbb", marginTop:"0.15rem" }}>{p.duration}</div>
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

const SprintTier = ({ tier, active, onClick }) => {
  const sz = SIZE_CONFIG[tier.label];
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        position:"relative", borderRadius:"1.5rem", overflow:"hidden",
        border:active?`2px solid ${sz.color}`:"1px solid rgba(0,0,0,0.08)",
        background:"#fff", cursor:"pointer",
        transition:"box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease",
        boxShadow: active
          ? `0 12px 40px ${sz.color}44, 0 2px 12px rgba(0,0,0,0.12)`
          : hov ? "0 8px 28px rgba(0,0,0,0.14)" : "0 2px 10px rgba(0,0,0,0.07)",
        transform: hov && !active ? "translateY(-3px)" : "none",
      }}>

      {/* Card background image – top portion */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, bottom:0,
        backgroundImage:`url(${tier.img})`,
        backgroundSize:"cover", backgroundPosition:"center top",
        filter:"brightness(0.88) saturate(0.85)",
      }}/>

      {/* Gradient: image visible at top → fades to white at bottom */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, bottom:0,
        background: active
          ? `linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.75) 45%, rgba(0,0,0,0.94) 100%)`
          : "linear-gradient(to bottom, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.0) 25%, rgba(255,255,255,0.65) 55%, rgba(255,255,255,1.0) 75%)",
      }}/>

      {/* Content layer */}
      <div style={{ position:"relative", zIndex:2, padding:"1.75rem 1.75rem 1.5rem" }}>
        {/* Header row */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"0.5rem" }}>
          <div style={{
            fontFamily:"'Poppins',sans-serif",
            fontSize: tier.label==="XL" ? "3.75rem" : "4.75rem",
            fontWeight:800, lineHeight:1, letterSpacing:"-0.03em",
            color: active ? sz.color : "rgba(255,255,255,0.88)",
            textShadow: active ? "none" : "0 2px 12px rgba(0,0,0,0.3)",
          }}>{tier.label}</div>
          <div style={{
            fontFamily:"'Poppins',sans-serif", fontSize:"0.58rem", fontWeight:700,
            letterSpacing:"0.14em", textTransform:"uppercase", marginTop:"0.35rem",
            color: active ? "#fff" : "rgba(255,255,255,0.9)",
            background: active ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.42)",
            padding:"0.25rem 0.65rem", borderRadius:99,
            backdropFilter:"blur(6px)",
          }}>{sz.name}</div>
        </div>

        {/* Spacer so text sits in white zone for inactive cards */}
        <div style={{ height: active ? "0.75rem" : "3.5rem" }}/>

        <div style={{
          fontFamily:"'Poppins',sans-serif", fontSize:"1rem", fontWeight:700,
          color:active?"#fff":"#000", marginBottom:"0.25rem",
        }}>{tier.range}</div>
        <div style={{
          fontFamily:"'Poppins',sans-serif", fontSize:"0.7rem", fontWeight:500,
          color:active?sz.color:"#888", marginBottom:"0.875rem",
        }}>{tier.weeks}</div>
        <div style={{
          fontFamily:"'Poppins',sans-serif", fontSize:"0.78rem", fontWeight:400,
          color:active?"rgba(255,255,255,0.65)":"#555", lineHeight:1.75,
        }}>{tier.desc}</div>
      </div>
    </div>
  );
};

// ── MAIN ──────────────────────────────��──────────────────────────────────────
export default function AmenitySprint() {
  const [scrolled, setScrolled] = useState(false);
  const [heroIn, setHeroIn] = useState(false);
  const [activeTier, setActiveTier] = useState(1);
  const [filterSize, setFilterSize] = useState("ALL");
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
  const filteredProjects = filterSize==="ALL" ? PROJECTS : PROJECTS.filter(p=>p.size===filterSize);

  return (
    <div style={{ fontFamily:"'Poppins',sans-serif", background:"#f7f7f7", color:"#000", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.7)}}
        @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#f7f7f7}::-webkit-scrollbar-thumb{background:#00BADC}
      `}</style>
      <NoiseOverlay />

      {/* ── NAV ── */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:1000,
        background:scrolled?"rgba(255,255,255,0.95)":"transparent",
        backdropFilter:scrolled?"blur(16px)":"none",
        borderBottom:scrolled?"1px solid rgba(0,0,0,0.07)":"1px solid transparent",
        transition:"all 0.4s ease",
        padding: mobile ? "0 5vw" : "0 4vw",
        height:64, display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NELSON_whiteBlueFin-BHENwe28ggL1i46CvcW16xy4UDxTTw.png"
          alt="NELSON"
          style={{ height: 24, width: "auto", transition: "filter 0.4s ease",
            filter: scrolled ? "brightness(0)" : "none" }}
        />
        {/* Mobile: just the CTA button */}
        {mobile ? (
          <button onClick={()=>scrollTo("contact")} style={{
            background:"#00BADC", border:"none", cursor:"pointer",
            fontFamily:"'Poppins',sans-serif", fontSize:"0.7rem", fontWeight:600, color:"#fff",
            padding:"0.5rem 1.1rem", borderRadius:4,
          }}>Start a Sprint</button>
        ) : (
          <div style={{ display:"flex", gap:"2rem", alignItems:"center" }}>
            {[["approach","Approach"],["projects","Projects"],["deliverables","Deliverables"]].map(([id,label])=>(
              <button key={id} onClick={()=>scrollTo(id)} style={{
                background:"none", border:"none", cursor:"pointer",
                fontFamily:"'Poppins',sans-serif", fontSize:"0.72rem", fontWeight:500,
                letterSpacing:"0.06em", color:scrolled?"#555":"rgba(255,255,255,0.8)", transition:"color 0.2s",
              }}
                onMouseOver={e=>e.target.style.color="#00BADC"}
                onMouseOut={e=>e.target.style.color=scrolled?"#555":"rgba(255,255,255,0.8)"}
              >{label}</button>
            ))}
            <button onClick={()=>scrollTo("contact")} style={{
              background:"#00BADC", border:"none", cursor:"pointer",
              fontFamily:"'Poppins',sans-serif", fontSize:"0.72rem", fontWeight:600, color:"#fff",
              padding:"0.55rem 1.4rem", borderRadius:4, transition:"background 0.2s",
            }}
              onMouseOver={e=>e.target.style.background="#009abb"}
              onMouseOut={e=>e.target.style.background="#00BADC"}
            >Start a Sprint</button>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight:"100dvh",
        display:"flex", flexDirection:"column",
        justifyContent: mobile ? "center" : "flex-end",
        padding: mobile ? "88px 5vw 5vh" : "0 6vw 10vh",
        position:"relative", overflow:"hidden",
      }}>
        {/* Full-bleed background image — masked below the separator bar */}
        <div style={{
          position:"absolute",
          inset:0,
          backgroundImage:"url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/22_0000716_000_N5_medium-m4fS8AmlXfInTVjcQUVXfg6kpNJxsd.jpg')",
          backgroundSize:"cover",
          backgroundPosition:"center right",
          zIndex:0,
          WebkitMaskImage:"linear-gradient(to bottom, transparent 0px, transparent 130px, black 175px)",
          maskImage:"linear-gradient(to bottom, transparent 0px, transparent 130px, black 175px)",
        }}/>
        {/* Gradient overlay - dark on left, revealing image on right */}
        <div style={{
          position:"absolute",
          inset:0,
          background: mobile 
            ? "linear-gradient(180deg, rgba(30,32,34,0.92) 0%, rgba(30,32,34,0.85) 50%, rgba(30,32,34,0.75) 100%)"
            : "linear-gradient(90deg, rgba(30,32,34,0.97) 0%, rgba(30,32,34,0.92) 35%, rgba(30,32,34,0.7) 55%, rgba(30,32,34,0.3) 75%, transparent 100%)",
          zIndex:1,
        }}/>
        {/* Subtle blur on left side for text readability */}
        <div style={{
          position:"absolute",
          top:0, left:0, bottom:0,
          width: mobile ? "100%" : "60%",
          backdropFilter:"blur(1px)",
          zIndex:1,
          pointerEvents:"none",
        }}/>

        {/* Desktop-only: top metadata bar */}
        {!mobile && (
          <div style={{ position:"absolute", top:80, left:"6vw", right:"6vw",
            display:"flex", justifyContent:"space-between", alignItems:"center",
            borderBottom:"1px solid rgba(255,255,255,0.12)", paddingBottom:"1rem", zIndex:3 }}>
            <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem", fontWeight:500,
              letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(255,255,255,0.4)" }}>
              Asset Strategy &amp; Repositioning
            </span>
            <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem", fontWeight:500,
              letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(255,255,255,0.4)" }}>
              Minneapolis · Chicago · Atlanta · Philadelphia · Boston
            </span>
          </div>
        )}

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
            Win the lease<br/><span style={{ color:"#00BADC" }}>before the pitch.</span>
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

      {/* ── SPRINT PROCESS ── */}
      <SprintProcessSection />

      {/* ��─ TIERS ── */}
      <section id="approach-tiers" style={{ 
        padding: mobile?"4rem 5vw":"7rem 6vw", 
        position:"relative",
        overflow:"hidden",
        minHeight: mobile ? "auto" : "90vh",
      }}>
        {/* Full-bleed background image */}
        <div style={{
          position:"absolute",
          inset:0,
          backgroundImage:"url('/images/tier-bg.jpg')",
          backgroundSize:"cover",
          backgroundPosition:"center",
          zIndex:0,
        }}/>
        {/* Gradient blur overlay */}
        <div style={{
          position:"absolute",
          inset:0,
          background:"linear-gradient(135deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.1) 100%)",
          backdropFilter:"blur(1px)",
          zIndex:1,
        }}/>
        <div ref={tierRef} style={{ maxWidth:1100, margin:"0 auto", position:"relative", zIndex:2 }}>
          <div style={{
            display:"grid",
            gridTemplateColumns: mobile ? "1fr" : "1fr 2fr",
            gap: mobile ? "2rem" : "5rem",
            alignItems:"start"
          }}>
            <div>
              <div style={{ ...fade(tierVis,0), fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem", fontWeight:600,
                letterSpacing:"0.2em", textTransform:"uppercase", color:"#00BADC", marginBottom:"1rem" }}>Scalable Scope</div>
              <h2 style={{ ...fade(tierVis,0.1), fontFamily:"'Poppins',sans-serif", fontWeight:800,
                fontSize: mobile?"clamp(1.7rem,6vw,2.2rem)":"clamp(1.8rem,3vw,2.5rem)",
                lineHeight:1.15, color:"#fff", marginBottom:"1rem" }}>
                One size<br/>never fits all.
              </h2>
              <p style={{ ...fade(tierVis,0.2), fontFamily:"'Poppins',sans-serif", fontSize:"0.85rem",
                fontWeight:300, color:"rgba(255,255,255,0.7)", lineHeight:1.8 }}>
                Our S / M / L / XL framework matches scope to your asset, budget, and timeline.
              </p>
            </div>
            <div style={{ ...fade(tierVis,0.15),
              display:"grid",
              gridTemplateColumns: mobile ? "1fr 1fr" : "1fr 1fr",
              gap:"0.875rem" }}>
              {TIERS.map((t,i)=>(
                <SprintTier key={t.label} tier={t} active={activeTier===i} onClick={()=>setActiveTier(i)}/>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section id="projects" style={{ padding: mobile?"4rem 5vw 5rem":"7rem 6vw 8rem", background:"#1e2022" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div ref={projRef} style={{ display:"flex", justifyContent:"space-between",
            alignItems: mobile?"flex-start":"flex-end",
            flexDirection: mobile?"column":"row",
            gap:"1.25rem", marginBottom:"2.5rem" }}>
            <div>
              <div style={{ ...fade(projVis,0), fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem", fontWeight:600,
                letterSpacing:"0.2em", textTransform:"uppercase", color:"#00BADC", marginBottom:"0.6rem" }}>Sprint Portfolio</div>
              <h2 style={{ ...fade(projVis,0.1), fontFamily:"'Poppins',sans-serif", fontWeight:800,
                fontSize: mobile?"clamp(1.7rem,6vw,2.2rem)":"clamp(1.8rem,3vw,2.5rem)", color:"#fff" }}>
                9 Studies. 5 Markets.
              </h2>
            </div>
            <div style={{ ...fade(projVis,0.15), display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
              {["ALL","S","M","L","XL"].map(f=>(
                <button key={f} onClick={()=>setFilterSize(f)} style={{
                  background:filterSize===f?"#000":"#fff",
                  border:filterSize===f?"1px solid #000":"1px solid #e0e0e0",
                  color:filterSize===f?"#fff":"#555",
                  fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem", fontWeight:600,
                  letterSpacing:"0.08em", textTransform:"uppercase",
                  padding:"0.35rem 0.85rem", borderRadius:99, cursor:"pointer", transition:"all 0.2s",
                }}>{f==="ALL"?"All":`${f}`}</button>
              ))}
            </div>
          </div>
          <div style={{ display:"grid",
            gridTemplateColumns: mobile ? "1fr" : "repeat(auto-fill,minmax(300px,1fr))",
            gap:"1.1rem" }}>
            {filteredProjects.map((p,i)=><ProjectCard key={p.id} p={p} delay={mobile?0:0.04*(i%4)}/>)}
          </div>
          {!mobile && (
            <div style={{ marginTop:"1rem", fontFamily:"'Poppins',sans-serif", fontSize:"0.7rem",
              fontWeight:400, color:"#aaa", textAlign:"center" }}>
              Hover over any project to see deliverables included in that sprint.
            </div>
          )}
          {mobile && (
            <div style={{ marginTop:"1rem", fontFamily:"'Poppins',sans-serif", fontSize:"0.7rem",
              fontWeight:400, color:"#aaa", textAlign:"center" }}>
              Tap any project card for deliverable details.
            </div>
          )}
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

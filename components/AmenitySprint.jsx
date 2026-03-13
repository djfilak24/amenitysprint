"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getAllProjects } from "@/lib/projects";

// Module-level scroll tracker — shared by all auto-cycling intervals.
// Updates a plain variable (no React state) to avoid re-renders during scroll.
let _isScrolling = false;
let _scrollPauseTimer;
if (typeof window !== "undefined") {
  window.addEventListener("scroll", () => {
    _isScrolling = true;
    clearTimeout(_scrollPauseTimer);
    _scrollPauseTimer = setTimeout(() => { _isScrolling = false; }, 220);
  }, { passive: true });
}

const NoiseOverlay = () => {
  const mobile = typeof window !== "undefined" && window.innerWidth < 768;
  // On mobile: CSS repeating dot pattern — zero per-frame cost vs feTurbulence SVG
  // which forces compositor re-render on every scroll frame in iOS Safari.
  if (mobile) {
    return (
      <div style={{
        position:"fixed", inset:0, zIndex:9999, pointerEvents:"none", opacity:0.035,
        backgroundImage:"radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
        backgroundSize:"3px 3px",
      }}/>
    );
  }
  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, pointerEvents:'none', opacity:0.025 }}>
      <svg width="100%" height="100%">
        <filter id="noise"><feTurbulence baseFrequency="0.65" numOctaves="4" stitchTiles="stitch"/></filter>
        <rect width="100%" height="100%" filter="url(#noise)"/>
      </svg>
    </div>
  );
};

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
  // Initialize synchronously from window to avoid a false→true hydration re-render
  // that would re-layout every section exactly when users start scrolling.
  const [mobile, setMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
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
      if (_isScrolling) return;
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
      if (_isScrolling) return;
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
      if (_isScrolling) return;
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

  // Mobile scroll progress bar — DOM refs only, zero React state during scroll
  const stepRefs = useRef([]);
  const progLineRef = useRef(null);
  const progDotsRef = useRef([]);

  // Desktop only: auto-advance timeline. On mobile all steps are always visible.
  useEffect(() => {
    if (!visible || mobile) return;
    const t = setInterval(() => { if (!_isScrolling) setActiveStep(s => (s + 1) % SPRINT_JOURNEY.length); }, 2800);
    return () => clearInterval(t);
  }, [visible, mobile]);

  // Mobile: IntersectionObserver per step — advances progress bar via DOM refs (no setState)
  useEffect(() => {
    if (!mobile || !visible) return;
    const observers = SPRINT_JOURNEY.map((s, i) => {
      const obs = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        const pct = ((i + 1) / SPRINT_JOURNEY.length) * 100;
        if (progLineRef.current) {
          progLineRef.current.style.width = `${pct}%`;
          progLineRef.current.style.background = `linear-gradient(90deg, #00BADC, ${s.color})`;
          progLineRef.current.style.boxShadow = `0 0 10px ${s.color}cc, 0 0 22px ${s.color}44`;
        }
        progDotsRef.current.forEach((dot, j) => {
          if (!dot) return;
          const active = j <= i;
          const current = j === i;
          dot.style.background = active ? SPRINT_JOURNEY[j].color : "rgba(255,255,255,0.1)";
          dot.style.border = `2px solid ${active ? SPRINT_JOURNEY[j].color : "rgba(255,255,255,0.15)"}`;
          dot.style.boxShadow = current ? `0 0 12px ${SPRINT_JOURNEY[j].color}cc` : "none";
          dot.style.transform = `translate(-50%,-50%) scale(${current ? 1.6 : active ? 1.1 : 1})`;
        });
      }, { threshold: 0.35, rootMargin: "-10% 0px -45% 0px" });
      if (stepRefs.current[i]) obs.observe(stepRefs.current[i]);
      return obs;
    });
    return () => observers.forEach(o => o.disconnect());
  }, [mobile, visible]);

  const phases = ["Sprint","Design","Build","Outcome"];
  const phaseColors = { Sprint:"#00BADC", Design:"#18988B", Build:"#FF7F40", Outcome:"#FFD53D" };

  return (
    <section style={{ padding: mobile ? "4rem 5vw" : "8rem 4vw", background:"#1e2022", position:"relative", overflow:"hidden" }}>
      {/* Subtle grid texture */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)",
        backgroundSize:"48px 48px" }}/>

      <div ref={ref} style={{ maxWidth:1400, margin:"0 auto", position:"relative" }}>

        {/* Header */}
        <div style={{ marginBottom: mobile ? "3rem" : "4rem" }}>
          <div style={{ opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(20px)",
            transition:"opacity 0.7s ease, transform 0.7s ease",
            fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem", fontWeight:600,
            letterSpacing:"0.22em", textTransform:"uppercase", color:"#00BADC", marginBottom:"1rem" }}>
            From Sketch to Keys
          </div>
          <h2 style={{ opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(20px)",
            transition:"opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
            fontFamily:"'Poppins',sans-serif", fontWeight:800,
            fontSize: mobile ? "clamp(1.7rem,7vw,2.2rem)" : "clamp(2rem,4vw,3rem)",
            color:"#fff", lineHeight:1.1, margin:0 }}>
            Concept to construction<br/>on a leasing timeline.
          </h2>
        </div>

        {/* Phase labels + progress track — desktop only */}
        {!mobile && (<>
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
              cursor:"pointer", transition:"width 0.3s ease, height 0.3s ease, background 0.3s ease", zIndex:2,
              boxShadow: i === activeStep ? `0 0 12px ${s.color}99` : "none",
            }}/>
          ))}
        </div>
        </>)}

        {/* Step cards */}
        {mobile ? (
          // Mobile: all steps fully visible, no cycling, no waiting.
          // Dots show phase colors; descriptions always shown.
          <>
          {/* Sticky scroll progress bar — advances via IntersectionObserver DOM refs */}
          <div style={{
            position:"sticky", top:58, zIndex:10,
            marginLeft:"-5vw", marginRight:"-5vw",
            marginBottom:"2.25rem",
            padding:"0.7rem 5vw 0.65rem",
            background:"rgba(30,32,34,0.94)",
            backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)",
            borderBottom:"1px solid rgba(255,255,255,0.07)",
          }}>
            {/* Track + dots */}
            <div style={{ position:"relative", height:2, background:"rgba(255,255,255,0.08)", margin:"0.3rem 0 0.55rem" }}>
              <div ref={progLineRef} style={{
                position:"absolute", left:0, top:0, height:"100%", width:"0%",
                background:"linear-gradient(90deg, #00BADC, #00BADC)",
                borderRadius:2,
                transition:"width 0.52s cubic-bezier(0.16,1,0.3,1), background 0.4s ease, box-shadow 0.4s ease",
              }}/>
              {SPRINT_JOURNEY.map((s, i) => (
                <div key={i} ref={el => { progDotsRef.current[i] = el; }} style={{
                  position:"absolute",
                  left:`${(i / (SPRINT_JOURNEY.length - 1)) * 100}%`,
                  top:"50%", transform:"translate(-50%,-50%) scale(1)",
                  width:8, height:8, borderRadius:"50%",
                  background:"rgba(255,255,255,0.1)",
                  border:"2px solid rgba(255,255,255,0.15)",
                  zIndex:2,
                  transition:"background 0.4s ease, box-shadow 0.4s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                }}/>
              ))}
            </div>
            {/* Labels row */}
            <div style={{ display:"flex", justifyContent:"space-between", gap:"0.25rem" }}>
              {SPRINT_JOURNEY.map((s, i) => (
                <div key={i} style={{
                  fontFamily:"'Poppins',sans-serif", fontSize:"0.38rem", fontWeight:600,
                  letterSpacing:"0.08em", textTransform:"uppercase",
                  color:"rgba(255,255,255,0.28)", lineHeight:1.2,
                  textAlign: i === 0 ? "left" : i === SPRINT_JOURNEY.length-1 ? "right" : "center",
                  flex:1, minWidth:0, overflow:"hidden",
                }}>{s.label.split(" ").slice(0,2).join(" ")}</div>
              ))}
            </div>
          </div>
          <div>
            {SPRINT_JOURNEY.map((s, i) => (
              <div key={i} ref={el => { stepRefs.current[i] = el; }} style={{
                display:"flex", gap:"1.1rem", paddingBottom:"1.75rem",
                position:"relative",
                opacity:visible?1:0,
                transition:`opacity 0.5s ease ${0.08+i*0.06}s`,
              }}>
                {i < SPRINT_JOURNEY.length - 1 && (
                  <div style={{ position:"absolute", left:13, top:28, bottom:0,
                    width:1, background:`${s.color}33` }}/>
                )}
                <div style={{ flexShrink:0, width:26, height:26, borderRadius:"50%",
                  background:"#1e2022", border:`2px solid ${s.color}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  position:"relative", zIndex:1 }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:s.color }}/>
                </div>
                <div style={{ paddingTop:2 }}>
                  <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.55rem", fontWeight:700,
                    letterSpacing:"0.16em", textTransform:"uppercase",
                    color:s.color, marginBottom:"0.2rem" }}>
                    {s.phase} · {s.week}
                  </div>
                  <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.85rem", fontWeight:700,
                    color:"#fff", marginBottom:"0.3rem" }}>{s.label}</div>
                  <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.74rem", fontWeight:300,
                    color:"rgba(255,255,255,0.45)", lineHeight:1.7 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          </>
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
    // Cycle once: 0 → 1 → 2, then stop. No infinite loop that fights the user.
    let advances = 0;
    const t = setInterval(() => {
      if (_isScrolling) return;
      if (advances >= 2) { clearInterval(t); return; }
      advances++;
      setActiveCard(c => (c + 1) % 3);
    }, 4000);
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
            transition:"opacity 0.7s ease, transform 0.7s ease",
            fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem", fontWeight:600,
            letterSpacing:"0.22em", textTransform:"uppercase", color:"#00BADC", marginBottom:"1rem" }}>
            The Sprint Process
          </div>
          <h2 style={{ opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(20px)",
            transition:"opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
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
                    borderRadius:2, flexShrink:0, transition:"width 0.35s ease, background 0.35s ease" }}/>
                  <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.95rem", fontWeight:700,
                    color:activeCard===i?"#fff":"rgba(255,255,255,0.45)", transition:"color 0.3s", flex:1 }}>{s.title}</div>
                  <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"1rem",
                    color:activeCard===i?s.color:"rgba(255,255,255,0.2)", transition:"color 0.3s", flexShrink:0 }}>
                    {activeCard===i ? "−" : "+"}
                  </div>
                </div>
                {/* CSS grid row transition — no DOM mount/unmount, no height jump */}
                <div style={{
                  display:"grid",
                  gridTemplateRows: activeCard===i ? "1fr" : "0fr",
                  transition:"grid-template-rows 0.42s cubic-bezier(0.16,1,0.3,1)",
                }}>
                  <div style={{ overflow:"hidden" }}>
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
                  </div>
                </div>
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
  { quote: "The Sprint process gave us the visual story we needed to walk into every broker meeting with conviction. First new tenant signed within 90 days of delivery.", name: "Sarah T.", title: "VP Asset Management", company: "Midwest REIT", color: "#00BADC" },
  { quote: "We'd been staring at the same lobby for three years. NELSON came in, ran the Sprint, and in four weeks we had a concept that ownership actually got excited about.", name: "David K.", title: "Principal", company: "CRE Capital Partners", color: "#18988B" },
  { quote: "The Amenity Matrix alone was worth the engagement. Understanding which interventions move the needle — and which don't — saved us from a very expensive mistake.", name: "Maria R.", title: "Director of Leasing", company: "Commercial Properties Group", color: "#FF7F40" },
];

// TestimonialsSection is merged into TiersAndTestimonialsSection (defined after TIERS data)

// ── SPRINT TEAM ───────────────────────────────────────────────────────────────
const DAVID_PHOTO_URL = "https://wjwrbcw7qoosooaa.public.blob.vercel-storage.com/David26%27.png";

const TEAM_MEMBERS = [
  {
    name:"David Filak",
    title:"Associate Principal",
    dept:"Asset Strategy · NELSON Worldwide",
    photo:DAVID_PHOTO_URL,
    bio:"I've run Amenity Sprints on 40-story Loop towers, suburban flex parks, and everything in between. The Sprint process exists because I was tired of watching owners spend six months deciding whether to spend $800K — when a $10K concept answers the question in four weeks.",
    stats:[["10+","Sprints Led"],["5","Markets"],["$400M+","Assets"]],
    color:"#00BADC",
    cta:{ label:"Schedule a Call", href:"https://app.hubspot.com/meetings/dfilak" },
  },
  { name:"Team Member", title:"Design Director", dept:"Architecture + Interiors", photo:null, bio:"Placeholder — add team member details here.", stats:[], color:"#18988B", cta:null },
  { name:"Team Member", title:"Project Lead", dept:"Design Strategy", photo:null, bio:"Placeholder — add team member details here.", stats:[], color:"#FF7F40", cta:null },
  { name:"Team Member", title:"Strategy Analyst", dept:"Market Research", photo:null, bio:"Placeholder — add team member details here.", stats:[], color:"#2979FF", cta:null },
];

const SprintTeamSection = () => {
  const mobile = useIsMobile();
  const [ref, visible] = useScrollReveal(0.06);
  const [featured, setFeatured] = useState(0);

  const next = () => setFeatured(f => (f + 1) % TEAM_MEMBERS.length);
  const f = TEAM_MEMBERS[featured];

  const fadeUp = (delay) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : (mobile ? "translateY(0)" : "translateY(20px)"),
    transition: mobile
      ? `opacity 0.6s ease ${delay}s`
      : `opacity 0.7s ease ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
  });

  return (
    <section style={{ background:"#0b0c0d", position:"relative", overflow:"hidden" }}>
      {/* Black grid lines */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)",
        backgroundSize:"60px 60px" }}/>
      {/* Subtle glow behind featured color */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        background:`radial-gradient(ellipse 55% 45% at 25% 55%, ${f.color}0c 0%, transparent 65%)`,
        transition:"background 0.7s ease" }}/>

      <div ref={ref} style={{ maxWidth:1400, margin:"0 auto", padding: mobile?"4rem 5vw 5rem":"7rem 4vw 6rem", position:"relative" }}>

        {/* Section heading */}
        <div style={{ marginBottom: mobile?"2.5rem":"3.5rem" }}>
          <div style={{ ...fadeUp(0), fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem", fontWeight:600,
            letterSpacing:"0.22em", textTransform:"uppercase", color:"#00BADC", marginBottom:"0.75rem" }}>
            AmenitySprint Team
          </div>
          <h2 style={{ ...fadeUp(0.08), fontFamily:"'Poppins',sans-serif", fontWeight:800,
            fontSize: mobile?"clamp(1.7rem,6vw,2.2rem)":"clamp(2rem,3vw,2.8rem)",
            color:"#fff", lineHeight:1.1, margin:0 }}>
            The people behind<br/>your sprint.
          </h2>
        </div>

        {/* Desktop: featured left + grid right */}
        {!mobile ? (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem", alignItems:"start" }}>

            {/* Featured card */}
            <div style={{ ...fadeUp(0.15), position:"relative", borderRadius:"2rem", overflow:"hidden",
              border:`1.5px solid ${f.color}44`, boxShadow:`0 24px 56px rgba(0,0,0,0.6), 0 0 40px ${f.color}14`,
              transition:"border-color 0.5s, box-shadow 0.5s",
              background:"rgba(255,255,255,0.03)" }}>
              {/* Accent bar */}
              <div style={{ height:3, background:f.color, boxShadow:`0 0 16px ${f.color}88` }}/>
              {/* Photo */}
              <div style={{ position:"relative", aspectRatio:"4/3", overflow:"hidden" }}>
                {f.photo ? (
                  <img src={f.photo} alt={f.name} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top", transition:"opacity 0.4s ease" }} key={featured}/>
                ) : (
                  <ImgPlaceholder label="Photo · Upload to Blob" aspectRatio="4/3" style={{ borderRadius:0 }}/>
                )}
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,transparent 50%,rgba(11,12,13,0.92) 100%)" }}/>
                {/* Name overlay at bottom of photo */}
                <div style={{ position:"absolute", bottom:"1.25rem", left:"1.5rem" }}>
                  <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"1.3rem", fontWeight:800,
                    color:"#fff", lineHeight:1.1 }}>{f.name}</div>
                  <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.7rem", fontWeight:400,
                    color:f.color, marginTop:"0.2rem" }}>{f.title}</div>
                </div>
              </div>
              {/* Content */}
              <div style={{ padding:"1.5rem" }}>
                <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.54rem", fontWeight:600,
                  letterSpacing:"0.14em", textTransform:"uppercase",
                  color:"rgba(255,255,255,0.25)", marginBottom:"0.85rem" }}>{f.dept}</div>
                <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.82rem", fontWeight:300,
                  color:"rgba(255,255,255,0.55)", lineHeight:1.8, marginBottom:"1.5rem",
                  transition:"opacity 0.4s ease" }} key={`bio-${featured}`}>{f.bio}</p>
                {f.stats.length > 0 && (
                  <div style={{ display:"flex", gap:"1.75rem", paddingTop:"1.25rem",
                    borderTop:"1px solid rgba(255,255,255,0.07)", marginBottom:"1.5rem" }}>
                    {f.stats.map(([v,l]) => (
                      <div key={l}>
                        <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"1rem", fontWeight:800, color:"#fff" }}>{v}</div>
                        <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.52rem", fontWeight:500,
                          color:"rgba(255,255,255,0.25)", letterSpacing:"0.1em", textTransform:"uppercase", marginTop:2 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                )}
                {f.cta && (
                  <a href={f.cta.href} target="_blank" rel="noopener noreferrer"
                    style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem",
                      background:f.color, color:"#fff", textDecoration:"none",
                      fontFamily:"'Poppins',sans-serif", fontSize:"0.78rem", fontWeight:700,
                      padding:"0.75rem 1.75rem", borderRadius:9999,
                      boxShadow:`0 0 20px ${f.color}44`, transition:"transform 0.2s ease" }}
                    onMouseOver={e=>e.currentTarget.style.transform="translateY(-2px)"}
                    onMouseOut={e=>e.currentTarget.style.transform="none"}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:"rgba(255,255,255,0.8)", animation:"onlineRing 2s ease-out infinite" }}/>
                    {f.cta.label}
                  </a>
                )}
              </div>
            </div>

            {/* Right: 2×2 grid of team cards */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gridTemplateRows:"1fr 1fr", gap:"1rem", height:"100%" }}>
              {TEAM_MEMBERS.map((m, i) => {
                const isF = featured === i;
                return (
                  <div key={i} onClick={() => setFeatured(i)}
                    style={{ ...fadeUp(0.18 + i*0.08),
                      position:"relative", borderRadius:"1.5rem", overflow:"hidden",
                      cursor:"pointer", minHeight:180,
                      border: isF ? `1.5px solid ${m.color}55` : "1px solid rgba(255,255,255,0.07)",
                      background: isF ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                      boxShadow: isF ? `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${m.color}14` : "none",
                      transform: isF ? "translateY(-3px)" : "translateY(0)",
                      transition:"all 0.4s cubic-bezier(0.16,1,0.3,1)",
                    }}>
                    {/* Accent bar */}
                    <div style={{ height:2, background:m.color, opacity: isF ? 1 : 0.35,
                      boxShadow:`0 0 10px ${m.color}88`, transition:"opacity 0.3s" }}/>
                    {m.photo ? (
                      <img src={m.photo} alt={m.name}
                        style={{ width:"100%", height:"65%", objectFit:"cover", objectPosition:"center top", display:"block" }}/>
                    ) : (
                      <div style={{ height:"65%", background:"rgba(255,255,255,0.03)",
                        backgroundImage:"linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)",
                        backgroundSize:"20px 20px", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {/* Corner brackets */}
                        {[0,1,2,3].map(c=>(
                          <div key={c} style={{ position:"absolute",
                            top:c<2?10:"auto", bottom:c>=2?10:"auto",
                            left:c%2===0?10:"auto", right:c%2===1?10:"auto",
                            width:14, height:14,
                            borderTop:c<2?`1.5px solid ${m.color}55`:"none",
                            borderBottom:c>=2?`1.5px solid ${m.color}55`:"none",
                            borderLeft:c%2===0?`1.5px solid ${m.color}55`:"none",
                            borderRight:c%2===1?`1.5px solid ${m.color}55`:"none",
                          }}/>
                        ))}
                        <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.48rem", fontWeight:600,
                          letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(255,255,255,0.18)" }}>
                          Photo
                        </div>
                      </div>
                    )}
                    <div style={{ padding:"0.75rem 0.85rem" }}>
                      <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.78rem", fontWeight:700,
                        color: isF ? "#fff" : "rgba(255,255,255,0.55)", transition:"color 0.3s", lineHeight:1.2 }}>{m.name}</div>
                      <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.58rem", fontWeight:400,
                        color: m.color, opacity: isF ? 1 : 0.55, marginTop:"0.2rem", transition:"opacity 0.3s" }}>{m.title}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Mobile: stacked with headshot */
          <div style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
            {TEAM_MEMBERS.map((m, i) => {
              const isF = featured === i;
              const initials = m.name.split(" ").map(w=>w[0]).join("").slice(0,2);
              return (
                <div key={i} onClick={() => setFeatured(i)} style={{ borderRadius:"1.5rem", overflow:"hidden",
                  border: isF ? `1.5px solid ${m.color}55` : "1px solid rgba(255,255,255,0.07)",
                  background: isF ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                  cursor:"pointer", transition:"border-color 0.3s ease, background 0.3s ease" }}>
                  <div style={{ height:2, background:m.color, opacity: isF ? 1 : 0.3,
                    boxShadow: isF ? `0 0 8px ${m.color}88` : "none", transition:"opacity 0.3s, box-shadow 0.3s" }}/>
                  <div style={{ padding:"1rem 1.1rem", display:"flex", gap:"0.875rem", alignItems:"flex-start" }}>
                    {/* Headshot / avatar */}
                    <div style={{ flexShrink:0, width:52, height:52, borderRadius:"50%", overflow:"hidden",
                      border:`2px solid ${m.color}55`, background:`${m.color}18` }}>
                      {m.photo ? (
                        <img src={m.photo} alt={m.name} style={{ width:"100%", height:"100%",
                          objectFit:"cover", objectPosition:"center top" }}/>
                      ) : (
                        <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center",
                          justifyContent:"center", fontFamily:"'Poppins',sans-serif", fontSize:"1rem",
                          fontWeight:700, color:m.color }}>{initials}</div>
                      )}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.9rem", fontWeight:800,
                        color: isF ? "#fff" : "rgba(255,255,255,0.55)", transition:"color 0.3s" }}>{m.name}</div>
                      <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.65rem", color:m.color,
                        marginTop:"0.15rem", fontWeight:500 }}>{m.title}</div>
                      <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem",
                        color:"rgba(255,255,255,0.28)", marginTop:"0.1rem" }}>{m.dept}</div>
                    </div>
                  </div>
                  {/* Expanded bio + stats on active card */}
                  <div style={{ display:"grid", gridTemplateRows: isF ? "1fr" : "0fr",
                    transition:"grid-template-rows 0.38s cubic-bezier(0.16,1,0.3,1)" }}>
                    <div style={{ overflow:"hidden" }}>
                      <div style={{ padding:"0 1.1rem 1.1rem" }}>
                        <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.78rem", fontWeight:300,
                          color:"rgba(255,255,255,0.5)", lineHeight:1.75, margin:"0 0 0.875rem" }}>{m.bio}</p>
                        {m.stats.length > 0 && (
                          <div style={{ display:"flex", gap:"1.25rem" }}>
                            {m.stats.map(([n,l]) => (
                              <div key={l}>
                                <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"1rem",
                                  fontWeight:800, color:m.color }}>{n}</div>
                                <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.54rem",
                                  color:"rgba(255,255,255,0.3)", letterSpacing:"0.06em" }}>{l}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Arrow navigation — bottom right */}
        <div style={{ ...fadeUp(0.45), display:"flex", alignItems:"center", justifyContent:"flex-end",
          gap:"1rem", marginTop:"2rem" }}>
          {/* Dots */}
          <div style={{ display:"flex", gap:"0.5rem" }}>
            {TEAM_MEMBERS.map((_,i) => (
              <div key={i} onClick={() => setFeatured(i)} style={{
                width: featured===i ? 20 : 6, height:6, borderRadius:3,
                background: featured===i ? TEAM_MEMBERS[featured].color : "rgba(255,255,255,0.15)",
                cursor:"pointer", transition:"all 0.35s ease" }}/>
            ))}
          </div>
          {/* Arrow button */}
          <button onClick={next} aria-label="Next team member"
            style={{ display:"flex", alignItems:"center", justifyContent:"center",
              width:44, height:44, borderRadius:"50%",
              background:`rgba(255,255,255,0.06)`,
              border:`1px solid rgba(255,255,255,0.12)`,
              cursor:"pointer", transition:"all 0.3s ease",
              color:"#fff",
            }}
            onMouseOver={e=>{ e.currentTarget.style.background=TEAM_MEMBERS[featured].color+"22"; e.currentTarget.style.borderColor=TEAM_MEMBERS[featured].color+"55"; }}
            onMouseOut={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.12)"; }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

// ── MEET THE LEAD (legacy — replaced by SprintTeamSection) ────────────────────
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
            transition:"opacity 0.7s ease, transform 0.7s ease",
            fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem", fontWeight:600,
            letterSpacing:"0.22em", textTransform:"uppercase", color:"#00BADC", marginBottom:"1rem" }}>
            Meet Your Sprint Lead
          </div>
          <h2 style={{ opacity:visible?1:0, transform:visible?"none":"translateY(18px)",
            transition:"opacity 0.75s ease 0.08s, transform 0.75s ease 0.08s",
            fontFamily:"'Poppins',sans-serif", fontWeight:800,
            fontSize: mobile?"clamp(1.8rem,7vw,2.4rem)":"clamp(2rem,3vw,2.8rem)",
            color:"#fff", lineHeight:1.1, marginBottom:"0.5rem" }}>
            David Filak
          </h2>
          <div style={{ opacity:visible?1:0, transition:"opacity 0.7s ease 0.14s, transform 0.7s ease 0.14s",
            fontFamily:"'Poppins',sans-serif", fontSize:"0.78rem", fontWeight:400,
            color:"rgba(255,255,255,0.4)", letterSpacing:"0.06em", marginBottom:"1.75rem" }}>
            Associate Principal, Asset Strategy · NELSON Worldwide
          </div>
          <p style={{ opacity:visible?1:0, transform:visible?"none":"translateY(12px)",
            transition:"opacity 0.75s ease 0.2s, transform 0.75s ease 0.2s",
            fontFamily:"'Poppins',sans-serif", fontSize: mobile?"0.88rem":"0.95rem",
            fontWeight:300, color:"rgba(255,255,255,0.55)", lineHeight:1.85,
            maxWidth:440, marginBottom:"2.25rem" }}>
            I've run Amenity Sprints on 40-story Loop towers, suburban flex parks, and everything in between. The Sprint process exists because I was tired of watching owners spend six months deciding whether to spend $800K — when a $10K concept would answer the question in four weeks.
          </p>
          {/* Stats row */}
          <div style={{ opacity:visible?1:0, transition:"opacity 0.7s ease 0.28s, transform 0.7s ease 0.28s",
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
          <div style={{ opacity:visible?1:0, transition:"opacity 0.7s ease 0.34s, transform 0.7s ease 0.34s" }}>
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
  XL:{ label:"XL", name:"Transformative", color:"#2979FF" },
};

const TIERS = [
  { label:"S", range:"$2K–$6K",  weeks:"2–3 wks", barPct:22,
    desc:"Targeted upgrades with immediate impact — entry refresh, signage, lighting, finish improvements. Fast ROI, minimal disruption.",
    img:"https://wjwrbcw7qoosooaa.public.blob.vercel-storage.com/AS1.png" },
  { label:"M", range:"$5K–$10K", weeks:"2.5–4 wks", barPct:50,
    desc:"Significant public-space improvements that open revenue opportunities and solve specific internal building problems.",
    img:"https://wjwrbcw7qoosooaa.public.blob.vercel-storage.com/CW1.jpeg" },
  { label:"L", range:"$8K–$15K", weeks:"4–6 wks", barPct:76,
    desc:"High-investment repositioning that substantially elevates current and future real estate value through full spatial transformation.",
    img:"https://wjwrbcw7qoosooaa.public.blob.vercel-storage.com/21_0003493_000_N11_medium.jpg" },
  { label:"XL", range:"Custom",  weeks:"6+ wks", barPct:100,
    desc:"Large-scale rebranding, infrastructure overhaul, and circulation redesign. Full market repositioning for flagship assets.",
    img:"https://wjwrbcw7qoosooaa.public.blob.vercel-storage.com/ATT_Tower_Minneapolis_01.jpg" },
];

// ── SCROLL CARD STRIP ─────────────────────────────────────────────────────────
const SCROLL_CARD_LABELS = [
  "Competitive Analysis","Design Language","Visualization","Floor Plans",
  "Amenity Sprint","Lobby Activation","Roof Deck Concept","Tenant Lounge",
  "Building Reposition","Campus Study","3D Rendering","Axon View",
  "Site Analysis","Material Board",
];

const ScrollCardStrip = () => {
  const row1Ref = useRef(null);
  const row2Ref = useRef(null);

  // Direct DOM manipulation — zero React re-renders on scroll
  useEffect(() => {
    let raf;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const s = window.scrollY;
        if (row1Ref.current) row1Ref.current.style.transform = `translateX(${s * 0.055}px)`;
        if (row2Ref.current) row2Ref.current.style.transform = `translateX(${-s * 0.055}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const row1 = [...SCROLL_CARD_LABELS.slice(0,7), ...SCROLL_CARD_LABELS.slice(0,7)];
  const row2 = [...SCROLL_CARD_LABELS.slice(7), ...SCROLL_CARD_LABELS.slice(7)];

  const card = (label, i) => (
    <div key={i} style={{
      flexShrink:0, width:210, height:138, borderRadius:"1.5rem",
      background:"linear-gradient(145deg,#242628 0%,#1c1e20 100%)",
      border:"1px solid rgba(255,255,255,0.07)",
      position:"relative", overflow:"hidden",
      display:"flex", alignItems:"flex-end", padding:"0.8rem 0.9rem",
    }}>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(255,255,255,0.028) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.028) 1px,transparent 1px)",
        backgroundSize:"22px 22px" }}/>
      <div style={{ position:"absolute", top:9, left:9, width:13, height:13,
        borderTop:"1px solid rgba(0,186,220,0.35)", borderLeft:"1px solid rgba(0,186,220,0.35)" }}/>
      <div style={{ position:"absolute", bottom:9, right:9, width:13, height:13,
        borderBottom:"1px solid rgba(0,186,220,0.35)", borderRight:"1px solid rgba(0,186,220,0.35)" }}/>
      <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.54rem", fontWeight:600,
        letterSpacing:"0.13em", textTransform:"uppercase", color:"rgba(255,255,255,0.52)",
        position:"relative", zIndex:1, lineHeight:1.35 }}>{label}</span>
    </div>
  );

  return (
    <div style={{ background:"#1e2022", padding:"3.5rem 0", overflow:"hidden",
      borderTop:"1px solid rgba(255,255,255,0.05)", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
      <div ref={row1Ref} style={{ display:"flex", gap:"1rem", marginBottom:"1rem", willChange:"transform" }}>
        {row1.map((l,i) => card(l,i))}
      </div>
      <div ref={row2Ref} style={{ display:"flex", gap:"1rem", willChange:"transform" }}>
        {row2.map((l,i) => card(l,i))}
      </div>
    </div>
  );
};

// ── TIERS + TESTIMONIALS COMBINED ─────────────────────────────────────────────
const TiersAndTestimonialsSection = () => {
  const mobile = useIsMobile();
  const [ref, visible] = useScrollReveal(0.06);
  // Testimonials
  const [tActive, setTActive] = useState(0);
  const [tFading, setTFading] = useState(false);
  // Tiers
  const [tiersActive, setTiersActive] = useState(null);
  const [barsIn, setBarsIn] = useState(false);

  useEffect(() => {
    if (mobile) return; // static on mobile — arrows used instead
    const id = setInterval(() => {
      if (_isScrolling) return;
      setTFading(true);
      setTimeout(() => { setTActive(p => (p + 1) % TESTIMONIALS.length); setTFading(false); }, 320);
    }, 4500);
    return () => clearInterval(id);
  }, [mobile]);

  const advanceTestimonial = (dir) => {
    setTFading(true);
    setTimeout(() => {
      setTActive(p => (p + dir + TESTIMONIALS.length) % TESTIMONIALS.length);
      setTFading(false);
    }, 280);
  };

  useEffect(() => {
    if (!visible) return;
    const bt = setTimeout(() => setBarsIn(true), 500);
    return () => clearTimeout(bt);
    // No auto-cycle — all four tiers shown equally; user clicks to focus one.
  }, [visible]);

  const t = TESTIMONIALS[tActive];

  const fadeUp = (delay) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : (mobile ? "translateY(0)" : "translateY(28px)"),
    transition: mobile
      ? `opacity 0.6s ease ${delay}s`
      : `opacity 0.7s ease ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
  });

  const TierCard = ({ tier, i }) => {
    const sz = SIZE_CONFIG[tier.label];
    const isActive = tiersActive === i;
    return (
      <div style={{ opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(28px)",
        transition:`opacity 0.7s ease ${0.2+i*0.1}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${0.2+i*0.1}s` }}>
        <div onClick={() => setTiersActive(i)} style={{
          position:"relative", borderRadius:"1.5rem", overflow:"hidden", cursor:"pointer",
          border: isActive ? `1.5px solid ${sz.color}55` : "1px solid rgba(255,255,255,0.07)",
          boxShadow: isActive ? `0 16px 40px rgba(0,0,0,0.55), 0 0 28px ${sz.color}18` : "0 4px 16px rgba(0,0,0,0.3)",
          transition:"border-color 0.4s ease, box-shadow 0.4s ease",
          height: mobile ? 190 : 210,
        }}>
          <div style={{ position:"relative", height: mobile ? 100 : 115, overflow:"hidden" }}>
            <img src={tier.img} alt={tier.label} style={{ width:"100%", height:"100%", objectFit:"cover",
              transform: (!mobile && isActive) ? "scale(1.07)" : "scale(1)", transition:"transform 0.65s ease" }}/>
            <div style={{ position:"absolute", inset:0,
              background:"linear-gradient(to bottom, transparent 30%, rgba(8,10,14,0.88) 100%)" }}/>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:sz.color,
              boxShadow:`0 0 14px ${sz.color}99`, opacity: isActive ? 1 : 0.4,
              borderRadius:"1.5rem 1.5rem 0 0" }}/>
            <div style={{ position:"absolute", bottom:"0.5rem", left:"0.9rem",
              fontFamily:"'Poppins',sans-serif",
              fontSize: tier.label==="XL" ? "clamp(1.8rem,2.5vw,2.6rem)" : "clamp(1.9rem,2.7vw,2.8rem)",
              fontWeight:800, lineHeight:1, letterSpacing:"-0.04em",
              color:sz.color, opacity: isActive ? 1 : 0.55,
              transition:"opacity 0.4s ease", userSelect:"none" }}>{tier.label}</div>
          </div>
          <div style={{ padding:"0.8rem 0.9rem 0.9rem",
            background: isActive ? "rgba(8,10,14,0.65)" : "rgba(8,10,14,0.5)",
            transition:"background 0.4s ease" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.4rem" }}>
              <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.44rem", fontWeight:700,
                letterSpacing:"0.15em", textTransform:"uppercase", color:sz.color,
                background:`${sz.color}18`, border:`1px solid ${sz.color}33`,
                padding:"0.15rem 0.45rem", borderRadius:99 }}>{sz.name}</div>
              <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.56rem", fontWeight:600,
                color:"rgba(255,255,255,0.38)" }}>{tier.weeks}</div>
            </div>
            <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.9rem", fontWeight:800,
              color:"rgba(255,255,255,0.95)", letterSpacing:"-0.02em", marginBottom:"0.6rem" }}>{tier.range}</div>
            <div style={{ height:2, background:"rgba(255,255,255,0.07)", borderRadius:1, overflow:"hidden" }}>
              <div style={{ height:"100%", width: barsIn ? `${tier.barPct}%` : "0%",
                background:`linear-gradient(90deg, ${sz.color}66, ${sz.color})`, borderRadius:1,
                boxShadow: isActive ? `0 0 10px ${sz.color}88` : "none",
                transition:`width 1s cubic-bezier(0.16,1,0.3,1) ${0.08*i}s, box-shadow 0.4s ease` }}/>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TestimonialBlock = ({ pad }) => (
    <div style={{ padding: pad, display:"flex", flexDirection:"column", justifyContent:"center" }}>
      <div style={{ ...fadeUp(0), fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem", fontWeight:600,
        letterSpacing:"0.22em", textTransform:"uppercase", color:"#00BADC",
        marginBottom: mobile ? "1.5rem" : "2.5rem" }}>What Clients Say</div>
      <div style={{ ...fadeUp(0.06), fontFamily:"Georgia,'Times New Roman',serif",
        fontSize: mobile ? "5.5rem" : "9rem", lineHeight:0.75, fontWeight:400,
        color:t.color, opacity:0.3, marginBottom:"0.25rem", userSelect:"none",
        transition:"color 0.35s ease" }}>"</div>
      <div style={{ opacity: tFading ? 0 : 1, transform: tFading ? "translateY(6px)" : "translateY(0)",
        transition:"opacity 0.32s ease, transform 0.32s ease",
        minHeight: mobile ? undefined : "8rem" }}>
        <p style={{ fontFamily:"'Poppins',sans-serif",
          fontSize: mobile ? "clamp(1rem,4vw,1.25rem)" : "clamp(1.1rem,1.6vw,1.4rem)",
          fontWeight:300, lineHeight:1.72, color:"rgba(255,255,255,0.9)",
          marginBottom:"2rem", letterSpacing:"-0.01em",
          minHeight: mobile ? undefined : "6.5rem" }}>{t.quote}</p>
        <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
          <div style={{ width:34, height:34, borderRadius:"50%", background:`${t.color}22`,
            border:`1.5px solid ${t.color}55`, display:"flex", alignItems:"center",
            justifyContent:"center", flexShrink:0 }}>
            <div style={{ width:9, height:9, borderRadius:"50%", background:t.color }}/>
          </div>
          <div>
            <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.8rem", fontWeight:600, color:"#fff" }}>{t.name}</div>
            <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.66rem", fontWeight:400,
              color:"rgba(255,255,255,0.38)", letterSpacing:"0.04em" }}>{t.title} · {t.company}</div>
          </div>
        </div>
      </div>
      <div style={{ display:"flex", gap:"0.75rem", alignItems:"center", marginTop: mobile ? "2rem" : "2.75rem" }}>
        {/* Prev arrow */}
        <button onClick={() => advanceTestimonial(-1)} style={{
          background:"none", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"50%",
          width:32, height:32, cursor:"pointer", flexShrink:0,
          display:"flex", alignItems:"center", justifyContent:"center",
          color:"rgba(255,255,255,0.55)", fontSize:"1rem", lineHeight:1,
          transition:"border-color 0.2s, color 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor=t.color; e.currentTarget.style.color=t.color; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.15)"; e.currentTarget.style.color="rgba(255,255,255,0.55)"; }}
        >‹</button>
        {/* Dot indicators */}
        {TESTIMONIALS.map((_,i) => (
          <div key={i} onClick={() => { setTFading(true); setTimeout(() => { setTActive(i); setTFading(false); }, 280); }}
            style={{ width:tActive===i?28:6, height:6, borderRadius:3,
              background:tActive===i?TESTIMONIALS[i].color:"rgba(255,255,255,0.2)",
              cursor:"pointer", transition:"all 0.35s cubic-bezier(0.16,1,0.3,1)",
              boxShadow:tActive===i?`0 0 10px ${TESTIMONIALS[i].color}66`:"none" }}/>
        ))}
        {/* Next arrow */}
        <button onClick={() => advanceTestimonial(1)} style={{
          background:"none", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"50%",
          width:32, height:32, cursor:"pointer", flexShrink:0,
          display:"flex", alignItems:"center", justifyContent:"center",
          color:"rgba(255,255,255,0.55)", fontSize:"1rem", lineHeight:1,
          transition:"border-color 0.2s, color 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor=t.color; e.currentTarget.style.color=t.color; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.15)"; e.currentTarget.style.color="rgba(255,255,255,0.55)"; }}
        >›</button>
      </div>
    </div>
  );

  const TiersBlock = ({ pad }) => (
    <div style={{ padding: pad, display:"flex", flexDirection:"column", justifyContent:"center" }}>
      <div style={{ ...fadeUp(0.12), fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem", fontWeight:600,
        letterSpacing:"0.22em", textTransform:"uppercase", color:"#00BADC", marginBottom:"0.75rem" }}>Scalable Scope</div>
      <h2 style={{ ...fadeUp(0.18), fontFamily:"'Poppins',sans-serif", fontWeight:800,
        fontSize: mobile ? "clamp(1.6rem,6vw,2rem)" : "clamp(1.8rem,2.4vw,2.4rem)",
        color:"#fff", lineHeight:1.1, marginBottom: mobile ? "1.5rem" : "2rem" }}>
        One size<br/>never fits all.
      </h2>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap: mobile ? "0.75rem" : "1rem" }}>
        {TIERS.map((tier, i) => <TierCard key={tier.label} tier={tier} i={i}/>)}
      </div>
      <div style={{ ...fadeUp(0.5), display:"flex", alignItems:"center", gap:"1.25rem", marginTop:"1.25rem" }}>
        {TIERS.map((tier, i) => {
          const sz = SIZE_CONFIG[tier.label];
          return (
            <div key={tier.label} onClick={() => setTiersActive(i)}
              style={{ display:"flex", alignItems:"center", gap:"0.4rem",
                cursor:"pointer", opacity: tiersActive===i ? 1 : 0.35, transition:"opacity 0.3s ease" }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:sz.color,
                boxShadow: tiersActive===i ? `0 0 8px ${sz.color}` : "none", transition:"box-shadow 0.3s ease" }}/>
              <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.48rem", fontWeight:600,
                letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.5)" }}>{tier.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <section ref={ref} style={{ background:"#191b1d", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(255,255,255,0.014) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.014) 1px,transparent 1px)",
        backgroundSize:"48px 48px" }}/>
      {mobile ? (
        <div style={{ padding:"5rem 5vw" }}>
          <TestimonialBlock pad="0 0 3.5rem 0"/>
          <div style={{ height:"1px", background:"rgba(255,255,255,0.07)", marginBottom:"3.5rem" }}/>
          <TiersBlock pad="0"/>
        </div>
      ) : (
        <div style={{ display:"flex", alignItems:"stretch", minHeight:"78vh" }}>
          <div style={{ width:"44%", borderRight:"1px solid rgba(255,255,255,0.07)", flexShrink:0 }}>
            <TestimonialBlock pad="8rem 4vw 8rem 5vw"/>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <TiersBlock pad="8rem 5vw 8rem 4vw"/>
          </div>
        </div>
      )}
    </section>
  );
};

// ── LEGACY STUB (replaced) ─────────────────────────────────────────────────────
const TierScopeSection = () => {
  const mobile = useIsMobile();
  const [ref, visible] = useScrollReveal(0.08);
  const [active, setActive] = useState(0);
  const [barsIn, setBarsIn] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setBarsIn(true), 500);
    return () => clearTimeout(t);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setActive(a => (a + 1) % 4), 3200);
    return () => clearInterval(t);
  }, [visible]);

  const fadeUp = (delay) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(28px)",
    transition: `opacity 0.7s ease ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
  });

  return (
    <section style={{ background:"#1e2022", padding: mobile ? "5rem 5vw" : "8rem 4vw",
      position:"relative", overflow:"hidden" }}>
      {/* Dot-grid texture matching LandingJourneySection */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)",
        backgroundSize:"48px 48px" }}/>

      <div ref={ref} style={{ maxWidth:1400, margin:"0 auto", position:"relative" }}>

        {/* Header */}
        <div style={{ marginBottom: mobile ? "3rem" : "4rem" }}>
          <div style={{ ...fadeUp(0), fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem",
            fontWeight:600, letterSpacing:"0.22em", textTransform:"uppercase",
            color:"#00BADC", marginBottom:"1rem" }}>Scalable Scope</div>
          <h2 style={{ ...fadeUp(0.1), fontFamily:"'Poppins',sans-serif", fontWeight:800,
            fontSize: mobile ? "clamp(1.7rem,7vw,2.2rem)" : "clamp(2rem,4vw,3rem)",
            color:"#fff", lineHeight:1.1, margin:0 }}>
            One size<br/>never fits all.
          </h2>
          <p style={{ ...fadeUp(0.18), fontFamily:"'Poppins',sans-serif", fontSize:"0.88rem",
            fontWeight:400, color:"rgba(255,255,255,0.42)", lineHeight:1.8,
            marginTop:"1rem", maxWidth:460, marginBottom:0 }}>
            Match scope to your asset, budget, and timeline — every tier delivers the same concept-ready package.
          </p>
        </div>

        {/* Scope axis label */}
        <div style={{ ...fadeUp(0.24), display:"flex", alignItems:"center",
          gap:"0.75rem", marginBottom:"0.75rem" }}>
          <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.5rem", fontWeight:600,
            letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(255,255,255,0.18)" }}>
            Scope / Investment
          </span>
          <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.06)" }}/>
          <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.5rem", fontWeight:600,
            letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(255,255,255,0.18)" }}>
            Duration →
          </span>
        </div>

        {/* 4-tier card grid */}
        <div style={{ display:"grid",
          gridTemplateColumns: mobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr",
          gap: mobile ? "0.875rem" : "1.25rem" }}>
          {TIERS.map((tier, i) => {
            const sz = SIZE_CONFIG[tier.label];
            const isActive = active === i;
            return (
              /* Outer: scroll-reveal wrapper */
              <div key={tier.label} style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(36px)",
                transition: `opacity 0.7s ease ${0.15 + i*0.1}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${0.15 + i*0.1}s`,
              }}>
                {/* Inner: interactive card */}
                <div onClick={() => setActive(i)} style={{
                  position:"relative", borderRadius:"1.75rem", overflow:"hidden",
                  cursor:"pointer",
                  border: isActive ? `1.5px solid ${sz.color}55` : "1px solid rgba(255,255,255,0.07)",
                  boxShadow: isActive
                    ? `0 20px 48px rgba(0,0,0,0.55), 0 0 32px ${sz.color}18`
                    : "0 4px 20px rgba(0,0,0,0.35)",
                  transform: isActive ? "translateY(-5px)" : "translateY(0)",
                  transition:"border-color 0.4s ease, box-shadow 0.45s ease, transform 0.45s cubic-bezier(0.16,1,0.3,1)",
                  minHeight: mobile ? 220 : 300,
                  display:"flex", flexDirection:"column",
                }}>

                  {/* Photo — top half */}
                  <div style={{ position:"relative", height: mobile ? 108 : 155, overflow:"hidden", flexShrink:0 }}>
                    <img src={tier.img} alt={tier.label} style={{
                      width:"100%", height:"100%", objectFit:"cover",
                      transition:"transform 0.65s ease",
                      transform: isActive ? "scale(1.07)" : "scale(1)",
                    }}/>
                    {/* Gradient to bleed into content area */}
                    <div style={{ position:"absolute", inset:0,
                      background:"linear-gradient(to bottom, transparent 30%, rgba(8,10,14,0.88) 100%)" }}/>
                    {/* Tier accent bar */}
                    <div style={{ position:"absolute", top:0, left:0, right:0, height:3,
                      background:sz.color, boxShadow:`0 0 14px ${sz.color}99`,
                      opacity: isActive ? 1 : 0.4, transition:"opacity 0.4s ease",
                      borderRadius:"1.75rem 1.75rem 0 0" }}/>
                    {/* Large tier letter */}
                    <div style={{
                      position:"absolute", bottom:"0.55rem", left:"1rem",
                      fontFamily:"'Poppins',sans-serif",
                      fontSize: tier.label==="XL" ? "clamp(2rem,3.2vw,3rem)" : "clamp(2.2rem,3.5vw,3.4rem)",
                      fontWeight:800, lineHeight:1, letterSpacing:"-0.04em",
                      color:sz.color,
                      opacity: isActive ? 1 : 0.55,
                      filter: isActive ? `drop-shadow(0 0 18px ${sz.color}99)` : "none",
                      transition:"opacity 0.4s, filter 0.4s",
                      userSelect:"none", pointerEvents:"none",
                    }}>{tier.label}</div>
                  </div>

                  {/* Content — bottom */}
                  <div style={{ padding:"0.9rem 1rem 1rem", flex:1, display:"flex", flexDirection:"column",
                    background: isActive ? "rgba(8,10,14,0.65)" : "rgba(8,10,14,0.5)",
                    transition:"background 0.4s ease" }}>

                    {/* Name badge + weeks */}
                    <div style={{ display:"flex", alignItems:"center",
                      justifyContent:"space-between", marginBottom:"0.45rem" }}>
                      <div style={{
                        fontFamily:"'Poppins',sans-serif", fontSize:"0.46rem", fontWeight:700,
                        letterSpacing:"0.16em", textTransform:"uppercase",
                        color:sz.color, background:`${sz.color}18`,
                        border:`1px solid ${sz.color}33`, padding:"0.18rem 0.5rem", borderRadius:99,
                      }}>{sz.name}</div>
                      <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.58rem",
                        fontWeight:600, color:"rgba(255,255,255,0.38)",
                        letterSpacing:"0.02em" }}>{tier.weeks}</div>
                    </div>

                    {/* Price */}
                    <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.92rem", fontWeight:800,
                      color:"rgba(255,255,255,0.95)", letterSpacing:"-0.02em",
                      marginBottom:"0.7rem" }}>{tier.range}</div>

                    {/* Animated scope bar */}
                    <div style={{ height:2, background:"rgba(255,255,255,0.07)", borderRadius:1,
                      marginBottom:"0.75rem", overflow:"hidden" }}>
                      <div style={{
                        height:"100%",
                        width: barsIn ? `${tier.barPct}%` : "0%",
                        background:`linear-gradient(90deg, ${sz.color}66, ${sz.color})`,
                        borderRadius:1,
                        boxShadow: isActive ? `0 0 10px ${sz.color}88` : "none",
                        transition: `width 1s cubic-bezier(0.16,1,0.3,1) ${0.08*i}s, box-shadow 0.4s ease`,
                      }}/>
                    </div>

                    {/* Description — expands on active */}
                    <div style={{
                      fontFamily:"'Poppins',sans-serif", fontSize:"0.66rem", fontWeight:400,
                      color:"rgba(255,255,255,0.48)", lineHeight:1.65,
                      overflow:"hidden",
                      maxHeight: isActive ? "5rem" : "0",
                      opacity: isActive ? 1 : 0,
                      transition:"max-height 0.45s cubic-bezier(0.16,1,0.3,1), opacity 0.35s ease",
                    }}>{tier.desc}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom dot-legend */}
        <div style={{ ...fadeUp(0.55), display:"flex", alignItems:"center",
          gap:"1.25rem", marginTop:"1.75rem", justifyContent:"flex-end" }}>
          {TIERS.map((tier, i) => {
            const sz = SIZE_CONFIG[tier.label];
            return (
              <div key={tier.label} onClick={() => setActive(i)}
                style={{ display:"flex", alignItems:"center", gap:"0.45rem",
                  cursor:"pointer", opacity: active===i ? 1 : 0.35,
                  transition:"opacity 0.3s ease" }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:sz.color,
                  boxShadow: active===i ? `0 0 10px ${sz.color}` : "none",
                  transition:"box-shadow 0.3s ease" }}/>
                <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.5rem", fontWeight:600,
                  letterSpacing:"0.1em", textTransform:"uppercase",
                  color:"rgba(255,255,255,0.5)" }}>{tier.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
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


// ── MAIN ──────────────────────────────��──────────────────────────────────────
export default function AmenitySprint({ projects = [] }) {
  const [scrolled, setScrolled] = useState(false);
  const [heroIn, setHeroIn] = useState(false);
  const [filterSize, setFilterSize] = useState("ALL");
  const mobile = useIsMobile();

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
  // On mobile: opacity-only — no translateY to avoid the "pop/expand" on section entry.
  const fade = (vis, delay=0) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? "translateY(0)" : (mobile ? "translateY(0)" : "translateY(24px)"),
    transition: mobile
      ? `opacity 0.7s ease ${delay}s`
      : `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
  });
  const filteredProjects = filterSize==="ALL" ? projects : projects.filter(p=>p.size===filterSize);

  return (
    <div style={{ fontFamily:"'Poppins',sans-serif", background:"#f7f7f7", color:"#000", overflowX:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.7)}}
        @keyframes iconPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.78)}}
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
          <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.54rem", fontWeight:600,
            letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.4)",
            whiteSpace:"nowrap" }}>Online</span>
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
        minHeight: mobile ? "100svh" : "100dvh",
        display:"flex", flexDirection:"column",
        position:"relative", overflow:"hidden",
      }}>
        {/* Full-bleed background video */}
        <video
          autoPlay muted loop playsInline preload="none"
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
          <source src="https://wjwrbcw7qoosooaa.public.blob.vercel-storage.com/Untitled%20%285%29.mp4" type="video/mp4" />
          <div style={{
            position:"absolute", inset:0,
            backgroundImage:"url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/22_0000716_000_N5_medium-m4fS8AmlXfInTVjcQUVXfg6kpNJxsd.jpg')",
            backgroundSize:"cover", backgroundPosition:"center right",
          }}/>
        </video>
        {/* Gradient overlay */}
        <div style={{
          position:"absolute", inset:0,
          background: mobile
            ? "linear-gradient(180deg, rgba(30,32,34,0.88) 0%, rgba(30,32,34,0.72) 50%, rgba(30,32,34,0.6) 100%)"
            : "linear-gradient(90deg, rgba(30,32,34,0.82) 0%, rgba(30,32,34,0.68) 40%, rgba(30,32,34,0.32) 62%, rgba(30,32,34,0.06) 82%, transparent 100%)",
          zIndex:1,
        }}/>

        {/* Hero copy — flex:1 so it fills space above stats bar */}
        <div style={{
          flex:1, display:"flex", flexDirection:"column",
          justifyContent: mobile ? "center" : "flex-end",
          padding: mobile ? "88px 5vw 2rem" : "0 6vw 3.5rem",
          position:"relative", zIndex:3,
        }}>
          <div style={{ maxWidth: mobile ? "100%" : "55vw" }}>
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
            <div style={{ ...fade(heroIn,0.48), display:"flex", gap:"0.75rem", flexWrap:"wrap",
              marginBottom: mobile ? "0" : "0" }}>
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
          </div>
        </div>

        {/* ── HERO STATS BAR — full-bleed, outside padded copy wrapper ── */}
        <div style={{ ...fade(heroIn,0.52), position:"relative", zIndex:3,
          display:"grid",
          gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4,1fr)",
        }}>
          {[
            { n:"10+",    l:"Completed Sprints", bg:"rgba(0,186,220,0.22)"   },
            { n:"5",      l:"Markets",           bg:"rgba(24,152,139,0.22)"  },
            { n:"2–6 wks",l:"Turnaround",        bg:"rgba(255,127,64,0.18)"  },
            { n:"S–XL",   l:"Scalable Scope",    bg:"rgba(255,213,61,0.15)"  },
          ].map(({ n, l, bg }, i) => (
            <div key={l} style={{
              padding: mobile ? "1.2rem 1.25rem 1.5rem" : "1.75rem 2.5rem",
              background: bg,
              backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
              borderTop:"1px solid rgba(255,255,255,0.09)",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none",
              borderBottom: (mobile && i < 2) ? "1px solid rgba(255,255,255,0.07)" : "none",
            }}>
              <div style={{
                fontFamily:"'Georgia','Times New Roman',serif",
                fontSize: mobile ? "clamp(1.7rem,7vw,2.2rem)" : "clamp(1.6rem,2.2vw,2.4rem)",
                fontWeight:700, color:"#fff", lineHeight:1, marginBottom:"0.3rem",
              }}>{n}</div>
              <div style={{
                fontFamily:"'Poppins',sans-serif", fontSize:"0.54rem", fontWeight:500,
                color:"rgba(255,255,255,0.55)", letterSpacing:"0.1em", textTransform:"uppercase",
              }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SCROLL CARD STRIP ── */}
      <ScrollCardStrip />

      {/* ── JOURNEY TIMELINE ── */}
      <LandingJourneySection />

      {/* ── DELIVERABLES ── */}
      <section id="deliverables" style={{
        padding: mobile ? "4rem 0 4rem 5vw" : "8rem 0 8rem 6vw",
        background: C.bgSection, overflow:"hidden", position:"relative",
      }}>
        <div style={{
          display:"flex", flexDirection: mobile?"column":"row",
          alignItems: mobile?"flex-start":"center",
          gap: mobile?"2.5rem":"0",
        }}>
          {/* LEFT: constrained text box */}
          <div ref={delivRef} style={{
            flexShrink:0,
            width: mobile?"100%":"min(560px,44vw)",
            paddingRight: mobile?"5vw":"4vw",
          }}>
            <div style={{ ...fade(delivVis,0), fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem", fontWeight:600,
              letterSpacing:"0.2em", textTransform:"uppercase", color:"#00BADC", marginBottom:"1rem" }}>What You Receive</div>
            <h2 style={{ ...fade(delivVis,0.08), fontFamily:"'Poppins',sans-serif", fontWeight:800,
              fontSize: mobile?"clamp(1.7rem,6vw,2.2rem)":"clamp(1.8rem,2.6vw,2.8rem)",
              color:"#fff", lineHeight:1.1, marginBottom:"0.5rem" }}>
              From briefs<br/>to concepts.
            </h2>
            <div style={{ ...fade(delivVis,0.14), fontFamily:"'Poppins',sans-serif", fontWeight:600,
              fontSize: mobile?"1rem":"clamp(0.95rem,1.4vw,1.15rem)",
              color:"rgba(255,255,255,0.38)", lineHeight:1.3, marginBottom:"1.5rem",
              letterSpacing:"-0.01em" }}>
              Not in months — in weeks.
            </div>
            <p style={{ ...fade(delivVis,0.2), fontFamily:"'Poppins',sans-serif", fontSize:"0.85rem",
              fontWeight:300, color:C.textDim, lineHeight:1.8, marginBottom:"2rem" }}>
              Every sprint delivers fully developed design concepts your team can act on immediately — not wireframes or rough sketches.
            </p>
            <div style={{ ...fade(delivVis,0.28), display:"flex", flexDirection:"column" }}>
              {[
                { icon:"▣", label:"Annotated Floor Plans", desc:"Programmatic zones, adjacencies, and activation areas.", pd:"2.8s", py:"0.1s" },
                { icon:"◈", label:"3D Renderings", desc:"Photorealistic perspectives that make the vision real.", pd:"3.5s", py:"0.7s" },
                { icon:"◆", label:"Axonometric Views", desc:"Bird's-eye diagrams showing how the space lives.", pd:"2.3s", py:"1.3s" },
                { icon:"◉", label:"Design Language", desc:"Materials, mood, and the spatial narrative behind every decision.", pd:"4.0s", py:"0.4s" },
                { icon:"▷", label:"Animation (select tiers)", desc:"Walkthrough video for board presentations and broker tours.", pd:"3.2s", py:"1.9s" },
                { icon:"⬡", label:"360° Tours (select tiers)", desc:"Immersive virtual experiences for remote stakeholders.", pd:"2.6s", py:"0.9s" },
              ].map((d,i)=>(
                <div key={i} style={{ ...fade(delivVis,0.3+i*0.05),
                  display:"flex", gap:"0.875rem", alignItems:"flex-start",
                  padding:"0.75rem 0", borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.85rem", color:"#00BADC", flexShrink:0, marginTop:2,
                    animation:`iconPulse ${d.pd} ease-in-out ${d.py} infinite` }}>{d.icon}</span>
                  <div>
                    <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.82rem", fontWeight:600, color:"#fff" }}>{d.label}</div>
                    <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.72rem", fontWeight:300, color:C.textDim, marginTop:2 }}>{d.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: images bleed to the right viewport edge */}
          {!mobile && (
            <div style={{ ...fade(delivVis,0.18), flex:1, minWidth:0, paddingLeft:"2.5vw", display:"flex", flexDirection:"column", gap:"1rem" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:"1rem" }}>
                <ImgPlaceholder label="3D Rendering — Interior Perspective" aspectRatio="4/3" style={{ borderRadius:"1.5rem 0 0 1.5rem" }}/>
                <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
                  <ImgPlaceholder label="Axon / Floor Plan" aspectRatio="1/1" style={{ borderRadius:"1.5rem 0 0 1.5rem" }}/>
                  <ImgPlaceholder label="Design Language Board" aspectRatio="1/1" style={{ borderRadius:"1.5rem 0 0 1.5rem" }}/>
                </div>
              </div>
              <ImgPlaceholder label="Animation / 360 Tour Still" aspectRatio="21/6" style={{ borderRadius:"1.5rem 0 0 1.5rem" }}/>
            </div>
          )}
          {mobile && (
            <div style={{ ...fade(delivVis,0.18), width:"100%", paddingRight:"5vw" }}>
              <ImgPlaceholder label="3D Rendering" aspectRatio="16/9"/>
            </div>
          )}
        </div>
      </section>

      {/* ── TIERS + TESTIMONIALS ── */}
      <TiersAndTestimonialsSection />

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

      {/* ── SPRINT TEAM ── */}
      <SprintTeamSection />

      {/* TESTIMONIALS merged into TiersAndTestimonialsSection above */}

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

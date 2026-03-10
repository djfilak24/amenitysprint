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
  { id:1, slug:"241-n-5th",          tag:"Amenity Study",        name:"241 N 5TH ST.",      city:"Minneapolis, MN",  duration:"2.5 Weeks", investment:"$12K–$14K", type:"Roof Deck · Social Club · Event Space",        deliverables:["Floor Plans","3D Renderings","Design Language","Axonometric View"],       imgLabel:"Roof Deck Concept · 241 N 5th St.",        size:"L" },
  { id:2, slug:"9320-excelsior",     tag:"Building Reposition",  name:"9320 EXCELSIOR",     city:"Minneapolis, MN",  duration:"2.5 Weeks", investment:"$3K–$6K",   type:"Campus Analysis · Link Activation",           deliverables:["Initial Analysis","Site Plan","Opportunity Diagrams","Link Study"],         imgLabel:"Campus Aerial · 9320 Excelsior",           size:"S" },
  { id:3, slug:"55-west-monroe",     tag:"Building Reposition",  name:"55 WEST MONROE",     city:"Chicago, IL",      duration:"4 Weeks",   investment:"$12K–$15K", type:"The Urban Eddy · Ground Floor Lobby",         deliverables:["Axonometric Plan","Floor Plan","Explorations","Animation"],               imgLabel:"Ground Floor Lobby · 55 West Monroe",      size:"L" },
  { id:4, slug:"two22-tower",        tag:"Building Reposition",  name:"TWO22 TOWER",        city:"Minneapolis, MN",  duration:"2 Weeks",   investment:"$5K–$8K",   type:"2nd Floor Connection · Tenant Lounge",        deliverables:["Renderings","Floor Plans","Storytelling Mockup","Animation"],             imgLabel:"Tenant Lounge · Two22 Tower",              size:"M" },
  { id:5, slug:"50-south-sixth",     tag:"Building Reposition",  name:"50 SOUTH SIXTH",     city:"Minneapolis, MN",  duration:"6 Weeks",   investment:"$2K–$4K",   type:"Atrium Redesign · 5-Step Reposition",         deliverables:["Renderings","Material Palette","Floor Plans","360 Tour"],                 imgLabel:"Atrium Proposal · 50 South Sixth",         size:"S" },
  { id:6, slug:"golden-hills",       tag:"Building Reposition",  name:"GOLDEN HILLS",       city:"Minneapolis, MN",  duration:"3 Weeks",   investment:"$2K–$4K",   type:"Concept Design · Finish Palette",             deliverables:["Concept Plan","Finish Palette","Sketches","360 Tour"],                    imgLabel:"Concept Renderings · Golden Hills",        size:"S" },
  { id:7, slug:"cbre-concourse",     tag:"Building Reposition",  name:"CBRE CONCOURSE",     city:"Atlanta, GA",      duration:"2.5 Weeks", investment:"$5K–$8K",   type:"Lobby Activation · Modular Trellis System",   deliverables:["Construction Docs","Floor Plan","Demolition Plan","Renderings"],          imgLabel:"Lobby Activation · CBRE Concourse",        size:"M" },
  { id:8, slug:"1500-spring-garden", tag:"Building Reposition",  name:"1500 SPRING GARDEN", city:"Philadelphia, PA", duration:"3 Weeks",   investment:"$8K–$10K",  type:"Rooftop Activation · Garden Courtyard",       deliverables:["Rooftop Plan","Exterior Study","Entry Sequence","Analysis"],              imgLabel:"Rooftop Activation · 1500 Spring Garden",  size:"M" },
  { id:9, slug:"crest-ridge",        tag:"Single-to-Multi Tenant",name:"CREST RIDGE",       city:"Minnetonka, MN",   duration:"6 Months",  investment:"$3K–$6K",   type:"Agile Planning · Tenant Strategy",            deliverables:["Stacking Plans","Agile Timeline","Comp Analysis","Dashboard"],            imgLabel:"Leasing Strategy · Crest Ridge",           size:"S" },
  { id:10,slug:"zna-hq",            tag:"Campus & Master Plan",  name:"ZNA HQ BUILDING",    city:"Chicago, IL",      duration:"6 Weeks",   investment:"$12K–$14K", type:"The Sculpture in the Park · Campus Reposition",deliverables:["Base Scheme","Alternate Plans","Signage Study","Conference Center"],       imgLabel:"Campus Study · ZNA HQ",                    size:"L" },
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
        background:"#fff", border:"1px solid #e8e8e8", borderRadius:"0.75rem",
        overflow:"hidden",
        opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(24px)",
        transition:`opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s, box-shadow 0.3s ease`,
        boxShadow:hovered?"0 12px 40px rgba(0,0,0,0.12)":"0 2px 12px rgba(0,0,0,0.04)",
      }}>
      <div style={{ position:"relative", overflow:"hidden" }}>
        <ImgPlaceholder label={p.imgLabel} aspectRatio="4/3" style={{ borderRadius:0 }}/>
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
      <div style={{ padding:"1.25rem 1.5rem 1.5rem" }}>
        <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem", fontWeight:500,
          letterSpacing:"0.14em", textTransform:"uppercase", color:"#999", marginBottom:"0.35rem" }}>{p.tag}</div>
        <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"1.05rem", fontWeight:700,
          color:"#000", lineHeight:1.2, marginBottom:"0.35rem" }}>{p.name}</div>
        <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.75rem", fontWeight:400,
          color:"#666", marginBottom:"1rem", lineHeight:1.5 }}>{p.type}</div>
        <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px solid #f0f0f0", paddingTop:"0.85rem" }}>
          <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem", fontWeight:500,
            textTransform:"uppercase", letterSpacing:"0.1em", color:"#bbb" }}>{p.city}</div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.78rem", fontWeight:600, color:"#000" }}>{p.investment}</div>
            <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem", fontWeight:400, color:"#bbb" }}>{p.duration}</div>
          </div>
        </div>
      </div>
    </a>
  );
};

const TIERS = [
  { label:"S", range:"$2K–$6K", weeks:"2–3 weeks", desc:"Targeted upgrades with immediate impact — entry refresh, signage, lighting, finish improvements. Fast ROI, minimal disruption." },
  { label:"M", range:"$5K–$10K", weeks:"2.5–4 weeks", desc:"Significant public-space improvements that open revenue opportunities and solve internal building problems." },
  { label:"L", range:"$8K–$15K", weeks:"4–6 weeks", desc:"High-investment repositioning that substantially elevates current and future real estate value." },
  { label:"XL", range:"Custom", weeks:"6+ weeks", desc:"Large-scale rebranding, infrastructure overhaul, circulation redesign. Full market repositioning for flagship assets." },
];

const SprintTier = ({ tier, active, onClick }) => {
  const sz = SIZE_CONFIG[tier.label];
  return (
    <div onClick={onClick} style={{
      borderRadius:"0.75rem",
      border:active?`2px solid ${sz.color}`:"1px solid #e8e8e8",
      background:active?"#000":"#fff",
      padding:"2rem", cursor:"pointer",
      transition:"all 0.3s ease",
      boxShadow:active?`0 0 0 4px ${sz.color}22`:"none",
    }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"1.25rem" }}>
        <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"2.5rem", fontWeight:800,
          color:active?sz.color:"#e0e0e0", lineHeight:1 }}>{tier.label}</div>
        <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem", fontWeight:600,
          letterSpacing:"0.12em", textTransform:"uppercase",
          color:active?"#fff":"#999", background:active?"rgba(255,255,255,0.1)":"#f5f5f5",
          padding:"0.25rem 0.6rem", borderRadius:99 }}>{sz.name}</div>
      </div>
      <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"1rem", fontWeight:700,
        color:active?"#fff":"#000", marginBottom:"0.25rem" }}>{tier.range}</div>
      <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.7rem", fontWeight:500,
        color:active?sz.color:"#999", marginBottom:"1rem" }}>{tier.weeks}</div>
      <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.8rem", fontWeight:400,
        color:active?"rgba(255,255,255,0.6)":"#666", lineHeight:1.7 }}>{tier.desc}</div>
    </div>
  );
};

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function AmenitySprint() {
  const [scrolled, setScrolled] = useState(false);
  const [heroIn, setHeroIn] = useState(false);
  const [activeTier, setActiveTier] = useState(1);
  const [filterSize, setFilterSize] = useState("ALL");
  const mobile = useIsMobile();

  const [introRef, introVis] = useScrollReveal(0.08);
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
        <svg width="90" height="18" viewBox="0 0 90 18" fill="none">
          <text x="0" y="15" fontFamily="'Poppins',sans-serif" fontWeight="800" fontSize="16" fill={scrolled?"#000":"#fff"} letterSpacing="2">NELSON</text>
          <polygon points="68,1 74,1 71,8" fill="#00BADC"/>
        </svg>
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
        minHeight:"100dvh", background:C.bgHero,
        display:"flex", flexDirection:"column",
        justifyContent: mobile ? "center" : "flex-end",
        padding: mobile ? "88px 5vw 5vh" : "0 6vw 10vh",
        position:"relative", overflow:"hidden",
      }}>
        {/* Blue gradient accent */}
        <div style={{ position:"absolute", top:0, right:0, width:"55vw", height:"100%",
          background:"linear-gradient(135deg,transparent 30%,rgba(0,186,220,0.06) 70%,rgba(0,186,220,0.11) 100%)",
          pointerEvents:"none" }}/>
        {/* Subtle texture grain */}
        <div style={{ position:"absolute", inset:0, opacity:0.03,
          backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize:"256px 256px", pointerEvents:"none" }}/>

        {/* Desktop-only: right image placeholder */}
        {!mobile && (
          <div style={{ position:"absolute", right:"5vw", top:"50%", transform:"translateY(-50%)",
            width:"42vw", maxWidth:600, opacity:heroIn?1:0, transition:"opacity 1.2s ease 0.4s" }}>
            <ImgPlaceholder label="Hero — Architecture / Interior Photograph" aspectRatio="3/4" style={{ borderRadius:"0.5rem" }}/>
          </div>
        )}

        {/* Desktop-only: top metadata bar */}
        {!mobile && (
          <div style={{ position:"absolute", top:80, left:"6vw", right:"6vw",
            display:"flex", justifyContent:"space-between", alignItems:"center",
            borderBottom:"1px solid rgba(255,255,255,0.07)", paddingBottom:"1rem" }}>
            <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem", fontWeight:500,
              letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(255,255,255,0.25)" }}>
              Asset Strategy &amp; Repositioning
            </span>
            <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem", fontWeight:500,
              letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(255,255,255,0.25)" }}>
              Minneapolis · Chicago · Atlanta · Philadelphia · Boston
            </span>
          </div>
        )}

        {/* Hero copy */}
        <div style={{ maxWidth: mobile ? "100%" : "50vw", position:"relative", zIndex:2 }}>
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

          {/* Mobile: image placeholder inline */}
          {mobile && (
            <div style={{ ...fade(heroIn,0.32), marginBottom:"2rem" }}>
              <ImgPlaceholder label="Architecture / Interior Photograph" aspectRatio="16/9" style={{ borderRadius:"0.5rem" }}/>
            </div>
          )}

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
      <div style={{ background:"#00BADC", padding:"0.875rem 0", overflow:"hidden" }}>
        <div style={{ display:"flex", gap:"3rem", animation:"marquee 22s linear infinite", whiteSpace:"nowrap", width:"max-content" }}>
          {[...Array(3)].map((_,r)=>(
            ["Amenity Sprint","Lobby Activation","Roof Deck Concept","Tenant Lounge","Building Reposition","Campus Study","Competitive Analysis","Design Language","Visualization","Floor Plans"].map((item,i)=>(
              <span key={`${r}-${i}`} style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.65rem", fontWeight:600, letterSpacing:"0.2em", textTransform:"uppercase", color:"#fff" }}>
                {item} <span style={{ opacity:0.5, marginLeft:"1rem" }}>·</span>
              </span>
            ))
          ))}
        </div>
      </div>

      {/* ── INTRO ── */}
      <section id="approach" style={{ padding: mobile?"4rem 5vw":"8rem 6vw", background:"#fff" }}>
        <div ref={introRef} style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{
            display:"grid",
            gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
            gap: mobile ? "2.5rem" : "6rem",
            alignItems:"start"
          }}>
            <div>
              <div style={{ ...fade(introVis,0), fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem", fontWeight:600,
                letterSpacing:"0.2em", textTransform:"uppercase", color:"#00BADC", marginBottom:"1rem" }}>What We Do</div>
              <h2 style={{ ...fade(introVis,0.1), fontFamily:"'Poppins',sans-serif", fontWeight:800,
                fontSize: mobile?"clamp(1.7rem,6vw,2.2rem)":"clamp(2rem,3.5vw,3rem)",
                lineHeight:1.15, color:"#000", marginBottom:"1.25rem" }}>
                Design intelligence,<br/>at the speed of<br/>leasing decisions.
              </h2>
              <p style={{ ...fade(introVis,0.2), fontFamily:"'Poppins',sans-serif", fontSize:"0.9rem",
                fontWeight:300, color:"#555", lineHeight:1.8, marginBottom:"1rem" }}>
                Asset Strategy is NELSON's design and real estate consultancy focused on eliminating vacancy, retaining tenants, and making buildings more market competitive.
              </p>
              <p style={{ ...fade(introVis,0.28), fontFamily:"'Poppins',sans-serif", fontSize:"0.9rem",
                fontWeight:300, color:"#555", lineHeight:1.8 }}>
                Our Amenity Sprint delivers a compelling concept that gives ownership and leasing teams something tangible — before the RFP deadline, before the broker call, before the competitor finishes their renovation.
              </p>
              <div style={{ ...fade(introVis,0.36), marginTop:"2rem", display:"flex", gap:"0.75rem", flexWrap:"wrap" }}>
                {["Tenant Planning","Space Management","Building Repositioning"].map(s=>(
                  <span key={s} style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.65rem", fontWeight:500,
                    color:"#000", background:"#f0f0f0", padding:"0.35rem 0.85rem", borderRadius:99 }}>{s}</span>
                ))}
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
              <div style={{ ...fade(introVis,0.15) }}>
                <ImgPlaceholder label="Interior — Lobby / Amenity Space" aspectRatio="4/3"/>
              </div>
              <div style={{ ...fade(introVis,0.25), display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
                <ImgPlaceholder label="Floor Plan / Axon" aspectRatio="1/1"/>
                <ImgPlaceholder label="Design Language" aspectRatio="1/1"/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SPRINT PROCESS ── */}
      <SprintProcessSection />

      {/* ── TIERS ── */}
      <section id="approach-tiers" style={{ padding: mobile?"4rem 5vw":"7rem 6vw", background:"#fff" }}>
        <div ref={tierRef} style={{ maxWidth:1100, margin:"0 auto" }}>
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
                lineHeight:1.15, color:"#000", marginBottom:"1rem" }}>
                One size<br/>never fits all.
              </h2>
              <p style={{ ...fade(tierVis,0.2), fontFamily:"'Poppins',sans-serif", fontSize:"0.85rem",
                fontWeight:300, color:"#666", lineHeight:1.8 }}>
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
      <section id="projects" style={{ padding: mobile?"4rem 5vw 5rem":"7rem 6vw 8rem", background:"#f7f7f7" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div ref={projRef} style={{ display:"flex", justifyContent:"space-between",
            alignItems: mobile?"flex-start":"flex-end",
            flexDirection: mobile?"column":"row",
            gap:"1.25rem", marginBottom:"2.5rem" }}>
            <div>
              <div style={{ ...fade(projVis,0), fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem", fontWeight:600,
                letterSpacing:"0.2em", textTransform:"uppercase", color:"#00BADC", marginBottom:"0.6rem" }}>Sprint Portfolio</div>
              <h2 style={{ ...fade(projVis,0.1), fontFamily:"'Poppins',sans-serif", fontWeight:800,
                fontSize: mobile?"clamp(1.7rem,6vw,2.2rem)":"clamp(1.8rem,3vw,2.5rem)", color:"#000" }}>
                10 Studies. 5 Markets.
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
              <svg width="90" height="18" viewBox="0 0 90 18" fill="none" style={{ marginBottom:"0.875rem" }}>
                <text x="0" y="15" fontFamily="'Poppins',sans-serif" fontWeight="800" fontSize="16" fill="#fff" letterSpacing="2">NELSON</text>
                <polygon points="68,1 74,1 71,8" fill="#00BADC"/>
              </svg>
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

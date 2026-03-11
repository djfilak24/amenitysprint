"use client";
import { PROJECTS } from "@/lib/projects";
import ConceptPhase from "@/components/ConceptPhase";
import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

const useScrollReveal = (threshold = 0.07) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
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

const useCountUp = (target, duration = 1600, trigger = false, delay = 0) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    const timer = setTimeout(() => {
      let start = null;
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target));
        if (p < 1) requestAnimationFrame(step);
        else setVal(target);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timer);
  }, [trigger, target, duration, delay]);
  return val;
};

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE PLACEHOLDER
// ─────────────────────────────────────────────────────────────────────────────

const Img = ({ label, aspect = "4/3", src = null, style = {}, hover = false }) => {
  const [hov, setHov] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const showReal = src && !imgErr;

  if (showReal) {
    return (
      <div
        onMouseEnter={() => hover && setHov(true)}
        onMouseLeave={() => hover && setHov(false)}
        style={{
          width: "100%", aspectRatio: aspect,
          borderRadius: "2px", overflow: "hidden", position: "relative",
          ...style,
        }}
      >
        <img
          src={src} alt={label}
          onError={() => setImgErr(true)}
          style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
            transition: "transform 0.55s ease",
            transform: hov ? "scale(1.04)" : "scale(1)",
          }}
        />
        {hover && (
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.62) 0%, transparent 55%)",
            opacity: hov ? 1 : 0, transition: "opacity 0.3s ease",
            display: "flex", alignItems: "flex-end", padding: "0.875rem",
          }}>
            <span style={{
              fontFamily: "'Poppins',sans-serif", fontSize: "0.58rem", fontWeight: 600,
              letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.92)",
            }}>{label}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={() => hover && setHov(false)}
      style={{
        width: "100%", aspectRatio: aspect,
        background: "linear-gradient(145deg,#282a2c 0%,#1e2022 60%,#252729 100%)",
        borderRadius: "1.5rem", position: "relative", overflow: "hidden",
        cursor: hover ? "pointer" : "default",
        ...style,
      }}
    >
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)",
        backgroundSize: "28px 28px",
      }} />
      {[0,1,2,3].map(c => (
        <div key={c} style={{
          position: "absolute",
          top: c < 2 ? 14 : "auto", bottom: c >= 2 ? 14 : "auto",
          left: c % 2 === 0 ? 14 : "auto", right: c % 2 === 1 ? 14 : "auto",
          width: 18, height: 18,
          borderTop: c < 2 ? "1.5px solid rgba(0,186,220,0.5)" : "none",
          borderBottom: c >= 2 ? "1.5px solid rgba(0,186,220,0.5)" : "none",
          borderLeft: c % 2 === 0 ? "1.5px solid rgba(0,186,220,0.5)" : "none",
          borderRight: c % 2 === 1 ? "1.5px solid rgba(0,186,220,0.5)" : "none",
        }} />
      ))}
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Poppins',sans-serif", fontSize: "0.55rem", fontWeight: 500,
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: hov ? "rgba(255,255,255,0.32)" : "rgba(255,255,255,0.18)",
        transition: "color 0.3s", textAlign: "center", padding: "0 1.5rem",
      }}>{label}</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT DATA
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────

const StatCard = ({ stat, trigger, index }) => {
  const val = useCountUp(stat.value, 1800, trigger, index * 180);
  return (
    <div style={{
      padding: "2rem 2rem 1.75rem",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "2px", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", bottom: 0, left: 0, height: "2px",
        width: trigger ? "100%" : "0%",
        background: "linear-gradient(90deg, #00BADC, rgba(0,186,220,0.2))",
        transition: `width ${1.5 + index * 0.2}s cubic-bezier(0.16,1,0.3,1) ${index * 0.15}s`,
      }} />
      <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800,
        fontSize: "clamp(2rem,3.5vw,2.8rem)", lineHeight: 1, color: "#fff",
        display: "flex", alignItems: "baseline", gap: "0.08em", marginBottom: "0.6rem" }}>
        <span>{val}</span>
        <span style={{ color: "#00BADC", fontSize: "0.5em", fontWeight: 700 }}>{stat.suffix}</span>
      </div>
      <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.78rem",
        fontWeight: 700, color: "#fff", marginBottom: "0.3rem" }}>{stat.label}</div>
      <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.7rem",
        fontWeight: 300, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>{stat.context}</div>
    </div>
  );
};

// ───────────────────────────────────────────────────────────���─────────────────
// EDITORIAL MASONRY GALLERY
// ─────────────────────────────────────────────────────────────────────────────

const MasonryGallery = ({ photos, mobile }) => {
  const colSpan = { hero: 3, large: 2, medium: 1, small: 1 };

  if (mobile) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.375rem" }}>
        {photos.map((p, i) => {
          const wide = p.size === "hero" || p.size === "large";
          return (
            <div key={i} style={{ gridColumn: wide ? "1 / -1" : "auto" }}>
              <Img label={p.label} aspect={wide ? "16/9" : p.aspect} src={p.src} hover />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
      {photos.map((p, i) => (
        <div key={i} style={{
          gridColumn: `span ${colSpan[p.size] || 1}`,
          minHeight: p.size === "small" ? 200 : "auto",
        }}>
          <Img label={p.label} aspect={p.aspect} src={p.src} hover style={{ height: "100%", minHeight: "100%" }} />
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TESTIMONIAL CAROUSEL
// ─────────────────────────────────────────────────────────────────────────────

const TestimonialCarousel = ({ testimonials, mobile }) => {
  const [active, setActive] = useState(0);
  const typeColors = { owner: "#00BADC", leasing: "#18988B", tenant: "#FF7F40" };
  const typeLabel  = { owner: "Building Owner", leasing: "Leasing Team", tenant: "Building Tenant" };

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % testimonials.length), 5800);
    return () => clearInterval(t);
  }, [testimonials.length]);

  if (!testimonials.length) return null;
  const t = testimonials[active];

  return (
    <div style={{ position: "relative" }}>
      <div style={{
        position: "absolute", top: -28, left: -4,
        fontFamily: "Georgia,'Times New Roman',serif",
        fontSize: mobile ? "7rem" : "11rem", lineHeight: 1,
        color: "rgba(0,186,220,0.07)", userSelect: "none", pointerEvents: "none", fontWeight: 700,
      }}>"</div>

      <div key={active} style={{ animation: "fadeSlideUp 0.5s cubic-bezier(0.16,1,0.3,1)", minHeight: mobile ? 280 : 240 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: typeColors[t.type],
            boxShadow: `0 0 8px ${typeColors[t.type]}88` }} />
          <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.58rem", fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase", color: typeColors[t.type] }}>
            {typeLabel[t.type]}
          </span>
        </div>
        <blockquote style={{ fontFamily: "'Poppins',sans-serif",
          fontSize: mobile ? "0.92rem" : "1.05rem", fontWeight: 300, fontStyle: "italic",
          color: "#fff", lineHeight: 1.85, maxWidth: 680, marginBottom: "2rem" }}>
          "{t.quote}"
        </blockquote>
        <div>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.85rem",
            fontWeight: 700, color: "#fff" }}>{t.name}</div>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.72rem",
            fontWeight: 400, color: "rgba(255,255,255,0.38)", marginTop: 3 }}>
            {t.role} · {t.org}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "2.5rem" }}>
        {testimonials.map((tt, i) => (
          <button key={i} onClick={() => setActive(i)} style={{
            background: "none", border: "none", cursor: "pointer", padding: 0,
            display: "flex", alignItems: "center", gap: "0.5rem",
            opacity: i === active ? 1 : 0.3, transition: "opacity 0.3s",
          }}>
            <div style={{
              width: i === active ? 28 : 7, height: 7, borderRadius: 4,
              background: i === active ? typeColors[tt.type] : "rgba(255,255,255,0.25)",
              transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
            }} />
            {i === active && (
              <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.55rem",
                fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase",
                color: typeColors[tt.type] }}>{tt.name}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// JOURNEY TIMELINE
// ─────────────────────────────────────────────────────────────────────────────

const JourneyTimeline = ({ steps, mobile }) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!steps.length) return;
    const t = setInterval(() => setActiveStep(s => (s + 1) % steps.length), 2600);
    return () => clearInterval(t);
  }, [steps.length]);

  if (!steps.length) return (
    <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.82rem", fontWeight: 300,
      color: "rgba(255,255,255,0.28)", fontStyle: "italic" }}>
      Full journey timeline coming soon.
    </p>
  );

  if (mobile) {
    return (
      <div>
        {steps.map((s, i) => (
          <div key={i} onClick={() => setActiveStep(i)} style={{
            display: "flex", gap: "1.1rem", paddingBottom: "1.75rem",
            position: "relative", cursor: "pointer",
          }}>
            {i < steps.length - 1 && (
              <div style={{ position: "absolute", left: 13, top: 28, bottom: 0,
                width: 1, background: "rgba(255,255,255,0.06)" }} />
            )}
            <div style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%",
              background: "#1e2022",
              border: `2px solid ${i <= activeStep ? s.color : "rgba(255,255,255,0.1)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", zIndex: 1, transition: "border-color 0.4s",
            }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%",
                background: i <= activeStep ? s.color : "rgba(255,255,255,0.15)",
                transition: "background 0.4s" }} />
            </div>
            <div style={{ paddingTop: 2 }}>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.55rem", fontWeight: 700,
                letterSpacing: "0.16em", textTransform: "uppercase",
                color: i <= activeStep ? s.color : "rgba(255,255,255,0.2)",
                marginBottom: "0.2rem", transition: "color 0.3s" }}>
                {s.phase} · {s.week}
              </div>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.85rem", fontWeight: 700,
                color: i === activeStep ? "#fff" : "rgba(255,255,255,0.45)",
                marginBottom: "0.3rem", transition: "color 0.3s" }}>{s.label}</div>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.74rem", fontWeight: 300,
                color: "rgba(255,255,255,0.32)", lineHeight: 1.7,
                maxHeight: i === activeStep ? "5rem" : "0",
                overflow: "hidden", transition: "max-height 0.4s ease" }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Desktop horizontal
  return (
    <div>
      <div style={{ display: "flex", marginBottom: "0.6rem" }}>
        {["Sprint","Design","Build","Outcome"].map(phase => {
          const pSteps = steps.filter(s => s.phase === phase);
          if (!pSteps.length) return null;
          const pct = (pSteps.length / steps.length) * 100;
          const color = pSteps[0].color;
          return (
            <div key={phase} style={{ width: `${pct}%` }}>
              <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.54rem", fontWeight: 700,
                letterSpacing: "0.18em", textTransform: "uppercase", color }}>{phase}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "relative", height: 2, background: "rgba(255,255,255,0.07)", marginBottom: "2.5rem" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: `${((activeStep + 1) / steps.length) * 100}%`,
          background: steps[activeStep]?.color || "#00BADC",
          transition: "width 0.5s ease, background 0.4s",
          boxShadow: `0 0 8px ${steps[activeStep]?.color || "#00BADC"}99`,
        }} />
        {steps.map((s, i) => (
          <div key={i} onClick={() => setActiveStep(i)} style={{
            position: "absolute",
            left: `${(i / (steps.length - 1)) * 100}%`,
            top: "50%", transform: "translate(-50%,-50%)",
            width: i === activeStep ? 16 : 10, height: i === activeStep ? 16 : 10,
            borderRadius: "50%",
            background: i <= activeStep ? s.color : "#1e2022",
            border: `2px solid ${i <= activeStep ? s.color : "rgba(255,255,255,0.15)"}`,
            cursor: "pointer", transition: "all 0.3s ease", zIndex: 2,
            boxShadow: i === activeStep ? `0 0 12px ${s.color}99` : "none",
          }} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${steps.length},1fr)`, gap: "0.4rem" }}>
        {steps.map((s, i) => (
          <div key={i} onClick={() => setActiveStep(i)} style={{
            padding: "1rem 0.75rem",
            background: i === activeStep ? "rgba(255,255,255,0.05)" : "transparent",
            border: `1px solid ${i === activeStep ? s.color + "44" : "transparent"}`,
            borderRadius: "2px", cursor: "pointer", transition: "all 0.3s",
          }}>
            <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.54rem", fontWeight: 600,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: i <= activeStep ? s.color : "rgba(255,255,255,0.18)",
              marginBottom: "0.35rem", transition: "color 0.3s" }}>{s.week}</div>
            <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.74rem", fontWeight: 700,
              color: i === activeStep ? "#fff" : "rgba(255,255,255,0.38)",
              lineHeight: 1.35, marginBottom: "0.35rem", transition: "color 0.3s" }}>{s.label}</div>
            <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.65rem", fontWeight: 300,
              color: "rgba(255,255,255,0.28)", lineHeight: 1.65,
              maxHeight: i === activeStep ? "6rem" : "2.8rem",
              overflow: "hidden", transition: "max-height 0.4s ease" }}>{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// RELATED CARD
// ─────────────────────────────────────────────────────────────────────────────

const RelatedCard = ({ slug }) => {
  const p = PROJECTS[slug];
  if (!p) return null;
  const sizeColors = { S: "#18988B", M: "#00BADC", L: "#FF7F40", XL: "#4C0049" };
  const [hov, setHov] = useState(false);
  return (
    <a href={`/projects/${slug}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "block", textDecoration: "none",
        background: hov ? "#fff" : "#faf9f7",
        border: `1px solid ${hov ? "#ddd" : "#ebebeb"}`,
        borderRadius: "2px", overflow: "hidden",
        transition: "all 0.3s ease",
        boxShadow: hov ? "0 8px 32px rgba(0,0,0,0.1)" : "none",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
      }}>
      <Img label={`${p.name} — Hero`} aspect="16/9" style={{ borderRadius: 0 }} />
      <div style={{ padding: "1.1rem 1.4rem 1.4rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.45rem" }}>
          <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.58rem", fontWeight: 500,
            letterSpacing: "0.12em", textTransform: "uppercase", color: "#999" }}>{p.tag}</span>
          <span style={{ background: sizeColors[p.size], color: "#fff",
            fontFamily: "'Poppins',sans-serif", fontSize: "0.54rem", fontWeight: 700,
            letterSpacing: "0.08em", textTransform: "uppercase",
            padding: "0.15rem 0.5rem", borderRadius: 99 }}>{p.size}</span>
        </div>
        <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.92rem",
          fontWeight: 800, color: "#000", marginBottom: "0.2rem" }}>{p.name}</div>
        <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.7rem",
          fontWeight: 300, color: "#888" }}>{p.location} · {p.sprintDuration}</div>
      </div>
    </a>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE — accepts slug prop, defaults to 55-west-monroe
// In Next.js: pass params.slug from the dynamic route
// ─────────────────────────────────────────────────────────────────────────────

export default function ProjectPage({ slug = "55-west-monroe" }) {
  const P = PROJECTS[slug] || PROJECTS["55-west-monroe"];
  const mobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const [heroIn, setHeroIn] = useState(false);

  const [statsRef, statsVis]           = useScrollReveal(0.12);
  const [conceptRef, conceptVis]       = useScrollReveal(0.06);
  const [journeyRef, journeyVis]       = useScrollReveal(0.06);
  const [galleryRef, galleryVis]       = useScrollReveal(0.04);
  const [testimonialRef, testimonialVis] = useScrollReveal(0.08);
  const [relatedRef, relatedVis]       = useScrollReveal(0.08);

  useEffect(() => {
    setTimeout(() => setHeroIn(true), 80);
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const fd = (vis, delay = 0) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? "translateY(0)" : "translateY(22px)",
    transition: `opacity 0.75s ease ${delay}s, transform 0.75s ease ${delay}s`,
  });

  const sizeColors = { S: "#18988B", M: "#00BADC", L: "#FF7F40", XL: "#4C0049" };
  const sizeColor = sizeColors[P.size] || "#00BADC";

  return (
    <div style={{ fontFamily: "'Poppins',sans-serif", background: "#f4f3f0", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.6)}}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:#f4f3f0}
        ::-webkit-scrollbar-thumb{background:#00BADC}
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, height: 60,
        background: scrolled ? "rgba(244,243,240,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(0,0,0,0.07)" : "none",
        transition: "all 0.4s ease",
        padding: "0 5vw", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem",
          fontFamily: "'Poppins',sans-serif", fontSize: "0.65rem", fontWeight: 600,
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: scrolled ? "#555" : "rgba(255,255,255,0.7)", textDecoration: "none",
          transition: "color 0.3s" }}>
          <span style={{ fontSize: "0.8rem" }}>←</span> Sprint Portfolio
        </a>
        <span style={{
          fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: "0.85rem",
          letterSpacing: "0.12em", color: scrolled ? "#222" : "#fff",
          transition: "color 0.3s", display: "inline-flex", alignItems: "center", gap: "0.25rem",
        }}>
          NELSON
          <svg width="8" height="8" viewBox="0 0 8 8" style={{ marginTop: "-1px" }}>
            <polygon points="0,0 8,0 4,7" fill="#00BADC"/>
          </svg>
        </span>
        <a href="/#contact" style={{ background: "#00BADC",
          fontFamily: "'Poppins',sans-serif", fontSize: "0.62rem", fontWeight: 600, color: "#fff",
          padding: "0.42rem 1rem", borderRadius: "2px", textDecoration: "none",
          transition: "background 0.2s" }}
          onMouseOver={e => e.currentTarget.style.background = "#009abb"}
          onMouseOut={e => e.currentTarget.style.background = "#00BADC"}>
          Start a Sprint
        </a>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: mobile ? "88dvh" : "92dvh",
        background: "linear-gradient(158deg,#252729 0%,#1e2022 55%,#191b1d 100%)",
        position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        padding: mobile ? "80px 5vw 6vh" : "0 6vw 8vh",
      }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.035) 1px,transparent 1px)",
          backgroundSize: "28px 28px" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 65% 55% at 80% 50%,rgba(0,186,220,0.07) 0%,transparent 70%)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg,${sizeColor} 0%,rgba(0,186,220,0.25) 45%,transparent 70%)` }} />

        {!mobile && (
          <div style={{ position: "absolute", right: "5vw", top: "8vh", bottom: "12vh",
            width: "44vw", maxWidth: 620,
            opacity: heroIn ? 1 : 0, transition: "opacity 1.4s ease 0.25s",
            display: "flex", alignItems: "center" }}>
            {P.heroImage ? (
              <img 
                src={P.heroImage} 
                alt={`${P.name} — Built Project Hero`}
                style={{ 
                  width: "100%",
                  maxHeight: "100%",
                  objectFit: "cover",
                  borderRadius: "2px",
                  boxShadow: "0 40px 80px rgba(0,0,0,0.5)"
                }} 
              />
            ) : (
              <Img label={`${P.name} — Built Project Hero`} aspect="4/5"
                style={{ borderRadius: "2px", boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }} />
            )}
          </div>
        )}

        <div style={{ position: "absolute", top: mobile ? 68 : 76, left: mobile ? "5vw" : "6vw",
          display: "flex", alignItems: "center", gap: "0.5rem",
          opacity: heroIn ? 1 : 0, transition: "opacity 0.7s ease 0.15s" }}>
          {["Sprint Portfolio", P.tag, P.name].map((crumb, ci) => (
            <span key={ci} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              {ci > 0 && <span style={{ color: "rgba(255,255,255,0.12)", fontSize: "0.7rem" }}>›</span>}
              <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.54rem",
                fontWeight: ci === 2 ? 600 : 400, letterSpacing: "0.14em", textTransform: "uppercase",
                color: ci === 2 ? "#00BADC" : "rgba(255,255,255,0.22)" }}>{crumb}</span>
            </span>
          ))}
        </div>

        <div style={{ maxWidth: mobile ? "100%" : "46vw", position: "relative", zIndex: 2 }}>
          {mobile && (
            <div style={{ marginBottom: "1.5rem", opacity: heroIn ? 1 : 0, transition: "opacity 1s ease 0.2s" }}>
              {P.heroImage ? (
                <img 
                  src={P.heroImage} 
                  alt={`${P.name} — Built Project`}
                  style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: "2px" }} 
                />
              ) : (
                <Img label={`${P.name} — Built Project`} aspect="16/9" style={{ borderRadius: "2px" }} />
              )}
            </div>
          )}

          <div style={{ opacity: heroIn?1:0, transform: heroIn?"none":"translateY(12px)",
            transition: "all 0.7s ease 0.1s",
            display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.1rem" }}>
            <span style={{ background: sizeColor, color: "#fff",
              fontFamily: "'Poppins',sans-serif", fontSize: "0.58rem", fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "0.2rem 0.65rem", borderRadius: 99 }}>{P.size} Sprint</span>
            <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.58rem", fontWeight: 400,
              letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)" }}>
              {P.sprintDuration} · {P.investment} · {P.location}
            </span>
          </div>

          <h1 style={{ opacity: heroIn?1:0, transform: heroIn?"none":"translateY(18px)",
            transition: "all 0.75s ease 0.18s",
            fontFamily: "'Poppins',sans-serif", fontWeight: 800,
            fontSize: mobile ? "clamp(2rem,8vw,2.8rem)" : "clamp(2.8rem,4.5vw,4.6rem)",
            lineHeight: 1.03, color: "#fff", marginBottom: "0.6rem" }}>{P.name}</h1>

          <div style={{ opacity: heroIn?1:0, transform: heroIn?"none":"translateY(16px)",
            transition: "all 0.75s ease 0.24s",
            fontFamily: "'Poppins',sans-serif",
            fontSize: mobile ? "1rem" : "1.2rem", fontStyle: "italic",
            fontWeight: 300, color: "#00BADC", marginBottom: "0.85rem" }}>
            "{P.tagline}"
          </div>

          <p style={{ opacity: heroIn?1:0, transform: heroIn?"none":"translateY(14px)",
            transition: "all 0.75s ease 0.3s",
            fontFamily: "'Poppins',sans-serif",
            fontSize: mobile ? "0.85rem" : "0.95rem", fontWeight: 300,
            color: "rgba(255,255,255,0.45)", lineHeight: 1.85,
            maxWidth: 480, marginBottom: "1.75rem" }}>{P.unlockHeadline}</p>

          <div style={{ opacity: heroIn?1:0, transform: heroIn?"none":"translateY(12px)",
            transition: "all 0.75s ease 0.38s",
            display: "grid",
            gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4,auto)",
            gap: mobile ? "1rem 2rem" : "0 2.5rem",
            paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            {[[`${P.sqft} SF`,"Building Size"],[`${P.floors} Floors`,P.class],[P.location,"Market"],[P.year,"Sprint Year"]].map(([v,l]) => (
              <div key={l}>
                <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.88rem",
                  fontWeight: 700, color: "#fff" }}>{v}</div>
                <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.54rem",
                  fontWeight: 400, color: "rgba(255,255,255,0.24)",
                  marginTop: 3, letterSpacing: "0.08em", textTransform: "uppercase" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "absolute", bottom: mobile ? 18 : 24, left: "50%", transform: "translateX(-50%)",
          opacity: heroIn ? 0.38 : 0, transition: "opacity 1s ease 1s",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.5rem", fontWeight: 500,
            letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
            Scroll
          </div>
          <div style={{ width: 1, height: 28,
            background: "linear-gradient(to bottom,rgba(255,255,255,0.4),transparent)" }} />
        </div>
      </section>

      {/* ── STATS — VALUE UNLOCK ── */}
      <section style={{ background: "linear-gradient(160deg,#1e2022 0%,#191b1d 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ background: "#00BADC", padding: "0.55rem 5vw",
          display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff",
            animation: "pulseDot 2.2s infinite" }} />
          <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.6rem", fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase", color: "#fff" }}>
            Value Unlocked — Completed Project Outcomes
          </span>
        </div>

        <div ref={statsRef} style={{ padding: mobile ? "3.5rem 5vw 4rem" : "5rem 6vw 6rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: mobile?"1fr":"1fr 1fr",
              gap: mobile?"1rem":"4rem", marginBottom: mobile?"2.5rem":"3.5rem" }}>
              <div>
                <div style={{ ...fd(statsVis,0), fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem",
                  fontWeight:600, letterSpacing:"0.2em", textTransform:"uppercase",
                  color:"#00BADC", marginBottom:"0.75rem" }}>The Unlock</div>
                <h2 style={{ ...fd(statsVis,0.07), fontFamily:"'Poppins',sans-serif", fontWeight:800,
                  fontSize:mobile?"clamp(1.6rem,6vw,2rem)":"clamp(2rem,3vw,2.6rem)",
                  color:"#fff", lineHeight:1.15 }}>
                  Design that<br/>unlocks value.
                </h2>
              </div>
              <p style={{ ...fd(statsVis,0.12), fontFamily:"'Poppins',sans-serif", fontSize:"0.88rem",
                fontWeight:300, color:"rgba(255,255,255,0.38)", lineHeight:1.85 }}>
                {P.unlockSub}
              </p>
            </div>
            <div style={{ display:"grid",
              gridTemplateColumns:mobile?"1fr 1fr":"repeat(4,1fr)",
              gap:"1px", background:"rgba(255,255,255,0.06)" }}>
              {P.stats.map((s,i) => (
                <div key={i} style={{ ...fd(statsVis, 0.1 + i*0.08) }}>
                  <StatCard stat={s} trigger={statsVis} index={i} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONCEPT PHASE ── */}
      <section style={{ background:"#fff", padding:mobile?"4rem 5vw":"7rem 6vw" }}>
        <div ref={conceptRef}>
          <ConceptPhase
            concept={P.concept}
            sprintDuration={P.sprintDuration}
            visible={conceptVis}
            mobile={mobile}
          />
        </div>
      </section>

      {/* ── JOURNEY TIMELINE ── */}
      <section style={{ background:"linear-gradient(158deg,#252729 0%,#1e2022 60%,#191b1d 100%)",
        padding:mobile?"4rem 5vw":"7rem 6vw" }}>
        <div ref={journeyRef} style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ ...fd(journeyVis,0), fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem",
            fontWeight:600, letterSpacing:"0.2em", textTransform:"uppercase",
            color:"#00BADC", marginBottom:"0.75rem" }}>The Journey</div>
          <div style={{ display:"grid", gridTemplateColumns:mobile?"1fr":"1fr 2fr",
            gap:mobile?"1.5rem":"5rem", marginBottom:mobile?"2.5rem":"3.5rem", alignItems:"start" }}>
            <h2 style={{ ...fd(journeyVis,0.07), fontFamily:"'Poppins',sans-serif", fontWeight:800,
              fontSize:mobile?"clamp(1.6rem,6vw,2rem)":"clamp(1.8rem,2.8vw,2.4rem)",
              color:"#fff", lineHeight:1.15 }}>
              Sketch to<br/>built product.
            </h2>
            <p style={{ ...fd(journeyVis,0.12), fontFamily:"'Poppins',sans-serif", fontSize:"0.88rem",
              fontWeight:300, color:"rgba(255,255,255,0.35)", lineHeight:1.85 }}>
              From the first site visit to broker activation — every milestone across the full project lifecycle. Click any step to explore.
            </p>
          </div>
          <div style={{ ...fd(journeyVis,0.18) }}>
            <JourneyTimeline steps={P.journey} mobile={mobile} />
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section style={{ background:"#0d0f10", padding:mobile?"4rem 5vw":"7rem 6vw" }}>
        <div ref={galleryRef} style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between",
            flexWrap:"wrap", gap:"1rem", marginBottom:mobile?"2rem":"3rem" }}>
            <div>
              <div style={{ ...fd(galleryVis,0), fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem",
                fontWeight:600, letterSpacing:"0.2em", textTransform:"uppercase",
                color:"#00BADC", marginBottom:"0.75rem" }}>The Built Work</div>
              <h2 style={{ ...fd(galleryVis,0.07), fontFamily:"'Poppins',sans-serif", fontWeight:800,
                fontSize:mobile?"clamp(1.6rem,6vw,2rem)":"clamp(1.8rem,2.8vw,2.4rem)",
                color:"#fff", lineHeight:1.1 }}>From concept<br/>to reality.</h2>
            </div>
            <p style={{ ...fd(galleryVis,0.1), fontFamily:"'Poppins',sans-serif", fontSize:"0.7rem",
              fontWeight:300, color:"rgba(255,255,255,0.25)", fontStyle:"italic",
              maxWidth:260, lineHeight:1.7 }}>
              Hover any image for details. Replace placeholders with built project photography.
            </p>
          </div>
          <div style={{ ...fd(galleryVis,0.14) }}>
            <MasonryGallery photos={P.gallery} mobile={mobile} />
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background:"linear-gradient(160deg,#1e2022 0%,#252729 100%)",
        padding:mobile?"4rem 5vw":"7rem 6vw" }}>
        <div ref={testimonialRef} style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:mobile?"1fr":"1fr 2fr",
            gap:mobile?"2rem":"5rem", alignItems:"start" }}>
            <div>
              <div style={{ ...fd(testimonialVis,0), fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem",
                fontWeight:600, letterSpacing:"0.2em", textTransform:"uppercase",
                color:"#00BADC", marginBottom:"0.75rem" }}>Voices</div>
              <h2 style={{ ...fd(testimonialVis,0.07), fontFamily:"'Poppins',sans-serif", fontWeight:800,
                fontSize:mobile?"clamp(1.5rem,5vw,1.8rem)":"clamp(1.6rem,2.5vw,2.2rem)",
                color:"#fff", lineHeight:1.2, marginBottom:"1.1rem" }}>
                Ownership.<br/>Leasing.<br/>Tenants.
              </h2>
              <p style={{ ...fd(testimonialVis,0.12), fontFamily:"'Poppins',sans-serif", fontSize:"0.78rem",
                fontWeight:300, color:"rgba(255,255,255,0.28)", lineHeight:1.8 }}>
                The measure of a sprint isn't the deliverable — it's what happens after.
              </p>
              <div style={{ ...fd(testimonialVis,0.18),
                display:"flex", flexDirection:mobile?"row":"column",
                gap:mobile?"1rem":"0.75rem", marginTop:"2rem", flexWrap:"wrap" }}>
                {[["owner","#00BADC","Building Owner"],["leasing","#18988B","Leasing Team"],["tenant","#FF7F40","Building Tenant"]].map(([k,c,l]) => (
                  <div key={k} style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:c }} />
                    <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.65rem",
                      fontWeight:500, color:"rgba(255,255,255,0.32)" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ ...fd(testimonialVis,0.16) }}>
              {P.testimonials.length > 0
                ? <TestimonialCarousel testimonials={P.testimonials} mobile={mobile} />
                : <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.82rem",
                    fontWeight:300, color:"rgba(255,255,255,0.22)", fontStyle:"italic", lineHeight:1.8, paddingTop:"1rem" }}>
                    Client testimonials for this project are being collected.
                  </p>
              }
            </div>
          </div>
        </div>
      </section>

      {/* ── RELATED SPRINTS ── */}
      <section style={{ background:"#f4f3f0", padding:mobile?"4rem 5vw 5rem":"7rem 6vw 8rem" }}>
        <div ref={relatedRef} style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ ...fd(relatedVis,0), fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem",
            fontWeight:600, letterSpacing:"0.2em", textTransform:"uppercase",
            color:"#00BADC", marginBottom:"0.75rem" }}>Continue Exploring</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end",
            flexWrap:"wrap", gap:"1.5rem", marginBottom:"2.5rem" }}>
            <h2 style={{ ...fd(relatedVis,0.07), fontFamily:"'Poppins',sans-serif", fontWeight:800,
              fontSize:mobile?"clamp(1.5rem,5vw,1.8rem)":"clamp(1.6rem,2.5vw,2.2rem)",
              color:"#000" }}>Related Sprints</h2>
            <a href="/#projects" style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.7rem",
              fontWeight:600, color:"#000", textDecoration:"none",
              letterSpacing:"0.08em", textTransform:"uppercase",
              borderBottom:"1px solid #000", paddingBottom:"2px", transition:"color 0.2s, border-color 0.2s" }}
              onMouseOver={e=>{e.currentTarget.style.color="#00BADC";e.currentTarget.style.borderColor="#00BADC"}}
              onMouseOut={e=>{e.currentTarget.style.color="#000";e.currentTarget.style.borderColor="#000"}}>
              View All Projects →
            </a>
          </div>
          <div style={{ ...fd(relatedVis,0.12),
            display:"grid", gridTemplateColumns:mobile?"1fr":"repeat(3,1fr)", gap:"1rem" }}>
            {(P.related||[]).map(r => <RelatedCard key={r} slug={r} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background:"linear-gradient(135deg,#00BADC 0%,#0083b5 100%)",
        padding:mobile?"4rem 5vw":"6rem 6vw", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none",
          backgroundImage:"linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)",
          backgroundSize:"44px 44px" }} />
        <div style={{ maxWidth:620, margin:"0 auto", textAlign:"center", position:"relative" }}>
          <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.6rem", fontWeight:600,
            letterSpacing:"0.2em", textTransform:"uppercase",
            color:"rgba(255,255,255,0.6)", marginBottom:"1rem" }}>Start a Sprint</div>
          <h2 style={{ fontFamily:"'Poppins',sans-serif", fontWeight:800,
            fontSize:mobile?"clamp(1.8rem,6vw,2.4rem)":"clamp(2rem,3.5vw,3rem)",
            color:"#fff", lineHeight:1.2, marginBottom:"1.1rem" }}>
            Ready to unlock<br/>your asset's value?
          </h2>
          <p style={{ fontFamily:"'Poppins',sans-serif",
            fontSize:mobile?"0.85rem":"0.92rem", fontWeight:300,
            color:"rgba(255,255,255,0.8)", lineHeight:1.8, marginBottom:"2rem" }}>
            Tell us your building and your challenge. We'll scope the right sprint and have a concept in your hands in 2–6 weeks.
          </p>
          <div style={{ display:"flex", gap:"0.875rem", justifyContent:"center",
            flexDirection:mobile?"column":"row", alignItems:"center" }}>
            <a href="/#contact" style={{ background:"#fff",
              fontFamily:"'Poppins',sans-serif", fontSize:"0.8rem", fontWeight:700, color:"#000",
              padding:"0.95rem 2.25rem", borderRadius:"2px", textDecoration:"none",
              width:mobile?"100%":"auto", textAlign:"center",
              transition:"box-shadow 0.2s, transform 0.2s", display:"block" }}
              onMouseOver={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.18)"}}
              onMouseOut={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none"}}>
              Begin a Conversation
            </a>
            <a href="/#projects" style={{ background:"transparent",
              border:"1px solid rgba(255,255,255,0.45)",
              fontFamily:"'Poppins',sans-serif", fontSize:"0.8rem", fontWeight:600, color:"#fff",
              padding:"0.95rem 2.25rem", borderRadius:"2px", textDecoration:"none",
              width:mobile?"100%":"auto", textAlign:"center", transition:"border-color 0.2s" }}
              onMouseOver={e=>e.currentTarget.style.borderColor="#fff"}
              onMouseOut={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.45)"}>
              View All Projects
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:"#191b1d", padding:mobile?"2rem 5vw":"2.5rem 6vw" }}>
        <div style={{ maxWidth:1100, margin:"0 auto",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          flexWrap:"wrap", gap:"1rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"1.25rem", flexWrap:"wrap" }}>
            <svg width="70" height="14" viewBox="0 0 70 14" fill="none">
              <text x="0" y="12" fontFamily="'Poppins',sans-serif" fontWeight="800" fontSize="12"
                fill="#fff" letterSpacing="1.5">NELSON</text>
              <polygon points="50,0.5 55,0.5 52.5,6" fill="#00BADC"/>
            </svg>
            <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.62rem",
              fontWeight:300, color:"rgba(255,255,255,0.2)" }}>
              Asset Strategy · {P.name} Case Study
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background:"#00BADC",
              animation:"pulseDot 2.4s infinite" }} />
            <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"0.55rem",
              fontWeight:500, letterSpacing:"0.14em", textTransform:"uppercase",
              color:"rgba(255,255,255,0.2)" }}>NELSON Worldwide · 2025</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

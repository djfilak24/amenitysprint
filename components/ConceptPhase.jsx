"use client";
import { useState } from "react";

/**
 * ConceptPhase — Replaces the generic deliverable grid
 *
 * Structure:
 * 1. 4 diagnosis cards — what we found, project-specific
 * 2. Narrative paragraph — the sprint story
 * 3. Compact deliverables strip — what was produced
 * 4. Concept photography grid
 */

const Img = ({ label, aspect = "4/3", src = null, hover = false, style = {} }) => {
  const [hov, setHov] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  if (src && !imgErr) {
    return (
      <div style={{ width: "100%", aspectRatio: aspect, borderRadius: "2px",
        overflow: "hidden", position: "relative", ...style }}
        onMouseEnter={() => hover && setHov(true)}
        onMouseLeave={() => hover && setHov(false)}>
        <img src={src} alt={label} onError={() => setImgErr(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
            transform: hov ? "scale(1.04)" : "scale(1)", transition: "transform 0.55s ease" }} />
        {hover && (
          <div style={{ position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)",
            opacity: hov ? 1 : 0, transition: "opacity 0.3s ease",
            display: "flex", alignItems: "flex-end", padding: "0.875rem" }}>
            <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.56rem", fontWeight: 600,
              letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.9)" }}>
              {label}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div onMouseEnter={() => hover && setHov(true)} onMouseLeave={() => hover && setHov(false)}
      style={{ width: "100%", aspectRatio: aspect,
        background: hov
          ? "linear-gradient(145deg,#2e3032 0%,#252729 60%,#2a2c2e 100%)"
          : "linear-gradient(145deg,#2a2c2e 0%,#1e2022 60%,#252729 100%)",
        borderRadius: "2px", position: "relative", overflow: "hidden",
        transition: "background 0.4s ease", cursor: hover ? "pointer" : "default", ...style }}>
      <div style={{ position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px)",
        backgroundSize: "20px 20px" }} />
      {[0,1,2,3].map(c => (
        <div key={c} style={{
          position: "absolute",
          top: c < 2 ? 10 : "auto", bottom: c >= 2 ? 10 : "auto",
          left: c % 2 === 0 ? 10 : "auto", right: c % 2 === 1 ? 10 : "auto",
          width: 12, height: 12,
          borderTop: c < 2 ? "1.5px solid rgba(0,186,220,0.28)" : "none",
          borderBottom: c >= 2 ? "1.5px solid rgba(0,186,220,0.28)" : "none",
          borderLeft: c % 2 === 0 ? "1.5px solid rgba(0,186,220,0.28)" : "none",
          borderRight: c % 2 === 1 ? "1.5px solid rgba(0,186,220,0.28)" : "none",
        }} />
      ))}
      {hover && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,186,220,0.06)",
          border: "1px solid rgba(0,186,220,0.22)",
          opacity: hov ? 1 : 0, transition: "opacity 0.3s",
          display: "flex", alignItems: "flex-end", padding: "0.875rem" }}>
          <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.56rem", fontWeight: 600,
            letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.88)" }}>
            {label}
          </span>
        </div>
      )}
      <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, textAlign: "center",
        fontFamily: "'Poppins',sans-serif", fontSize: "0.46rem", fontWeight: 500,
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.14)", transition: "color 0.3s" }}>{label}</div>
    </div>
  );
};

export default function ConceptPhase({ concept, sprintDuration, visible, mobile }) {
  const [activeFindings, setActiveFindings] = useState(null);

  const fd = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.75s ease ${delay}s, transform 0.75s ease ${delay}s`,
  });

  const { diagnosis = [], narrative = "", deliverables = [], conceptPhotos = [] } = concept;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>

      {/* ── SECTION HEADER ── */}
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "5fr 7fr",
        gap: mobile ? "1.25rem" : "5rem", marginBottom: mobile ? "2.5rem" : "3.5rem", alignItems: "start" }}>
        <div>
          <div style={{ ...fd(0), fontFamily: "'Poppins',sans-serif", fontSize: "0.6rem",
            fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase",
            color: "#00BADC", marginBottom: "0.75rem" }}>Concept Phase</div>
          <h2 style={{ ...fd(0.07), fontFamily: "'Poppins',sans-serif", fontWeight: 800,
            fontSize: mobile ? "clamp(1.6rem,6vw,2rem)" : "clamp(1.8rem,2.8vw,2.4rem)",
            color: "#000", lineHeight: 1.15 }}>
            {sprintDuration}.<br />Full design<br />intelligence.
          </h2>
        </div>
        <p style={{ ...fd(0.12), fontFamily: "'Poppins',sans-serif", fontSize: "0.9rem",
          fontWeight: 300, color: "#555", lineHeight: 1.9 }}>{narrative}</p>
      </div>

      {/* ── DIAGNOSIS — 4 findings specific to THIS building ── */}
      {diagnosis.length > 0 && (
        <div style={{ ...fd(0.16), marginBottom: mobile ? "2.5rem" : "3rem" }}>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.56rem", fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase", color: "#bbb", marginBottom: "1rem" }}>
            Sprint Findings — What We Discovered
          </div>
          <div style={{ display: "grid",
            gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)",
            gap: mobile ? "0.75rem" : "1rem" }}>
            {diagnosis.map((d, i) => (
              <div
                key={i}
                onClick={() => setActiveFindings(activeFindings === i ? null : i)}
                style={{
                  background: activeFindings === i ? "#fff" : "#faf9f7",
                  border: `1px solid ${activeFindings === i ? d.color : "#ebebeb"}`,
                  borderRadius: "2px", padding: mobile ? "1.1rem" : "1.5rem",
                  cursor: "pointer", transition: "all 0.25s ease",
                  boxShadow: activeFindings === i ? `0 4px 20px ${d.color}18` : "none",
                  position: "relative", overflow: "hidden",
                }}
              >
                {/* Color tag on top edge */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 3,
                  background: d.color,
                  transform: activeFindings === i ? "scaleX(1)" : "scaleX(0.35)",
                  transformOrigin: "left",
                  transition: "transform 0.35s ease",
                }} />
                {/* Step number */}
                <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.5rem", fontWeight: 700,
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  color: activeFindings === i ? d.color : "#ccc",
                  marginBottom: "0.5rem", transition: "color 0.25s" }}>
                  0{i + 1} / {d.label}
                </div>
                {/* Finding text */}
                <p style={{
                  fontFamily: "'Poppins',sans-serif",
                  fontSize: mobile ? "0.75rem" : "0.82rem",
                  fontWeight: activeFindings === i ? 400 : 300,
                  color: activeFindings === i ? "#111" : "#888",
                  lineHeight: 1.75,
                  transition: "color 0.25s, font-weight 0.25s",
                }}>
                  {d.finding}
                </p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.58rem", fontWeight: 400,
            color: "#ccc", marginTop: "0.6rem", fontStyle: "italic" }}>
            Click any finding to expand
          </p>
        </div>
      )}

      {/* ── DELIVERABLES STRIP ── */}
      {deliverables.length > 0 && (
        <div style={{ ...fd(0.22), marginBottom: mobile ? "2.5rem" : "3rem" }}>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.56rem", fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase", color: "#bbb", marginBottom: "0.875rem" }}>
            What Was Delivered
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {deliverables.map((d, i) => (
              <div key={i} style={{
                fontFamily: "'Poppins',sans-serif", fontSize: "0.72rem", fontWeight: 500,
                color: "#333",
                background: "#fff", border: "1px solid #e8e8e8",
                padding: "0.35rem 0.875rem", borderRadius: 99,
                display: "flex", alignItems: "center", gap: "0.5rem",
              }}>
                <span style={{ color: "#00BADC", fontSize: "0.6rem" }}>✓</span>
                {d}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CONCEPT PHOTOGRAPHY ── */}
      {conceptPhotos.length > 0 && (
        <div style={{ ...fd(0.26) }}>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: "0.56rem", fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase", color: "#bbb", marginBottom: "1rem" }}>
            Concept Deliverables — Sprint Output
          </div>
          <div style={{ display: "grid",
            gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(3, 1fr)",
            gap: "0.5rem" }}>
            {conceptPhotos.map((ph, i) => {
              const isWide = ph.aspect === "16/9";
              return (
                <div key={i} style={{
                  gridColumn: isWide ? (mobile ? "1 / -1" : "span 3") : "auto",
                }}>
                  <Img label={ph.label} aspect={ph.aspect} src={ph.src} hover />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

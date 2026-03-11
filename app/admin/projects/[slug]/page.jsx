'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ImagePicker from '../../../../components/admin/ImagePicker';
import projectsData from '../../../../lib/projects-data.json';

const TEAL = '#00BADC';
const BG = '#111111';
const NAV_BG = '#1A1A1A';
const BORDER = '#2A2A2A';
const DANGER = '#FF7F40';

function inpStyle(extra) {
  return {
    background: '#1A1A1A', border: '1px solid #333', borderRadius: 6,
    padding: '10px 12px', color: '#F5F5F5', fontFamily: "'Poppins',sans-serif",
    fontSize: '0.82rem', width: '100%', boxSizing: 'border-box',
    outline: 'none', ...(extra || {}),
  };
}

function FieldLabel({ text }) {
  return (
    <div style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{text}</div>
  );
}

function Accordion({ title, defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen || false);
  return (
    <div style={{ marginBottom: 12 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: NAV_BG, border: `1px solid ${BORDER}`, borderRadius: open ? '8px 8px 0 0' : 8,
        padding: '14px 18px', color: '#F5F5F5', fontFamily: "'Poppins',sans-serif",
        fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left',
      }}>
        <span>{title}</span>
        <span style={{ fontSize: 18, color: TEAL, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>›</span>
      </button>
      {open && (
        <div style={{ background: '#161616', border: `1px solid ${BORDER}`, borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '1.5rem' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function Field({ labelText, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <FieldLabel text={labelText} />
      {children}
    </div>
  );
}

function Row({ children, cols }) {
  const c = cols || 2;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${c}, 1fr)`, gap: 12, marginBottom: 16 }}>
      {children}
    </div>
  );
}

function emptyProject() {
  return {
    slug: '', name: '', tagline: '', tag: '', size: 'M', location: '',
    sprintDuration: '', investment: '', sqft: '', floors: '', class: '',
    year: new Date().getFullYear().toString(), shortSummary: '',
    cardImage: null, heroImage: null,
    unlockHeadline: '', unlockSub: '',
    stats: [
      { value: 0, suffix: '%', label: '', context: '' },
      { value: 0, suffix: '%', label: '', context: '' },
      { value: 0, suffix: '%', label: '', context: '' },
      { value: 0, suffix: ' mo', label: '', context: '' },
    ],
    concept: {
      headline: '', narrative: '',
      deliverables: [''],
      diagnosis: [
        { label: 'The Problem', finding: '', color: '#FF7F40' },
        { label: 'The Asset', finding: '', color: '#00BADC' },
        { label: 'The Market Signal', finding: '', color: '#18988B' },
        { label: 'The Unlock Insight', finding: '', color: '#FFD53D' },
      ],
      conceptPhotos: [
        { label: 'Concept Drawing 1', aspect: '16/9', src: null },
        { label: 'Concept Drawing 2', aspect: '4/3', src: null },
        { label: 'Design Language Board', aspect: '4/3', src: null },
      ],
    },
    journey: [],
    gallery: [
      { label: 'Hero Image', size: 'hero', aspect: '21/9', src: null },
      { label: 'Feature Image', size: 'large', aspect: '3/2', src: null },
      { label: 'Detail A', size: 'small', aspect: '3/4', src: null },
      { label: 'Detail B', size: 'small', aspect: '3/4', src: null },
      { label: 'Interior A', size: 'medium', aspect: '4/3', src: null },
      { label: 'Interior B', size: 'medium', aspect: '4/3', src: null },
    ],
    testimonials: [],
    related: [null, null, null],
  };
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => (o != null ? o[k] : undefined), obj);
}

export default function ProjectEdit() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;
  const isNew = slug === 'new';

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [pushStatus, setPushStatus] = useState('');
  const allProjects = Object.values(projectsData.projects);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('admin_authed') !== 'true') {
      router.replace('/admin');
      return;
    }
    if (isNew) {
      setForm(emptyProject());
    } else {
      const p = projectsData.projects[slug];
      if (!p) { router.replace('/admin/projects'); return; }
      const empty = emptyProject();
      setForm({
        ...p,
        stats: p.stats || empty.stats,
        journey: p.journey || [],
        gallery: p.gallery || empty.gallery,
        testimonials: p.testimonials || [],
        related: p.related || [null, null, null],
        concept: {
          ...empty.concept,
          ...(p.concept || {}),
          deliverables: (p.concept?.deliverables?.length ? p.concept.deliverables : ['']),
          diagnosis: p.concept?.diagnosis || empty.concept.diagnosis,
          conceptPhotos: p.concept?.conceptPhotos || empty.concept.conceptPhotos,
        },
      });
    }
  }, [slug]);

  function update(path, value) {
    setForm(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }

  function updateArr(path, index, field, value) {
    setForm(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (const k of keys) obj = obj[k];
      obj[index][field] = value;
      return next;
    });
  }

  function addToArr(path, template) {
    setForm(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (const k of keys) obj = obj[k];
      obj.push(typeof template === 'function' ? template() : { ...template });
      return next;
    });
  }

  function removeFromArr(path, index) {
    setForm(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (const k of keys) obj = obj[k];
      obj.splice(index, 1);
      return next;
    });
  }

  function getPassword() {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem('admin_pass') || '';
  }

  async function save() {
    setSaving(true);
    setSaveMsg('');
    const targetSlug = isNew ? form.slug : slug;
    if (!targetSlug) { setSaveMsg('Slug is required.'); setSaving(false); return; }
    const res = await fetch('/api/admin/save-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getPassword()}` },
      body: JSON.stringify({ slug: targetSlug, projectData: form }),
    });
    setSaving(false);
    if (res.ok) {
      setSaveMsg('Saved! Refresh to see changes on the site after Push Live.');
      if (isNew) router.push(`/admin/projects/${form.slug}`);
    } else {
      const e = await res.json();
      setSaveMsg(`Error: ${e.error}`);
    }
  }

  async function deleteProject() {
    if (!confirm(`Delete project "${form.name}"? This cannot be undone.`)) return;
    const res = await fetch('/api/admin/save-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getPassword()}` },
      body: JSON.stringify({ slug, isDelete: true }),
    });
    if (res.ok) router.push('/admin/projects');
  }

  async function pushLive() {
    setPushStatus('Deploying…');
    const hookUrl = process.env.NEXT_PUBLIC_DEPLOY_HOOK_URL;
    if (!hookUrl) { setPushStatus('No deploy hook configured.'); return; }
    await fetch(hookUrl, { method: 'POST' });
    setPushStatus('Deploy triggered!');
    setTimeout(() => setPushStatus(''), 8000);
  }

  if (!form) {
    return <div style={{ padding: '4rem', color: 'rgba(255,255,255,0.4)', fontFamily: "'Poppins',sans-serif" }}>Loading…</div>;
  }

  // Inline input components
  function I({ path, type, placeholder }) {
    const val = getNestedValue(form, path);
    return (
      <input
        type={type || 'text'}
        value={val ?? ''}
        onChange={e => update(path, e.target.value)}
        placeholder={placeholder || ''}
        style={inpStyle()}
        onFocus={e => { e.target.style.borderColor = TEAL; }}
        onBlur={e => { e.target.style.borderColor = '#333'; }}
      />
    );
  }

  function TA({ path, rows, placeholder }) {
    const val = getNestedValue(form, path);
    return (
      <textarea
        value={val ?? ''}
        onChange={e => update(path, e.target.value)}
        rows={rows || 3}
        placeholder={placeholder || ''}
        style={{ ...inpStyle(), resize: 'vertical' }}
        onFocus={e => { e.target.style.borderColor = TEAL; }}
        onBlur={e => { e.target.style.borderColor = '#333'; }}
      />
    );
  }

  function SEL({ path, options }) {
    const val = getNestedValue(form, path);
    return (
      <select
        value={val ?? ''}
        onChange={e => update(path, e.target.value)}
        style={{ ...inpStyle(), cursor: 'pointer' }}
      >
        {options.map(o => typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>
        )}
      </select>
    );
  }

  function IP({ path }) {
    const val = getNestedValue(form, path) ?? null;
    return <ImagePicker value={val} onChange={v => update(path, v)} projectsData={projectsData} />;
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: "'Poppins',sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: NAV_BG, borderBottom: `1px solid ${BORDER}`, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <a href="/" target="_blank" style={{ color: '#F5F5F5', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600, opacity: 0.7 }}>← NELSON Amenity Sprint</a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {pushStatus && <span style={{ fontSize: '0.72rem', color: '#18988B' }}>{pushStatus}</span>}
          <button onClick={pushLive} style={{ background: TEAL, border: 'none', borderRadius: 6, padding: '7px 14px', color: '#111', fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}>↑ Push Live</button>
        </div>
      </div>

      <div style={{ paddingTop: 56, display: 'flex', minHeight: '100vh' }}>
        {/* Left nav */}
        <div style={{ width: 240, background: NAV_BG, borderRight: `1px solid ${BORDER}`, minHeight: 'calc(100vh - 56px)', padding: '1.25rem 0', flexShrink: 0, overflowY: 'auto' }}>
          <div style={{ padding: '0 1rem 0.75rem', fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Projects</div>
          {allProjects.sort((a, b) => a.name.localeCompare(b.name)).map(p => (
            <a key={p.slug} href={`/admin/projects/${p.slug}`} style={{
              display: 'block', padding: '9px 1rem', fontSize: '0.73rem',
              color: p.slug === slug ? '#fff' : 'rgba(255,255,255,0.6)',
              textDecoration: 'none',
              borderLeft: p.slug === slug ? `3px solid ${TEAL}` : '3px solid transparent',
              background: p.slug === slug ? 'rgba(0,186,220,0.08)' : 'transparent',
              transition: 'all 0.15s',
            }}
              onMouseOver={e => { if (p.slug !== slug) { e.currentTarget.style.background = '#222'; e.currentTarget.style.color = '#fff'; } }}
              onMouseOut={e => { if (p.slug !== slug) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; } }}
            >
              <div style={{ fontWeight: p.slug === slug ? 600 : 400 }}>{p.name}</div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{p.size} · {p.location}</div>
            </a>
          ))}
          <div style={{ padding: '0.75rem 1rem 0', borderTop: `1px solid ${BORDER}`, marginTop: '0.75rem' }}>
            <a href="/admin/projects/new" style={{ display: 'block', textAlign: 'center', background: 'transparent', border: `1px solid ${TEAL}`, borderRadius: 6, padding: '8px', color: TEAL, fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: '0.72rem', textDecoration: 'none' }}>+ Add New</a>
          </div>
        </div>

        {/* Form area */}
        <div style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 56px)' }}>
          <div style={{ maxWidth: 860, padding: '2rem 2.5rem 4rem', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: TEAL, marginBottom: 4 }}>
                  {isNew ? 'New Project' : 'Edit Project'}
                </div>
                <h1 style={{ fontWeight: 800, fontSize: '1.5rem', color: '#F5F5F5', margin: 0, lineHeight: 1.2 }}>
                  {isNew ? 'New Sprint Project' : form.name}
                </h1>
              </div>
              {!isNew && (
                <button onClick={deleteProject} style={{ background: 'transparent', border: `1px solid ${DANGER}`, borderRadius: 6, padding: '8px 14px', color: DANGER, fontFamily: "'Poppins',sans-serif", fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
                  Delete Project
                </button>
              )}
            </div>

            {/* SECTION 1: Basic Info */}
            <Accordion title="Basic Info" defaultOpen={true}>
              <Row>
                <div>
                  <FieldLabel text="Project Name" />
                  <I path="name" placeholder="55 WEST MONROE" />
                </div>
                <div>
                  <FieldLabel text="Slug" />
                  <input
                    value={form.slug}
                    readOnly={!isNew}
                    onChange={e => isNew && update('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                    placeholder="55-west-monroe"
                    style={{ ...inpStyle(), opacity: isNew ? 1 : 0.5, cursor: isNew ? 'text' : 'not-allowed' }}
                    onFocus={e => { if (isNew) e.target.style.borderColor = TEAL; }}
                    onBlur={e => { e.target.style.borderColor = '#333'; }}
                  />
                  {isNew && <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>Auto-generated from name. Cannot be changed after save.</div>}
                </div>
              </Row>
              <Row>
                <div><FieldLabel text="Tagline" /><I path="tagline" placeholder="The Urban Eddy" /></div>
                <div><FieldLabel text="Tag / Category" /><I path="tag" placeholder="Building Reposition" /></div>
              </Row>
              <Row cols={4}>
                <div><FieldLabel text="Size" /><SEL path="size" options={['S', 'M', 'L', 'XL']} /></div>
                <div><FieldLabel text="Year" /><I path="year" placeholder="2023" /></div>
                <div><FieldLabel text="Sprint Duration" /><I path="sprintDuration" placeholder="4 Weeks" /></div>
                <div><FieldLabel text="Investment" /><I path="investment" placeholder="$12K–$15K" /></div>
              </Row>
              <Row cols={4}>
                <div><FieldLabel text="Location" /><I path="location" placeholder="Chicago, IL" /></div>
                <div><FieldLabel text="Sqft" /><I path="sqft" placeholder="780,000" /></div>
                <div><FieldLabel text="Floors" /><I path="floors" placeholder="40" /></div>
                <div><FieldLabel text="Class" /><I path="class" placeholder="Class A" /></div>
              </Row>
              <Field labelText="Short Summary">
                <TA path="shortSummary" rows={2} placeholder="1–2 sentences shown below tagline on landing page." />
              </Field>
            </Accordion>

            {/* SECTION 2: Hero Images */}
            <Accordion title="Hero Images">
              <Field labelText="Card Image (landing page thumbnail)">
                <IP path="cardImage" />
              </Field>
              <Field labelText="Hero Image (project page header)">
                <IP path="heroImage" />
              </Field>
            </Accordion>

            {/* SECTION 3: Hero Unlock */}
            <Accordion title="Hero Unlock">
              <Field labelText="Unlock Headline">
                <TA path="unlockHeadline" rows={2} placeholder="A ground floor reimagined as the building's front door to the city." />
              </Field>
              <Field labelText="Unlock Sub-headline">
                <TA path="unlockSub" rows={2} placeholder="The building had the bones. What it lacked was a story." />
              </Field>
            </Accordion>

            {/* SECTION 4: Outcome Stats */}
            <Accordion title="Outcome Stats">
              {form.stats.map((stat, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 100px 1fr 1fr', gap: 10, marginBottom: 12, alignItems: 'end' }}>
                  <div>
                    <FieldLabel text="Value" />
                    <input type="number" value={stat.value} onChange={e => updateArr('stats', i, 'value', Number(e.target.value))} style={inpStyle()} onFocus={e => { e.target.style.borderColor = TEAL; }} onBlur={e => { e.target.style.borderColor = '#333'; }} />
                  </div>
                  <div>
                    <FieldLabel text="Suffix" />
                    <input value={stat.suffix} onChange={e => updateArr('stats', i, 'suffix', e.target.value)} placeholder="% × mo SF" style={inpStyle()} onFocus={e => { e.target.style.borderColor = TEAL; }} onBlur={e => { e.target.style.borderColor = '#333'; }} />
                  </div>
                  <div>
                    <FieldLabel text="Label" />
                    <input value={stat.label} onChange={e => updateArr('stats', i, 'label', e.target.value)} placeholder="Vacancy Reduction" style={inpStyle()} onFocus={e => { e.target.style.borderColor = TEAL; }} onBlur={e => { e.target.style.borderColor = '#333'; }} />
                  </div>
                  <div>
                    <FieldLabel text="Context" />
                    <input value={stat.context} onChange={e => updateArr('stats', i, 'context', e.target.value)} placeholder="from 41% to 7% within 18 months" style={inpStyle()} onFocus={e => { e.target.style.borderColor = TEAL; }} onBlur={e => { e.target.style.borderColor = '#333'; }} />
                  </div>
                </div>
              ))}
              {form.stats.length < 4 && (
                <button onClick={() => addToArr('stats', { value: 0, suffix: '%', label: '', context: '' })} style={{ background: 'transparent', border: `1px solid #444`, borderRadius: 6, padding: '7px 14px', color: '#F5F5F5', fontSize: '0.75rem', cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>+ Add Stat</button>
              )}
            </Accordion>

            {/* SECTION 5: Concept Phase */}
            <Accordion title="Concept Phase">
              <Field labelText="Headline (optional)">
                <I path="concept.headline" placeholder="Four weeks, full design intelligence." />
              </Field>
              <Field labelText="Narrative">
                <TA path="concept.narrative" rows={4} />
              </Field>

              <div style={{ marginBottom: 16 }}>
                <FieldLabel text="Deliverables" />
                {form.concept.deliverables.map((d, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input value={d} onChange={e => { const next = [...form.concept.deliverables]; next[i] = e.target.value; update('concept.deliverables', next); }}
                      style={{ ...inpStyle(), flex: 1 }} placeholder={`Deliverable ${i + 1}`}
                      onFocus={e => { e.target.style.borderColor = TEAL; }} onBlur={e => { e.target.style.borderColor = '#333'; }} />
                    <button onClick={() => { const next = form.concept.deliverables.filter((_, j) => j !== i); update('concept.deliverables', next); }}
                      style={{ background: 'transparent', border: 'none', color: DANGER, cursor: 'pointer', fontSize: '1rem', padding: '0 6px' }}>✕</button>
                  </div>
                ))}
                {form.concept.deliverables.length < 8 && (
                  <button onClick={() => update('concept.deliverables', [...form.concept.deliverables, ''])}
                    style={{ background: 'transparent', border: `1px solid #444`, borderRadius: 6, padding: '7px 14px', color: '#F5F5F5', fontSize: '0.75rem', cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>+ Add Deliverable</button>
                )}
              </div>

              <div style={{ marginTop: 20, marginBottom: 8, fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Diagnosis (4 findings)</div>
              {form.concept.diagnosis.map((d, i) => (
                <div key={i} style={{ background: '#111', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '1rem', marginBottom: 10 }}>
                  <Row cols={2}>
                    <div>
                      <FieldLabel text="Label" />
                      <input value={d.label} onChange={e => updateArr('concept.diagnosis', i, 'label', e.target.value)} style={inpStyle()} onFocus={e => { e.target.style.borderColor = TEAL; }} onBlur={e => { e.target.style.borderColor = '#333'; }} />
                    </div>
                    <div>
                      <FieldLabel text="Accent Color" />
                      <input type="color" value={d.color} onChange={e => updateArr('concept.diagnosis', i, 'color', e.target.value)} style={{ ...inpStyle(), height: 42, padding: '4px 8px', cursor: 'pointer' }} />
                    </div>
                  </Row>
                  <FieldLabel text="Finding" />
                  <textarea value={d.finding} onChange={e => updateArr('concept.diagnosis', i, 'finding', e.target.value)} rows={2} style={{ ...inpStyle(), resize: 'vertical' }} onFocus={e => { e.target.style.borderColor = TEAL; }} onBlur={e => { e.target.style.borderColor = '#333'; }} />
                </div>
              ))}

              <div style={{ marginTop: 20, marginBottom: 8, fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Concept Photos</div>
              {form.concept.conceptPhotos.map((ph, i) => (
                <div key={i} style={{ background: '#111', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '1rem', marginBottom: 10 }}>
                  <Row cols={2}>
                    <div>
                      <FieldLabel text="Label" />
                      <input value={ph.label} onChange={e => updateArr('concept.conceptPhotos', i, 'label', e.target.value)} style={inpStyle()} onFocus={e => { e.target.style.borderColor = TEAL; }} onBlur={e => { e.target.style.borderColor = '#333'; }} />
                    </div>
                    <div>
                      <FieldLabel text="Aspect" />
                      <select value={ph.aspect} onChange={e => updateArr('concept.conceptPhotos', i, 'aspect', e.target.value)} style={{ ...inpStyle(), cursor: 'pointer' }}>
                        <option>4/3</option>
                        <option>16/9</option>
                        <option>3/4</option>
                        <option>21/9</option>
                      </select>
                    </div>
                  </Row>
                  <FieldLabel text="Image" />
                  <ImagePicker value={ph.src} onChange={v => updateArr('concept.conceptPhotos', i, 'src', v)} projectsData={projectsData} />
                </div>
              ))}
              <button onClick={() => addToArr('concept.conceptPhotos', { label: '', aspect: '4/3', src: null })} style={{ background: 'transparent', border: `1px solid #444`, borderRadius: 6, padding: '7px 14px', color: '#F5F5F5', fontSize: '0.75rem', cursor: 'pointer', fontFamily: "'Poppins',sans-serif", marginTop: 4 }}>+ Add Photo</button>
            </Accordion>

            {/* SECTION 6: Journey Timeline */}
            <Accordion title="Journey Timeline">
              {form.journey.map((step, i) => (
                <div key={i} style={{ background: '#111', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '1rem', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                    <button onClick={() => removeFromArr('journey', i)} style={{ background: 'transparent', border: 'none', color: DANGER, cursor: 'pointer', fontSize: '0.75rem', fontFamily: "'Poppins',sans-serif" }}>Remove</button>
                  </div>
                  <Row cols={4}>
                    <div>
                      <FieldLabel text="Phase" />
                      <select value={step.phase} onChange={e => updateArr('journey', i, 'phase', e.target.value)} style={{ ...inpStyle(), cursor: 'pointer' }}>
                        <option>Sprint</option>
                        <option>Design</option>
                        <option>Build</option>
                        <option>Outcome</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: 'span 1' }}>
                      <FieldLabel text="Week / Time" />
                      <input value={step.week} onChange={e => updateArr('journey', i, 'week', e.target.value)} placeholder="Week 1" style={inpStyle()} onFocus={e => { e.target.style.borderColor = TEAL; }} onBlur={e => { e.target.style.borderColor = '#333'; }} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <FieldLabel text="Label" />
                      <input value={step.label} onChange={e => updateArr('journey', i, 'label', e.target.value)} style={inpStyle()} onFocus={e => { e.target.style.borderColor = TEAL; }} onBlur={e => { e.target.style.borderColor = '#333'; }} />
                    </div>
                  </Row>
                  <FieldLabel text="Description" />
                  <textarea value={step.desc} onChange={e => updateArr('journey', i, 'desc', e.target.value)} rows={2} style={{ ...inpStyle(), resize: 'vertical' }} onFocus={e => { e.target.style.borderColor = TEAL; }} onBlur={e => { e.target.style.borderColor = '#333'; }} />
                </div>
              ))}
              {form.journey.length < 8 && (
                <button onClick={() => addToArr('journey', { phase: 'Sprint', week: '', label: '', desc: '' })} style={{ background: 'transparent', border: `1px solid #444`, borderRadius: 6, padding: '7px 14px', color: '#F5F5F5', fontSize: '0.75rem', cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>+ Add Step</button>
              )}
            </Accordion>

            {/* SECTION 7: Gallery */}
            <Accordion title="Gallery">
              {form.gallery.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, background: '#111', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '0.875rem 1rem' }}>
                  <div style={{ flexShrink: 0 }}>
                    <div style={{ fontSize: '0.62rem', color: TEAL, fontWeight: 600, marginBottom: 2 }}>{item.size}</div>
                    <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)' }}>{item.aspect}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 500, color: '#F5F5F5', marginBottom: 8 }}>{item.label}</div>
                    <ImagePicker value={item.src} onChange={v => updateArr('gallery', i, 'src', v)} projectsData={projectsData} />
                  </div>
                </div>
              ))}
            </Accordion>

            {/* SECTION 8: Testimonials */}
            <Accordion title="Testimonials">
              {form.testimonials.map((t, i) => (
                <div key={i} style={{ background: '#111', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '1rem', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                    <button onClick={() => removeFromArr('testimonials', i)} style={{ background: 'transparent', border: 'none', color: DANGER, cursor: 'pointer', fontSize: '0.75rem', fontFamily: "'Poppins',sans-serif" }}>Remove</button>
                  </div>
                  <Field labelText="Quote">
                    <textarea value={t.quote} onChange={e => updateArr('testimonials', i, 'quote', e.target.value)} rows={3} style={{ ...inpStyle(), resize: 'vertical' }} onFocus={e => { e.target.style.borderColor = TEAL; }} onBlur={e => { e.target.style.borderColor = '#333'; }} />
                  </Field>
                  <Row cols={2}>
                    <div>
                      <FieldLabel text="Name" />
                      <input value={t.name} onChange={e => updateArr('testimonials', i, 'name', e.target.value)} style={inpStyle()} onFocus={e => { e.target.style.borderColor = TEAL; }} onBlur={e => { e.target.style.borderColor = '#333'; }} />
                    </div>
                    <div>
                      <FieldLabel text="Role" />
                      <input value={t.role} onChange={e => updateArr('testimonials', i, 'role', e.target.value)} style={inpStyle()} onFocus={e => { e.target.style.borderColor = TEAL; }} onBlur={e => { e.target.style.borderColor = '#333'; }} />
                    </div>
                  </Row>
                  <Row cols={2}>
                    <div>
                      <FieldLabel text="Organization" />
                      <input value={t.org} onChange={e => updateArr('testimonials', i, 'org', e.target.value)} style={inpStyle()} onFocus={e => { e.target.style.borderColor = TEAL; }} onBlur={e => { e.target.style.borderColor = '#333'; }} />
                    </div>
                    <div>
                      <FieldLabel text="Type" />
                      <select value={t.type} onChange={e => updateArr('testimonials', i, 'type', e.target.value)} style={{ ...inpStyle(), cursor: 'pointer' }}>
                        <option value="owner">Owner</option>
                        <option value="leasing">Leasing</option>
                        <option value="tenant">Tenant</option>
                      </select>
                    </div>
                  </Row>
                </div>
              ))}
              {form.testimonials.length < 4 && (
                <button onClick={() => addToArr('testimonials', { quote: '', name: '', role: '', org: '', type: 'owner' })} style={{ background: 'transparent', border: `1px solid #444`, borderRadius: 6, padding: '7px 14px', color: '#F5F5F5', fontSize: '0.75rem', cursor: 'pointer', fontFamily: "'Poppins',sans-serif" }}>+ Add Testimonial</button>
              )}
            </Accordion>

            {/* SECTION 9: Related Projects */}
            <Accordion title="Related Projects">
              {[0, 1, 2].map(i => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <FieldLabel text={`Related ${i + 1}`} />
                  <select
                    value={form.related?.[i] || ''}
                    onChange={e => { const next = [...(form.related || [null, null, null])]; next[i] = e.target.value || null; update('related', next); }}
                    style={{ ...inpStyle(), cursor: 'pointer' }}
                  >
                    <option value="">— None —</option>
                    {allProjects.filter(p => p.slug !== slug).map(p => (
                      <option key={p.slug} value={p.slug}>{p.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </Accordion>

            {/* Save button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: `1px solid ${BORDER}` }}>
              {saveMsg ? (
                <div style={{ fontSize: '0.8rem', color: saveMsg.startsWith('Error') ? DANGER : '#18988B' }}>{saveMsg}</div>
              ) : <div />}
              <button onClick={save} disabled={saving} style={{ background: TEAL, border: 'none', borderRadius: 8, padding: '12px 32px', color: '#111', fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: '0.88rem', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, letterSpacing: '0.04em' }}>
                {saving ? 'Saving…' : 'Save Project'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

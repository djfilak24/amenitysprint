'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import projectsData from '../../../lib/projects-data.json';

const TEAL = '#00BADC';
const BG = '#111111';
const NAV_BG = '#1A1A1A';
const BORDER = '#2A2A2A';

export default function AdminProjects() {
  const router = useRouter();
  const [projects] = useState(Object.values(projectsData.projects).sort((a, b) => a.name.localeCompare(b.name)));
  const [pushStatus, setPushStatus] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('admin_authed') !== 'true') {
      router.replace('/admin');
    }
  }, []);

  async function pushLive() {
    setPushStatus('Deploying…');
    const hookUrl = process.env.NEXT_PUBLIC_DEPLOY_HOOK_URL;
    if (!hookUrl) { setPushStatus('No deploy hook configured.'); return; }
    await fetch(hookUrl, { method: 'POST' });
    setPushStatus('Deploy triggered! ~60 seconds to go live.');
    setTimeout(() => setPushStatus(''), 8000);
  }

  const topBarStyle = { background: NAV_BG, borderBottom: `1px solid ${BORDER}`, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 };

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: "'Poppins',sans-serif" }}>
      {/* Top bar */}
      <div style={topBarStyle}>
        <a href="/" target="_blank" style={{ color: '#F5F5F5', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', fontWeight: 600 }}>
          <span style={{ opacity: 0.5 }}>←</span> NELSON Amenity Sprint
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {pushStatus && <span style={{ fontSize: '0.72rem', color: pushStatus.includes('Deploy triggered') ? '#18988B' : 'rgba(255,255,255,0.5)' }}>{pushStatus}</span>}
          <button onClick={pushLive} style={{ background: TEAL, border: 'none', borderRadius: 6, padding: '7px 16px', color: '#111', fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            ↑ Push Live
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ paddingTop: 56, display: 'flex', minHeight: '100vh' }}>
        {/* Left nav */}
        <div style={{ width: 240, background: NAV_BG, borderRight: `1px solid ${BORDER}`, minHeight: 'calc(100vh - 56px)', padding: '1.5rem 0', flexShrink: 0 }}>
          <div style={{ padding: '0 1rem 1rem', fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Projects</div>
          {projects.map(p => (
            <a key={p.slug} href={`/admin/projects/${p.slug}`} style={{ display: 'block', padding: '10px 1rem', fontSize: '0.78rem', fontWeight: 400, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', borderLeft: '3px solid transparent', transition: 'all 0.15s' }}
              onMouseOver={e => { e.currentTarget.style.background = '#222'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}>
              <div style={{ fontWeight: 600, fontSize: '0.75rem', marginBottom: 2 }}>{p.name}</div>
              <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)' }}>{p.location} · {p.size} Sprint</div>
            </a>
          ))}
          <div style={{ padding: '1rem 1rem 0', borderTop: `1px solid ${BORDER}`, marginTop: '1rem' }}>
            <a href="/admin/projects/new" style={{ display: 'block', textAlign: 'center', background: 'transparent', border: `1px solid ${TEAL}`, borderRadius: 6, padding: '9px', color: TEAL, fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: '0.75rem', textDecoration: 'none' }}>
              + Add New Project
            </a>
          </div>
        </div>

        {/* Main area */}
        <div style={{ flex: 1, padding: '3rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
            <h2 style={{ fontWeight: 700, color: '#F5F5F5', marginBottom: '0.5rem' }}>Select a project</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Choose a project from the left panel to edit its content, or add a new project.
            </p>
            <a href="/admin/projects/new" style={{ display: 'inline-block', background: TEAL, borderRadius: 6, padding: '10px 24px', color: '#111', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none' }}>
              + Add New Project
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useState, useRef } from 'react';

const TEAL = '#00BADC';
const BORDER = '#2A2A2A';

function getPassword() {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem('admin_pass') || '';
}

function getAllImages(projectsData) {
  const urls = new Set();
  if (!projectsData) return [];
  Object.values(projectsData.projects || {}).forEach(p => {
    if (p.cardImage) urls.add(p.cardImage);
    if (p.heroImage) urls.add(p.heroImage);
    (p.gallery || []).forEach(g => { if (g.src) urls.add(g.src); });
    (p.concept?.conceptPhotos || []).forEach(ph => { if (ph.src) urls.add(ph.src); });
  });
  return [...urls].filter(u => u && u.startsWith('http'));
}

export default function ImagePicker({ value, onChange, label = 'Image', projectsData }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const existingImages = getAllImages(projectsData);

  function openPicker() {
    setSelected(value || '');
    setOpen(true);
  }

  function confirm() {
    onChange(selected);
    setOpen(false);
  }

  async function uploadFile(file) {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload-image', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getPassword()}` },
      body: fd,
    });
    setUploading(false);
    if (res.ok) {
      const { url } = await res.json();
      setSelected(url);
    } else {
      alert('Upload failed. Check your connection and password.');
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  const inp = { background: '#1A1A1A', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '8px 10px', color: '#F5F5F5', fontFamily: "'Poppins',sans-serif", fontSize: '0.78rem', width: '100%', boxSizing: 'border-box' };

  return (
    <>
      {/* Trigger button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div onClick={openPicker} style={{ width: 64, height: 48, background: '#1A1A1A', border: `1px solid ${BORDER}`, borderRadius: 6, cursor: 'pointer', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {value ? (
            <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 18, opacity: 0.3 }}>🖼</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder="Image URL"
            style={{ ...inp, fontSize: '0.72rem' }} />
        </div>
        <button onClick={openPicker} style={{ background: 'transparent', border: `1px solid #444`, borderRadius: 6, padding: '7px 12px', color: '#F5F5F5', fontFamily: "'Poppins',sans-serif", fontSize: '0.72rem', cursor: 'pointer', flexShrink: 0 }}>
          Browse
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#1A1A1A', borderRadius: 12, width: '100%', maxWidth: 680, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: `1px solid ${BORDER}` }}>
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#F5F5F5' }}>Select Image</span>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '1.2rem', cursor: 'pointer', padding: 0, lineHeight: 1 }}>✕</button>
            </div>

            {/* Upload zone */}
            <div style={{ padding: '1rem 1.5rem' }}>
              <div onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                style={{ border: `1.5px dashed ${dragOver ? TEAL : '#444'}`, borderRadius: 8, padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: dragOver ? 'rgba(0,186,220,0.06)' : 'transparent', transition: 'all 0.2s' }}>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) uploadFile(e.target.files[0]); }} />
                {uploading ? (
                  <span style={{ color: TEAL, fontSize: '0.82rem' }}>Uploading…</span>
                ) : (
                  <>
                    <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>↑</div>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>
                      Drag &amp; drop images here, or <span style={{ color: TEAL, textDecoration: 'underline' }}>browse</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Library grid */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.5rem 1rem' }}>
              {existingImages.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', textAlign: 'center', padding: '1rem' }}>No images in library yet. Upload one above.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {existingImages.map((url, i) => (
                    <div key={i} onClick={() => setSelected(url)} style={{
                      aspectRatio: '1', background: '#111', borderRadius: 6, overflow: 'hidden', cursor: 'pointer',
                      border: selected === url ? `2px solid ${TEAL}` : '2px solid transparent',
                      transition: 'border-color 0.15s',
                    }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, background: '#111', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '6px 10px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selected || 'No image selected'}
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: '1px solid #444', borderRadius: 6, padding: '8px 16px', color: '#F5F5F5', fontFamily: "'Poppins',sans-serif", fontWeight: 500, fontSize: '0.78rem', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirm} disabled={!selected} style={{ background: TEAL, border: 'none', borderRadius: 6, padding: '8px 20px', color: '#111', fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: '0.78rem', cursor: selected ? 'pointer' : 'not-allowed', opacity: selected ? 1 : 0.5 }}>Select Image</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

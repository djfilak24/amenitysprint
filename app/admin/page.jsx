'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('admin_authed') === 'true') {
      router.replace('/admin/projects');
    }
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/save-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${password}` },
      body: JSON.stringify({ slug: '__auth_check__', projectData: null, isAuthCheck: true }),
    });
    setLoading(false);
    if (res.status === 401) {
      setError('Incorrect password.');
    } else {
      sessionStorage.setItem('admin_authed', 'true');
      sessionStorage.setItem('admin_pass', password);
      router.replace('/admin/projects');
    }
  }

  const inp = { background: '#1A1A1A', border: '1px solid #333', borderRadius: 6, padding: '12px 14px', color: '#F5F5F5', fontFamily: "'Poppins',sans-serif", fontSize: '0.9rem', width: '100%', boxSizing: 'border-box', outline: 'none' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111111' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 1.5rem' }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: '1.2rem', letterSpacing: '0.1em', color: '#F5F5F5' }}>NELSON</span>
          <span style={{ display: 'inline-block', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '8px solid #00BADC', marginLeft: 4, verticalAlign: 'middle', marginBottom: 2 }} />
          <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>Amenity Sprint Admin</div>
        </div>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Admin password" required style={inp}
              onFocus={e => e.target.style.borderColor = '#00BADC'}
              onBlur={e => e.target.style.borderColor = '#333'} />
          </div>
          {error && <div style={{ color: '#FF7F40', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{
            width: '100%', background: '#00BADC', border: 'none', borderRadius: 6,
            padding: '12px', color: '#111', fontFamily: "'Poppins',sans-serif",
            fontWeight: 700, fontSize: '0.88rem', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, letterSpacing: '0.05em'
          }}>
            {loading ? 'Verifying…' : 'Enter Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}

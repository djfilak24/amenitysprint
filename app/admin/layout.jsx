export const metadata = { title: 'Admin — Amenity Sprint' };

export default function AdminLayout({ children }) {
  return (
    <div style={{ margin: 0, background: '#111111', color: '#F5F5F5', fontFamily: "'Poppins', sans-serif", minHeight: '100vh' }}>
      {children}
    </div>
  );
}

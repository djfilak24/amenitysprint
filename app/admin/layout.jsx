export const metadata = { title: 'Admin — Amenity Sprint' };

export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, background: '#111111', color: '#F5F5F5', fontFamily: "'Poppins', sans-serif", minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  );
}

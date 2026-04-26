export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7faf7' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#1a4522' }}>404</h1>
        <p style={{ color: '#6b7280', marginTop: 8 }}>Strona nie istnieje</p>
        <a href="/" style={{ display: 'inline-block', marginTop: 20, color: '#1a4522', fontWeight: 700 }}>
          ← Powrót do aplikacji
        </a>
      </div>
    </div>
  );
}

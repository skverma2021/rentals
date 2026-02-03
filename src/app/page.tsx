import Link from "next/link";

export default function HomePage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <h1 style={{ fontSize: '2.5rem', color: '#333', marginBottom: '16px' }}>
        Asset Rental System
      </h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Manage your rental assets efficiently
      </p>
      <div style={{ display: 'flex', gap: '16px' }}>
        <Link 
          href="/setup"
          style={{
            backgroundColor: '#6c757d',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Setup & Configuration
        </Link>
        <Link 
          href="/assets"
          style={{
            backgroundColor: '#0070f3',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Manage Assets →
        </Link>
      </div>
    </div>
  );
}

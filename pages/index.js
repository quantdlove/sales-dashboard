// /pages/index.js - Fallback page for Next.js Pages Router
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LegacyHome() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the App Router homepage
    router.push('/');
  }, [router]);

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Sales Dashboard</h1>
      <p>Redirecting to the main dashboard...</p>
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Debug Info</h2>
        <pre style={{ textAlign: 'left', background: '#f0f0f0', padding: '1rem', overflowX: 'auto' }}>
          {`URL: ${typeof window !== 'undefined' ? window.location.href : 'Server-side rendering'}\nTimestamp: ${new Date().toISOString()}`}
        </pre>
      </div>
    </div>
  );
}
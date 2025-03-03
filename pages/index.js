// Force redirect to the app/page.jsx route
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the actual dashboard page
    router.replace('/');
  }, [router]);

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#f0f4f8'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#3182ce' }}>
        Sales Dashboard
      </h1>
      <p style={{ color: '#4a5568', marginBottom: '2rem' }}>
        Loading dashboard...
      </p>
      <div style={{ 
        width: '50px', 
        height: '50px', 
        border: '5px solid #e2e8f0',
        borderTopColor: '#3182ce',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
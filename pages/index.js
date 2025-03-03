import React from 'react';
import Head from 'next/head';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Sales Dashboard</title>
        <meta name="description" content="Sales Pipeline Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '1rem'
      }}>
        <div style={{
          maxWidth: '800px',
          width: '100%',
          textAlign: 'center',
          background: 'white',
          borderRadius: '8px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#3182ce'
          }}>
            Sales Pipeline Dashboard
          </h1>
          
          <p style={{ 
            fontSize: '1.2rem', 
            marginBottom: '2rem',
            color: '#4a5568'
          }}>
            An interactive dashboard for sales pipeline analytics with Supabase integration
          </p>
          
          <div style={{
            marginBottom: '2rem', 
            backgroundColor: '#f7fafc', 
            padding: '1.5rem', 
            borderRadius: '6px',
            textAlign: 'left'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#2d3748' }}>
              How to Run the Dashboard
            </h2>
            <ol style={{ 
              marginLeft: '1.5rem', 
              lineHeight: '1.6',
              color: '#4a5568'
            }}>
              <li>Clone the repository</li>
              <li>Install Python dependencies: <code style={{backgroundColor: '#edf2f7', padding: '0.2rem 0.4rem', borderRadius: '4px'}}>pip install -r requirements.txt</code></li>
              <li>Run the dashboard: <code style={{backgroundColor: '#edf2f7', padding: '0.2rem 0.4rem', borderRadius: '4px'}}>streamlit run dashboard.py</code></li>
            </ol>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <a
              href="https://github.com/quantdlove/sales-dashboard/blob/python-dashboard/dashboard.py"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3182ce',
                color: 'white',
                borderRadius: '4px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              View Dashboard Code
            </a>
            <a
              href="https://github.com/quantdlove/sales-dashboard/blob/python-dashboard/README.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#e2e8f0',
                color: '#2d3748',
                borderRadius: '4px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              View Documentation
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
import React from 'react';

// Create a simple landing page that just redirects to the Python dashboard
export default function Home() {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#f0f4f8',
      padding: '2rem'
    }}>
      <div style={{ 
        maxWidth: '600px', 
        backgroundColor: 'white', 
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#3182ce' }}>
          Sales Dashboard
        </h1>
        <p style={{ color: '#4a5568', marginBottom: '2rem' }}>
          The dashboard is now available as a Python app!
        </p>
        
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#4a5568' }}>
            How to Run the Dashboard
          </h2>
          <div style={{ textAlign: 'left', backgroundColor: '#f7fafc', padding: '1rem', borderRadius: '0.25rem' }}>
            <ol style={{ marginLeft: '1.5rem', lineHeight: '1.6' }}>
              <li>Clone the repository</li>
              <li>Install dependencies: <code style={{ background: '#edf2f7', padding: '0.2rem 0.4rem' }}>pip install -r requirements.txt</code></li>
              <li>Run the dashboard: <code style={{ background: '#edf2f7', padding: '0.2rem 0.4rem' }}>streamlit run dashboard.py</code></li>
            </ol>
          </div>
        </div>
        
        <a 
          href="https://github.com/quantdlove/sales-dashboard/blob/python-dashboard/dashboard.py"
          style={{
            display: 'inline-block',
            backgroundColor: '#3182ce',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.25rem',
            textDecoration: 'none',
            fontWeight: 'bold',
            marginTop: '1rem'
          }}
        >
          View on GitHub
        </a>
      </div>
    </div>
  );
}
"use client";

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          Oops! The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-medium mb-2">Debug Information</h3>
          <p className="text-sm text-gray-500 mb-4">
            URL: <span className="font-mono text-black" id="current-url"></span>
          </p>
          <p className="text-sm text-gray-500">
            Timestamp: {new Date().toISOString()}
          </p>
        </div>
        
        <Link 
          href="/"
          className="inline-block bg-blue-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Home Page
        </Link>
      </div>
      
      {/* Script to display the current URL */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.getElementById('current-url').textContent = window.location.href;
          `,
        }}
      />
    </div>
  );
}
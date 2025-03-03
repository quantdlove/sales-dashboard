'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
        <p className="text-gray-600 mb-6">
          {process.env.NODE_ENV === 'development' 
            ? `Error: ${error?.message || 'Unknown error occurred'}`
            : 'An unexpected error occurred. Please try again later.'}
        </p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
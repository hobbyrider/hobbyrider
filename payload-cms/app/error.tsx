'use client'

import React from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Application Error</h1>
      <p style={{ color: '#666', marginBottom: '1rem' }}>
        {error.message || 'An unexpected error occurred'}
      </p>
      {error.digest && (
        <p style={{ fontSize: '0.875rem', color: '#999' }}>
          Error ID: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        style={{
          padding: '0.5rem 1rem',
          marginTop: '1rem',
          cursor: 'pointer',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        Try again
      </button>
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3 style={{ fontSize: '0.875rem', marginTop: 0 }}>Common Issues:</h3>
        <ul style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
          <li>Check that <code>PAYLOAD_SECRET</code> is set in Vercel environment variables</li>
          <li>Verify <code>DATABASE_URL</code> is correct and accessible</li>
          <li>Ensure <code>PAYLOAD_PUBLIC_SERVER_URL</code> matches your domain</li>
          <li>Check Vercel function logs for detailed error messages</li>
        </ul>
      </div>
    </div>
  )
}

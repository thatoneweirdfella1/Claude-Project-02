import React from 'react';

export default function ModelResponse({ response, metadata }: any) {
  if (!response) return null;

  return (
    <div>
      <div style={{ background: '#0f172a', border: '1px solid #2d2d44', borderRadius: '6px', padding: '1rem', marginBottom: '1rem' }}>
        <p style={{ lineHeight: '1.6' }}>{response}</p>
      </div>
      {metadata && (
        <div className="card-grid">
          <div className="card">
            <h3>Input Tokens</h3>
            <p>{metadata.tokens_input}</p>
          </div>
          <div className="card">
            <h3>Output Tokens</h3>
            <p>{metadata.tokens_output}</p>
          </div>
          <div className="card">
            <h3>Latency</h3>
            <p>{metadata.latency_ms}ms</p>
          </div>
        </div>
      )}
    </div>
  );
}

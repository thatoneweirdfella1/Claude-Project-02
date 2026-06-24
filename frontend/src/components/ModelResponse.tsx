import React from 'react';

interface ModelResponseProps {
  response?: string;
  metadata?: any;
}

export default function ModelResponse({ response, metadata }: ModelResponseProps) {
  if (!response) return null;

  return (
    <div>
      {metadata && (
        <div className="card-grid" style={{ marginBottom: '1rem' }}>
          {metadata.model && (
            <div className="card">
              <h3>Model</h3>
              <p>{metadata.model}</p>
            </div>
          )}
          {metadata.tokens_used !== undefined && (
            <div className="card">
              <h3>Tokens Used</h3>
              <p>{metadata.tokens_used}</p>
            </div>
          )}
          {metadata.latency_ms !== undefined && (
            <div className="card">
              <h3>Latency</h3>
              <p>{metadata.latency_ms}ms</p>
            </div>
          )}
        </div>
      )}
      <div className="card" style={{ gridColumn: '1/-1' }}>
        <h3>AI Response</h3>
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{response}</p>
      </div>
    </div>
  );
}

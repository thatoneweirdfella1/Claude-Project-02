import React from 'react';

export default function RoutingExplainer({ output }: any) {
  if (!output) return null;

  return (
    <div className="card-grid">
      <div className="card" style={{ gridColumn: '1/-1' }}>
        <h3>Model Assignment</h3>
        <p style={{ fontSize: '1.2rem', color: '#7c3aed', marginBottom: '0.5rem' }}>
          {output.routed_model}
        </p>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{output.reasoning}</p>
      </div>
      <div className="card">
        <h3>Confidence</h3>
        <p>{Math.round(output.confidence)}%</p>
      </div>
      <div className="card">
        <h3>Consequence Score</h3>
        <p>{output.consequence_score}/5</p>
      </div>
    </div>
  );
}

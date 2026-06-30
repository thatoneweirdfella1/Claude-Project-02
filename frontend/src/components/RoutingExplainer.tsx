import React from 'react';

export default function RoutingExplainer({ output }: any) {
  if (!output) return null;

  return (
    <div className="card-grid">
      <div className="card">
        <h3>Model Selected</h3>
        <p>{output.model_used || output.selected_model || output.model}</p>
      </div>
      <div className="card">
        <h3>Confidence</h3>
        <p>{output.confidence !== undefined ? `${Math.round(output.confidence)}%` : 'N/A'}</p>
      </div>
      {output.reasoning && (
        <div className="card" style={{ gridColumn: '1/-1' }}>
          <h3>Reasoning</h3>
          <p>{output.reasoning}</p>
        </div>
      )}
    </div>
  );
}

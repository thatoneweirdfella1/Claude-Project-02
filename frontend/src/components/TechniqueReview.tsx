import React from 'react';

export default function TechniqueReview({ output }: any) {
  if (!output) return null;

  const techniques: string[] = output.techniques || output.selected_techniques || [];

  return (
    <div className="card-grid">
      {techniques.length > 0 && (
        <div className="card" style={{ gridColumn: '1/-1' }}>
          <h3>Applied Techniques</h3>
          {techniques.map((t: string, i: number) => (
            <p key={i} style={{ marginBottom: '0.5rem' }}>• {t}</p>
          ))}
        </div>
      )}
      {output.reasoning && (
        <div className="card" style={{ gridColumn: '1/-1' }}>
          <h3>Reasoning</h3>
          <p>{output.reasoning}</p>
        </div>
      )}
    </div>
  );
}

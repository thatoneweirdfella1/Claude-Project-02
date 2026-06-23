import React from 'react';

export default function TechniqueReview({ output }: any) {
  if (!output) return null;

  return (
    <div className="card-grid">
      <div className="card" style={{ gridColumn: '1/-1' }}>
        <h3>Selected Techniques</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {output.selected_techniques.map((t: any) => (
            <span
              key={t.id}
              style={{
                padding: '0.5rem 1rem',
                background: '#0f172a',
                border: '1px solid #2d2d44',
                borderRadius: '4px',
                fontSize: '0.9rem',
              }}
            >
              {t.id}: {t.name}
            </span>
          ))}
        </div>
      </div>
      <div className="card">
        <h3>Token Overhead</h3>
        <p>{output.total_token_overhead}</p>
      </div>
    </div>
  );
}

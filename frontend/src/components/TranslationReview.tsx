import React from 'react';

export default function TranslationReview({ output }: any) {
  if (!output) return null;

  return (
    <div className="card-grid">
      <div className="card">
        <h3>Gap Category</h3>
        <p>{output.gap_category}</p>
      </div>
      <div className="card">
        <h3>Confidence</h3>
        <p>{Math.round(output.confidence)}%</p>
      </div>
      <div className="card" style={{ gridColumn: '1/-1' }}>
        <h3>Translated Questions</h3>
        {output.translated_questions.map((q: string, i: number) => (
          <p key={i} style={{ marginBottom: '0.5rem' }}>• {q}</p>
        ))}
      </div>
    </div>
  );
}

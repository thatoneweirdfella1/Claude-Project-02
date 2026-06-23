import React, { useState } from 'react';

interface FeedbackCollectorProps {
  onSubmit: (rating: number, comment: string) => void;
}

export default function FeedbackCollector({ onSubmit }: FeedbackCollectorProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmit(rating || 3, comment);
  };

  return (
    <div className="feedback-box">
      <h3>How was this response?</h3>
      <div className="stars">
        {[1, 2, 3, 4, 5].map(i => (
          <span
            key={i}
            className={`star ${i <= rating ? 'active' : ''}`}
            onClick={() => setRating(i)}
          >
            ★
          </span>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Optional: Tell us what you'd like improved..."
      />
      <div className="feedback-buttons">
        <button onClick={handleSubmit}>Submit Feedback</button>
      </div>
    </div>
  );
}

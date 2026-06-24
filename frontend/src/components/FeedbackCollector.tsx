import React, { useState } from 'react';

interface FeedbackCollectorProps {
  onSubmit: (rating: number, comment: string) => void;
}

export default function FeedbackCollector({ onSubmit }: FeedbackCollectorProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating > 0) onSubmit(rating, comment);
  };

  return (
    <div className="feedback-box">
      <div className="stars">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`star ${star <= rating ? 'active' : ''}`}
            onClick={() => setRating(star)}
          >
            ★
          </span>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Optional: any comments about the response?"
      />
      <div className="feedback-buttons">
        <button onClick={handleSubmit} disabled={rating === 0}>
          Submit Feedback
        </button>
      </div>
    </div>
  );
}

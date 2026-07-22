import { useState } from "react";

/* The 5-star row + download icon (Step 5.1), matching the screenshot. Real,
   focusable, keyboard-operable controls that emit events — the SAVE/learning
   behavior behind a rating is Step 8.1's job ("Feedback rating" owns that),
   and the real download format/modal is Step 8.5/10's ("Download and
   Export"); this step only builds the controls and their events, the same
   "controls now, behavior later" split Step 5.0 used for Attach/Context.
   CANON ADHD Feedback rule: rating is always optional, never required, never
   judgmental — there is no default/pre-selected star. */

export interface RatingRowProps {
  onRate?: (rating: number) => void;
  onDownload?: () => void;
}

const STAR_COUNT = 5;

export function RatingRow({ onRate = () => {}, onDownload = () => {} }: RatingRowProps) {
  const [rating, setRating] = useState<number | null>(null);

  return (
    <div className="rating-row">
      <div className="rating-row__stars" role="radiogroup" aria-label="Rate this answer">
        {Array.from({ length: STAR_COUNT }, (_, i) => i + 1).map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} star${value === 1 ? "" : "s"}`}
            className={`rating-row__star ${rating !== null && value <= rating ? "rating-row__star--filled" : ""}`}
            onClick={() => {
              setRating(value);
              onRate(value);
            }}
          >
            ★
          </button>
        ))}
      </div>
      <button
        type="button"
        className="rating-row__download"
        aria-label="Download this answer"
        onClick={onDownload}
      >
        ⬇
      </button>
    </div>
  );
}

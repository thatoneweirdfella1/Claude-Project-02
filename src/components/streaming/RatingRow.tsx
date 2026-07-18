import { useEffect, useState } from "react";

/* The 5-star row + download icon (Step 5.1), matching the screenshot. Step
   8.1 makes this a CONTROLLED component: `stars`/`comment` reflect the
   message's already-saved rating (accountStore.ratings, via
   ConversationMessage.ratingStars/ratingComment), so a reload still shows
   "you already rated this N stars" with no local memory of its own. The
   optional "What could be better?" comment field is progressively disclosed
   — hidden until a star is picked, matching the screenshot's unrated view
   (stars + download only) and CANON's "no dense info walls" rule. Saves on
   blur, not per keystroke (CANON Feature 7 "Saves immediately" applies to
   the star click; the comment is a slower, optional follow-up). The real
   download format/modal is Step 8.5/10's job ("Download and Export").
   CANON ADHD Feedback rule: rating is always optional, never required, never
   judgmental — there is no default/pre-selected star. */

export interface RatingRowProps {
  /** Controlled — undefined means "not yet rated": no star filled, comment
      field hidden. */
  stars?: number;
  comment?: string;
  onRate?: (rating: number) => void;
  /** Fired on comment textarea blur, only when the text actually changed
      since the last save. */
  onCommentChange?: (comment: string) => void;
  onDownload?: () => void;
}

const STAR_COUNT = 5;

export function RatingRow({
  stars,
  comment = "",
  onRate = () => {},
  onCommentChange = () => {},
  onDownload = () => {},
}: RatingRowProps) {
  const [commentDraft, setCommentDraft] = useState(comment);

  useEffect(() => {
    setCommentDraft(comment);
  }, [comment]);

  return (
    <div className="rating-row">
      <div className="rating-row__top">
        <div className="rating-row__stars" role="radiogroup" aria-label="Rate this answer">
          {Array.from({ length: STAR_COUNT }, (_, i) => i + 1).map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={stars === value}
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              className={`rating-row__star ${stars !== undefined && value <= stars ? "rating-row__star--filled" : ""}`}
              onClick={() => onRate(value)}
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

      {stars !== undefined && (
        <textarea
          className="rating-row__comment"
          placeholder="What could be better? (optional)"
          aria-label="What could be better?"
          value={commentDraft}
          onChange={(e) => setCommentDraft(e.target.value)}
          onBlur={() => {
            if (commentDraft !== comment) onCommentChange(commentDraft);
          }}
        />
      )}
    </div>
  );
}

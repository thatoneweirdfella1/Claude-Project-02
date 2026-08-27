/* The debate transcript shape Consensus and Synthesis read (Step 8.4).

   Debate can contain 2 to 4 participants. The original two-party fields stay
   readable for old persisted/test fixtures, while `participants` is the
   authoritative shape for new multi-way runs. Consensus and Synthesis must
   receive every successful participant exactly once in stable debate order. */

export interface DebateTranscriptParticipant {
  /** Stable display label used in the debate UI. */
  label: string;
  /** Provider/model attribution when the debate runner can prove it. */
  providerId?: string;
  modelId?: string;
  text: string;
}

export interface DebateTranscript {
  /** The exact question/context bundle every side answered. */
  question: string;
  /** Canonical participant list for new runs, in debate order. */
  participants?: DebateTranscriptParticipant[];
  /** Legacy two-party compatibility fields. */
  claudeText: string;
  partnerLabel: string;
  partnerText: string;
}

export function transcriptParticipants(transcript: DebateTranscript): DebateTranscriptParticipant[] {
  if (Array.isArray(transcript.participants) && transcript.participants.length > 0) {
    return transcript.participants.map((participant) => ({ ...participant }));
  }
  return [
    { label: "Claude", providerId: "anthropic", modelId: "claude-opus-4-8", text: transcript.claudeText },
    { label: transcript.partnerLabel, text: transcript.partnerText },
  ];
}

/** One combined input block for the runtime model — question plus every
    successful participant, clearly delimited and in stable order. */
export function buildTranscriptInput(transcript: DebateTranscript): string {
  const participants = transcriptParticipants(transcript);
  return [
    `QUESTION:\n${transcript.question.trim()}`,
    ...participants.map((participant, index) => {
      const attribution = [participant.providerId, participant.modelId].filter(Boolean).join(" · ");
      const heading = `${participant.label.trim().toUpperCase()}${attribution ? ` (${attribution})` : ""}`;
      return `ANSWER ${index + 1} — ${heading}:\n${participant.text.trim()}`;
    }),
  ].join("\n\n");
}

/** True only when the question and at least two participants have real text. */
export function isCompleteTranscript(transcript: DebateTranscript): boolean {
  const participants = transcriptParticipants(transcript);
  return (
    transcript.question.trim().length > 0 &&
    participants.length >= 2 &&
    participants.every((participant) => participant.label.trim().length > 0 && participant.text.trim().length > 0)
  );
}

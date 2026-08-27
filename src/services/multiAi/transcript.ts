/* The debate transcript shape Consensus and Synthesis read.

   Debate can contain 2 to 4 participants. The original two-party fields stay
   readable for old persisted/test fixtures, while `participants` is the
   authoritative shape for new multi-way runs. */

export interface DebateTranscriptParticipant {
  label: string;
  providerId?: string;
  modelId?: string;
  text: string;
}

export interface DebateTranscript {
  question: string;
  participants?: DebateTranscriptParticipant[];
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

/** Preserve the long-standing heading contract while extending it to every
    participant. Attribution is carried on a separate line so old consumers
    and tests still recognize CLAUDE'S ANSWER / <PARTNER>'S ANSWER. */
export function buildTranscriptInput(transcript: DebateTranscript): string {
  const participants = transcriptParticipants(transcript);
  return [
    `QUESTION:\n${transcript.question.trim()}`,
    ...participants.map((participant) => {
      const attribution = [participant.providerId, participant.modelId].filter(Boolean).join(" · ");
      const attributionLine = attribution ? `SOURCE: ${attribution}\n` : "";
      return `${participant.label.trim().toUpperCase()}'S ANSWER:\n${attributionLine}${participant.text.trim()}`;
    }),
  ].join("\n\n");
}

export function isCompleteTranscript(transcript: DebateTranscript): boolean {
  const participants = transcriptParticipants(transcript);
  return transcript.question.trim().length > 0 && participants.length >= 2 && participants.every((participant) => participant.label.trim().length > 0 && participant.text.trim().length > 0);
}

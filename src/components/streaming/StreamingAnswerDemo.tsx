import { useState } from "react";
import { GlassButton, GlassCard } from "../primitives";
import { MessageBubble } from "./MessageBubble";
import { StreamingAnswer } from "./StreamingAnswer";
import { demoAnswerSource } from "./streamingDemo";
import { useAnswerDisplay } from "./useAnswerDisplay";

/* Proof that the streaming display works end to end (Step 5.1 OUTPUT) — no
   live proxy/orchestrator exists yet (Step 5.2), so this drives the exact
   same StreamingAnswer/useAnswerDisplay machinery a real pipeline will use,
   against the offline demoAnswerSource. Same "demo the real logic live"
   pattern as every prior Phase 2-5 step. "Replay" re-runs it via React's own
   key-remount idiom (DemoRun's key changes → full unmount/remount → its
   effect starts a fresh generator) rather than forcing useAnswerDisplay's
   `source` prop to fake a new identity every replay. */

const DEMO_USER_MESSAGE = {
  id: "demo-user-1",
  role: "user" as const,
  content: "Explain quantum entanglement in simple terms.",
  timestamp: Date.now() - 120_000,
};

function DemoRun() {
  const state = useAnswerDisplay(demoAnswerSource);
  return (
    <StreamingAnswer
      state={state}
      onRate={(rating) => console.info("[Step 5.1 demo] rated", rating)}
      onDownload={() => console.info("[Step 5.1 demo] download clicked")}
    />
  );
}

export function StreamingAnswerDemo() {
  const [run, setRun] = useState(0);

  return (
    <GlassCard className="streaming-demo" data-testid="streaming-demo">
      <p className="streaming-demo__label">
        Step 5.1 demo — stage indicator, streaming text, then the finished answer with confidence,
        rating, and download. Real pipeline is Step 5.2.
      </p>
      <MessageBubble message={DEMO_USER_MESSAGE} userInitial="D" />
      <DemoRun key={run} />
      <GlassButton className="streaming-demo__replay" onClick={() => setRun((r) => r + 1)}>
        Replay demo
      </GlassButton>
    </GlassCard>
  );
}

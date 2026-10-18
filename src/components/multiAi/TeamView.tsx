import { useEffect, useRef, useState } from "react";
import { GlassButton } from "../primitives/GlassButton";
import { runBrowserTeam } from "../../services/team/client";
import { mergeTeam } from "../../services/team/merge";
import type { TeamMember, TeamResult } from "../../services/team/runTeam";

function memberStatus(member: TeamMember): string {
  if (member.status === "unreachable") return "unreachable";
  return member.revision === "revised" ? "revised" : "not revised; round one retained";
}

/** Presentational, like ConsensusView/SynthesisView: render resolved data,
 * preserve attribution, keep every disagreement open and equally visible. */
export function TeamView({ result }: { result: TeamResult }) {
  const merged = mergeTeam(result);
  return <div className="team-view consensus-view" data-testid="team-view">
    <p className="consensus-view__text"><strong>{merged.answeringCount} answering members</strong>; {result.members.filter((m) => m.status === "unreachable").length} unreachable.</p>
    <ul aria-label="Team members">{merged.members.map((m) => <li key={m.provider}><strong>{m.label}</strong>: {memberStatus(m)}</li>)}</ul>
    {merged.status === "refused" ? <p role="status">{merged.message}</p> : <>
      <section className="consensus-view__section" data-team-part="agreement">
        <h3 className="consensus-view__title">What they agreed on</h3>
        <p className="consensus-view__text">{merged.comparisonRule}</p>
        {merged.agreements.length === 0 ? <p>No matching passages were verified.</p> : merged.agreements.map((agreement, index) => <article className="consensus-view__section" key={index}>
          <p className="team-view__source">Shared by {agreement.sources.map((s) => s.label).join(", ")}.</p>
          <blockquote className="consensus-view__text team-view__quote">{agreement.text}</blockquote>
        </article>)}
      </section>
      <section className="consensus-view__section" data-team-part="disagreement">
        <h3 className="consensus-view__title">Where they disagreed</h3>
        <p className="consensus-view__text">These passages differ. Meaning was not compared automatically; compare all claims in their own words.</p>
        {merged.disagreements.length === 0 ? <p>No differing passages in the returned answers.</p> : merged.disagreements.map((source) => <article className="consensus-view__section" key={`${source.provider}:${source.passageIndex}`}>
          <p className="team-view__source"><strong>{source.label}</strong> (round {source.round})</p>
          <blockquote className="consensus-view__text team-view__quote">{source.text}</blockquote>
        </article>)}
      </section>
      <section className="consensus-view__section" data-team-part="changed">
        <h3 className="consensus-view__title">What changed</h3>
        {merged.changes.length === 0 ? <p>No text changes beyond whitespace in the returned revisions.</p> : merged.changes.map((change) => <article className="consensus-view__section" key={change.provider}>
          <p className="team-view__source"><strong>{change.label}</strong></p>
          <p className="team-view__source">Round one</p><blockquote className="consensus-view__text team-view__quote">{change.before}</blockquote>
          <p className="team-view__source">Round two</p><blockquote className="consensus-view__text team-view__quote">{change.after}</blockquote>
        </article>)}
        {merged.unrevised.map((m) => <p key={m.provider}>{m.label}: not revised; round one retained.</p>)}
      </section>
    </>}
  </div>;
}

export function TeamPanel({ question, disabled = false }: { question: string; disabled?: boolean }) {
  const [result, setResult] = useState<TeamResult | null>(null);
  const [busy, setBusy] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  useEffect(() => () => { controllerRef.current?.abort(); }, []);

  async function start() {
    if (disabled || controllerRef.current || !question.trim()) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    setResult(null); setBusy(true);
    try {
      const next = await runBrowserTeam(question, { signal: controller.signal });
      if (controllerRef.current === controller && !controller.signal.aborted) setResult(next);
    } catch {
      if (controllerRef.current === controller && !controller.signal.aborted) setResult({
        status: "refused", members: [], message: "The free team could not be reached; try again when at least two free providers are available.",
      });
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        if (!controller.signal.aborted) setBusy(false);
      }
    }
  }
  function cancel() {
    controllerRef.current?.abort(); controllerRef.current = null; setBusy(false);
    setResult({ status: "refused", members: [], message: "Team mode was cancelled." });
  }
  return <section className="team-panel consensus-view" aria-label="Free team mode">
    <h3 className="consensus-view__title">Free team</h3>
    <p className="consensus-view__text">Two or three free providers answer, then read each other and revise once. Uses more of their free daily allowances. No paid provider or Divergence credits.</p>
    <div className="synthesis-view__actions">
      <GlassButton onClick={() => void start()} disabled={disabled || busy || !question.trim()}>{busy ? "Team is answering and revising…" : result ? "Run free team again" : "Start free team"}</GlassButton>
      {busy && <GlassButton onClick={cancel}>Cancel free team</GlassButton>}
    </div>
    {busy && <p role="status">Running the independent answers and final revisions…</p>}
    {result && <TeamView result={result} />}
  </section>;
}

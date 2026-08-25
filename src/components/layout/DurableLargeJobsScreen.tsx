import { useEffect, useMemo, useState } from "react";
import {
  checksum,
  clearDurableJob,
  loadDurableJob,
  saveDurableJob,
  type DurableJobRecord,
} from "../../services/durableLayer4";
import { planSyntheticJob, runNextSyntheticBatch } from "../../services/localWorkspace";

function statusOf(job: DurableJobRecord): DurableJobRecord["status"] {
  if (job.units.every((unit) => unit.status === "complete")) return "complete";
  if (job.paused) return "paused";
  return job.units.some((unit) => unit.status === "complete") ? "running" : "ready";
}

export function DurableLargeJobsScreen() {
  const [source, setSource] = useState("");
  const [batchSize, setBatchSize] = useState(2);
  const [job, setJob] = useState<DurableJobRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState("Saved locally");

  useEffect(() => {
    let active = true;
    loadDurableJob().then((saved) => {
      if (!active) return;
      if (saved) {
        setJob(saved);
        setSource(saved.source);
        setBatchSize(saved.batchSize);
      }
      setLoading(false);
    }).catch(() => {
      if (active) {
        setSaveState("Recovery storage is unavailable");
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!job || loading) return;
    setSaveState("Saving…");
    const timer = window.setTimeout(() => {
      void saveDurableJob(job)
        .then(() => setSaveState("Saved locally — safe to close"))
        .catch(() => setSaveState("Save failed — keep this page open"));
    }, 150);
    return () => window.clearTimeout(timer);
  }, [job, loading]);

  const complete = job?.units.filter((unit) => unit.status === "complete").length ?? 0;
  const evidenceChecksum = useMemo(() => job ? checksum(job) : "", [job]);

  function prepare() {
    const now = Date.now();
    const next: DurableJobRecord = {
      id: `job-${now}`,
      kind: "synthetic-local-job",
      source,
      batchSize,
      units: planSyntheticJob(source, batchSize),
      paused: false,
      createdAt: now,
      updatedAt: now,
      status: "ready",
    };
    setJob(next);
  }

  function runNext() {
    setJob((current) => {
      if (!current || current.paused) return current;
      const next = { ...current, units: runNextSyntheticBatch(current.units), updatedAt: Date.now() };
      return { ...next, status: statusOf(next) };
    });
  }

  function setPaused(paused: boolean) {
    setJob((current) => current
      ? { ...current, paused, updatedAt: Date.now(), status: paused ? "paused" : statusOf({ ...current, paused }) }
      : current);
  }

  async function clear() {
    await clearDurableJob();
    setJob(null);
    setSaveState("Checkpoint cleared");
  }

  function downloadEvidence() {
    if (!job) return;
    const evidence = {
      kind: "divergence-durable-job-evidence",
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      checksum: evidenceChecksum,
      job,
    };
    const blob = new Blob([JSON.stringify(evidence, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `divergence-job-${job.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return <div className="screen screen-large-jobs">
    <div className="screen__header"><h1>Large Jobs</h1><p>Durable local batches resume after reload, crash, or an intentional stop.</p></div>
    <div className="screen__content"><div className="settings-section">
      {loading ? <p role="status">Loading durable checkpoint…</p> : <>
        <label>One local item per line<textarea aria-label="Synthetic job source items" value={source} onChange={(event) => setSource(event.target.value)} disabled={Boolean(job)} /></label>
        <label>Items per batch<input type="number" min="1" max="25" value={batchSize} onChange={(event) => setBatchSize(Number(event.target.value))} disabled={Boolean(job)} /></label>
        {!job && <button type="button" className="primary" onClick={prepare} disabled={!source.trim()}>Prepare durable job</button>}
        {job && <div className="workflow-dialog__summary" role="region" aria-label="Durable job progress">
          <strong>{complete} of {job.units.length} batches complete</strong>
          <progress max={job.units.length} value={complete} />
          <p role="status">{saveState}</p>
          <p>Checkpoint {new Date(job.updatedAt).toLocaleString()} · {evidenceChecksum}</p>
          <p>No provider is connected and no credits can be spent.</p>
          <div className="screen__actions">
            <button type="button" onClick={runNext} disabled={job.paused || complete === job.units.length}>Run next local batch</button>
            {job.paused
              ? <button type="button" onClick={() => setPaused(false)}>Resume</button>
              : <button type="button" onClick={() => setPaused(true)} disabled={complete === job.units.length}>Stop safely</button>}
            <button type="button" onClick={downloadEvidence}>Download evidence</button>
            <button type="button" onClick={() => void clear()}>Clear checkpoint</button>
          </div>
          {job.units.map((unit) => <div className="settings-item" key={unit.id}><strong>{unit.id}</strong><span>{unit.status}</span>{unit.result && <p>{unit.result}</p>}</div>)}
        </div>}
      </>}
    </div></div>
  </div>;
}

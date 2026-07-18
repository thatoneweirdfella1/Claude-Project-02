import { useEffect, useRef, useState } from "react";
import { GlassCard } from "../primitives";
import { useDismissableLayer } from "../../keyboard";
import type { StateDetectionResult } from "../../services/detection";
import { PILL_CONFIGS, type PillDimension } from "./pillOptions";
import { StatePill } from "./StatePill";
import { PillCorrector } from "./PillCorrector";

/* STATE DETECTION panel (Step 6.3) — matches the screenshot exactly: header
   ("STATE DETECTION" + info glyph, panel-level dismiss ×), the pills row,
   the explanatory summary line, and an "Adjust" control. Sits in Composer.tsx
   between <InputBox/> and <ControlRow/>, per the Step 5.0 PARKED note that
   named this exact position.

   PIPELINE.md / CANON Feature 5: "Pills are dismissible (X) and correctable
   (click to open a correction control)" — EACH pill gets its own dismiss ×
   and its own correction control (StatePill + PillCorrector), in addition to
   the screenshot's single panel-level × (which hides the whole panel for this
   turn). "Adjust" (also named explicitly in this step's screenshot-match
   instruction) opens every visible pill's corrector at once — a bulk-edit
   affordance distinct from clicking one pill for a single correction (a
   documented interpretation; CANON/PIPELINE.md don't spell out what Adjust
   does beyond it existing). */

export interface StateDetectionPanelProps {
  result: StateDetectionResult;
  /** Fires when the user picks a corrected value for a dimension. Step 6.3's
      job stops at making the correction visible immediately; RECORDING it for
      the 15+ threshold learning loop is Step 6.4's. */
  onCorrect?: (dimension: PillDimension, value: string) => void;
}

export function StateDetectionPanel({ result, onCorrect }: StateDetectionPanelProps) {
  const [panelDismissed, setPanelDismissed] = useState(false);
  const [dismissedPills, setDismissedPills] = useState<ReadonlySet<PillDimension>>(new Set());
  const [openCorrectors, setOpenCorrectors] = useState<ReadonlySet<PillDimension>>(new Set());
  const rootRef = useRef<HTMLDivElement>(null);

  // A fresh detection result (new turn) starts fresh — nothing dismissed or
  // open carries over from the prior message's pills.
  useEffect(() => {
    setPanelDismissed(false);
    setDismissedPills(new Set());
    setOpenCorrectors(new Set());
  }, [result]);

  useDismissableLayer(openCorrectors.size > 0, () => setOpenCorrectors(new Set()));

  useEffect(() => {
    if (openCorrectors.size === 0) return;
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpenCorrectors(new Set());
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [openCorrectors]);

  const visiblePills = PILL_CONFIGS.filter(
    (config) => result[config.dimension] !== null && !dismissedPills.has(config.dimension),
  );

  if (panelDismissed || visiblePills.length === 0) return null;

  function toggleCorrector(dimension: PillDimension) {
    setOpenCorrectors((prev) => {
      const next = new Set(prev);
      if (next.has(dimension)) next.delete(dimension);
      else next.add(dimension);
      return next;
    });
  }

  function handleAdjust() {
    setOpenCorrectors((prev) =>
      prev.size >= visiblePills.length ? new Set() : new Set(visiblePills.map((c) => c.dimension)),
    );
  }

  function handleSelect(dimension: PillDimension, value: string) {
    onCorrect?.(dimension, value);
    setOpenCorrectors((prev) => {
      const next = new Set(prev);
      next.delete(dimension);
      return next;
    });
  }

  function dismissPill(dimension: PillDimension) {
    setDismissedPills((prev) => new Set(prev).add(dimension));
  }

  return (
    <div ref={rootRef}>
      <GlassCard className="state-detection-panel" data-testid="state-detection-panel">
        <div className="state-detection-panel__header">
          <span className="state-detection-panel__title">
            <span aria-hidden="true">ⓘ</span> STATE DETECTION
          </span>
          <button
            type="button"
            className="state-detection-panel__dismiss"
            aria-label="Dismiss state detection panel"
            onClick={() => setPanelDismissed(true)}
          >
            ×
          </button>
        </div>

        <div className="state-detection-panel__pills">
          {visiblePills.map((config) => {
            const reading = result[config.dimension]!;
            return (
              <div key={config.dimension} className="state-detection-panel__pill-slot">
                <StatePill
                  config={config}
                  value={reading.value}
                  correctionOpen={openCorrectors.has(config.dimension)}
                  onOpenCorrection={() => toggleCorrector(config.dimension)}
                  onDismiss={() => dismissPill(config.dimension)}
                />
                {openCorrectors.has(config.dimension) && (
                  <PillCorrector
                    config={config}
                    currentValue={reading.value}
                    onSelect={(value) => handleSelect(config.dimension, value)}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="state-detection-panel__footer">
          <p className="state-detection-panel__summary">{result.summary}</p>
          <button type="button" className="state-detection-panel__adjust" onClick={handleAdjust}>
            Adjust
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

/* Pipeline orchestrator — public surface (Step 5.2). The exact handoff shapes
   are documented in PIPELINE-CONTRACT.md (repo root); the code here is the
   authoritative source if the two ever drift. */

export {
  runPipeline,
  resolveTechniqueSelection,
  type PipelineModelClient,
  type PipelineDeps,
  type PipelineDone,
  type PipelineEvent,
} from "./orchestrator";

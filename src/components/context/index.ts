/* Context feature UI (Step 7.5: the Context Snapshot panel; Step 9.5
   restructures it into content-only, wrapped by AccordionStack). */
export { ContextSnapshotContent } from "./ContextSnapshotContent";
export {
  buildSnapshotItems,
  variableNameFromSnapshotId,
  SNAPSHOT_KIND_LABELS,
  type SnapshotItem,
} from "./contextSnapshotItems";

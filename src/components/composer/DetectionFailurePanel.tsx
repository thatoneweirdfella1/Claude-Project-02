export interface DetectionFailurePanelProps {
  message: string;
  onContinue: () => void;
  onRetry: () => void;
  onCancel: () => void;
}

export function DetectionFailurePanel({ message, onContinue, onRetry, onCancel }: DetectionFailurePanelProps) {
  return <div className="workflow-dialog" role="dialog" aria-modal="true" aria-labelledby="detection-failure-title">
    <div className="workflow-dialog__card surface-smoked-glass detection-failure-dialog">
      <header><h2 id="detection-failure-title">State Detection could not run</h2></header>
      <p>Continue with current settings?</p>
      <p className="workflow-dialog__summary">{message}</p>
      <footer className="workflow-dialog__actions">
        <button type="button" onClick={onCancel}>Cancel send</button>
        <button type="button" onClick={onRetry}>Retry</button>
        <button type="button" className="primary" onClick={onContinue}>Continue</button>
      </footer>
    </div>
  </div>;
}

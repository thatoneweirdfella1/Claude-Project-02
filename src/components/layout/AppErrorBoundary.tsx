import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw, X } from "lucide-react";
import { useSessionStore } from "../../stores/sessionStore";
import { saveNow } from "../../services/persistence";
import { desktopBridge } from "../../services/desktopBridge";

interface Props {
  children: ReactNode;
  resetKey: string;
}

interface State {
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[renderer] recovered from a screen error", error, info.componentStack);
  }

  componentDidUpdate(previous: Props): void {
    if (this.state.error && previous.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  private recover = (): void => {
    useSessionStore.getState().setCurrentScreen("translate");
    this.setState({ error: null });
    void saveNow();
  };

  render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <section className="app-recovery surface-smoked-glass" role="alert">
        <AlertTriangle size={34} aria-hidden="true" />
        <h1>This screen could not open</h1>
        <p>The rest of Divergence.AI is still safe. Return to Translate and continue testing.</p>
        <details>
          <summary>Technical detail</summary>
          <code>{this.state.error.message}</code>
        </details>
        <div className="app-recovery__actions">
          <button type="button" onClick={this.recover}><RotateCcw size={16} /> Return to Translate</button>
          {desktopBridge() && <button type="button" className="secondary" onClick={() => void desktopBridge()?.app.close()}><X size={16} /> Exit</button>}
        </div>
      </section>
    );
  }
}

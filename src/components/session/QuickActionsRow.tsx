import { Copy, FolderOpen, PlusCircle, RefreshCw, Save } from "lucide-react";
import { GlassButton } from "../primitives";
import { buildSessionRecord } from "../../services/sessionLifecycle";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";

export function QuickActionsRow() {
  const newSession = useSessionStore((s) => s.newSession);
  const setCurrentScreen = useSessionStore((s) => s.setCurrentScreen);
  const addSessionRecord = useAccountStore((s) => s.addSessionRecord);

  function saveCurrent() {
    addSessionRecord(buildSessionRecord(useSessionStore.getState(), { archived: false }));
  }

  function beginNew() {
    saveCurrent();
    newSession();
  }

  function duplicateCurrent() {
    addSessionRecord(buildSessionRecord(useSessionStore.getState(), { archived: false }));
  }

  return (
    <section className="quick-actions">
      <p className="quick-actions__header">Quick Actions</p>
      <div className="quick-actions-row" data-testid="quick-actions-row">
        <GlassButton onClick={beginNew}><PlusCircle size={20} /> New Session</GlassButton>
        <GlassButton onClick={() => setCurrentScreen("sessions")}><FolderOpen size={20} /> Load Session</GlassButton>
        <GlassButton onClick={saveCurrent}><Save size={20} /> Save Session</GlassButton>
        <GlassButton onClick={duplicateCurrent}><Copy size={20} /> Duplicate Session</GlassButton>
        <GlassButton onClick={beginNew}><RefreshCw size={20} /> Clear All</GlassButton>
      </div>
    </section>
  );
}

import { Minus, Square, X } from "lucide-react";
import { desktopBridge } from "../../services/desktopBridge";

export function WindowControls({ floating = false }: { floating?: boolean }) {
  const desktop = desktopBridge();
  if (!desktop) return null;
  return (
    <div className={`window-controls ${floating ? "window-controls--floating" : ""}`} aria-label="Window controls">
      <button type="button" aria-label="Minimize window" onClick={() => void desktop.app.minimize()}><Minus size={15} /></button>
      <button type="button" className="window-controls__locked" aria-label="Window size is locked" title="Window size is locked" disabled><Square size={13} /></button>
      <button type="button" className="window-controls__close" aria-label="Close window" onClick={() => void desktop.app.close()}><X size={16} /></button>
    </div>
  );
}

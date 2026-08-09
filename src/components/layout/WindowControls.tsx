import { Maximize2, Minus, X } from "lucide-react";
import { desktopBridge } from "../../services/desktopBridge";

export function WindowControls() {
  const desktop = desktopBridge();
  if (!desktop) return null;
  return (
    <div className="window-controls" aria-label="Window controls">
      <button type="button" aria-label="Minimize window" onClick={() => void desktop.app.minimize()}><Minus size={15} /></button>
      <button type="button" aria-label="Maximize or restore window" onClick={() => void desktop.app.toggleMaximize()}><Maximize2 size={14} /></button>
      <button type="button" className="window-controls__close" aria-label="Close window" onClick={() => void desktop.app.close()}><X size={16} /></button>
    </div>
  );
}

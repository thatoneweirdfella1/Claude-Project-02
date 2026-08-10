import { useEffect } from "react";
import { desktopBridge, type DesktopBackgroundResult } from "./desktopBridge";

const BACKGROUND_EVENT = "divergence:background-changed";

function applyBackground(result: Pick<DesktopBackgroundResult, "dataUrl">): void {
  const root = document.documentElement;
  if (result.dataUrl) {
    root.style.setProperty("--custom-background-image", `url("${result.dataUrl}")`);
    root.dataset.customBackground = "true";
  } else {
    root.style.removeProperty("--custom-background-image");
    delete root.dataset.customBackground;
  }
}

export function announceBackground(result: DesktopBackgroundResult): void {
  applyBackground(result);
  window.dispatchEvent(new CustomEvent<DesktopBackgroundResult>(BACKGROUND_EVENT, { detail: result }));
}

export function CustomBackgroundController(): null {
  useEffect(() => {
    const desktop = desktopBridge();
    if (!desktop) return;
    let active = true;
    void desktop.appearance.getBackground().then((result) => {
      if (active) applyBackground(result);
    });
    const onChanged = (event: Event) => applyBackground((event as CustomEvent<DesktopBackgroundResult>).detail);
    window.addEventListener(BACKGROUND_EVENT, onChanged);
    return () => {
      active = false;
      window.removeEventListener(BACKGROUND_EVENT, onChanged);
    };
  }, []);
  return null;
}

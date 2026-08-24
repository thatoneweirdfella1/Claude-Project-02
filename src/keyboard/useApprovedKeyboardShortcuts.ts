import { useEffect } from "react";
import { isTextEntryTarget, matchApprovedShortcut } from "../services/approvedKeyboardPolicy";

export function useApprovedKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcut = matchApprovedShortcut(event.key, event.ctrlKey || event.metaKey, event.shiftKey, event.altKey);
      if (!shortcut || (shortcut.id === "action-help" && isTextEntryTarget(event.target))) return;
      event.preventDefault();
      window.dispatchEvent(new CustomEvent(shortcut.id === "nav-search" ? "divergence:open-search" : "divergence:open-reference"));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}

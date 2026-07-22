import { useEffect } from "react";
import { matchesShortcut } from "../services/keyboardShortcuts";
import { useSessionStore } from "../stores/sessionStore";

export function useKeyboardShortcuts(onShowHelp: () => void) {
  const setCurrentScreen = useSessionStore((s) => s.setCurrentScreen);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const { key, ctrlKey, shiftKey, altKey } = event;

      const shortcut = matchesShortcut(key, ctrlKey, shiftKey, altKey);

      if (!shortcut) return;

      event.preventDefault();

      switch (shortcut.id) {
        case "nav-translate":
          setCurrentScreen("translate");
          break;
        case "nav-home":
          setCurrentScreen("home");
          break;
        case "nav-dashboard":
          setCurrentScreen("dashboard");
          break;
        case "nav-sessions":
          setCurrentScreen("sessions");
          break;
        case "nav-templates":
          setCurrentScreen("templates");
          break;
        case "nav-messages":
          setCurrentScreen("messages");
          break;
        case "nav-saved-prompts":
          setCurrentScreen("saved-prompts");
          break;
        case "nav-search":
          // Trigger search - would need to hook into TopBar's search
          break;
        case "action-help":
          onShowHelp();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setCurrentScreen, onShowHelp]);
}

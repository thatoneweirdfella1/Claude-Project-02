import { useState } from "react";
import { ImagePlus, RotateCcw } from "lucide-react";
import { useAccountStore } from "../../stores/accountStore";
import type { ThemePreference } from "../../stores/types";
import { announceBackground } from "../../services/customBackground";
import { desktopBridge } from "../../services/desktopBridge";

const THEMES: Array<{ value: ThemePreference; label: string }> = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "auto", label: "System" },
];

export function AppearanceSettings() {
  const theme = useAccountStore((state) => state.theme);
  const setTheme = useAccountStore((state) => state.setTheme);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const desktop = desktopBridge();

  async function chooseBackground() {
    if (!desktop) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await desktop.appearance.chooseBackground();
      announceBackground(result);
      if (!result.canceled) setMessage(`${result.name ?? "Custom background"} is now behind the locked interface.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The background could not be changed.");
    } finally {
      setBusy(false);
    }
  }

  async function restoreBackground() {
    if (!desktop) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await desktop.appearance.clearBackground();
      announceBackground(result);
      setMessage("The Divergence marble background has been restored.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The background could not be restored.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="settings-section appearance-settings">
      <h3>Appearance</h3>
      <div className="settings-item">
        <div className="settings-item__label">Theme</div>
        <div className="appearance-settings__themes" role="group" aria-label="Theme">
          {THEMES.map((option) => (
            <button
              key={option.value}
              type="button"
              className={theme === option.value ? "is-active" : ""}
              onClick={() => setTheme(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <p className="settings-section__note">
        Your image changes only the background. The frozen sidebar, workspace, panels, spacing, and glass surfaces stay in place.
      </p>
      {desktop && (
        <div className="appearance-settings__actions">
          <button type="button" disabled={busy} onClick={() => void chooseBackground()}>
            <ImagePlus size={16} /> Choose Background Image
          </button>
          <button type="button" className="secondary" disabled={busy} onClick={() => void restoreBackground()}>
            <RotateCcw size={16} /> Restore Default
          </button>
        </div>
      )}
      {message && <p className="appearance-settings__message" role="status">{message}</p>}
    </div>
  );
}

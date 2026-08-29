import { DurableAccountPanel } from "../components/settings/DurableAccountPanel";
import { GlassPanel } from "../components/primitives";

export function SettingsScreen() {
  return (
    <GlassPanel>
      <h1>Settings</h1>
      <p>Configure your account and application settings.</p>
      <DurableAccountPanel />
    </GlassPanel>
  );
}

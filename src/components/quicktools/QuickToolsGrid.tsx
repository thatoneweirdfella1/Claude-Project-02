import {
  BarChart3,
  BookOpenText,
  Bookmark,
  Braces,
  CirclePlus,
  Network,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import { useSessionStore } from "../../stores/sessionStore";
import type { ScreenId } from "../../stores/types";

const TOOLS: Array<{ label: string; screen: ScreenId; Icon: LucideIcon; accent: string }> = [
  { label: "Router", screen: "translate", Icon: Network, accent: "cyan" },
  { label: "Techniques", screen: "resources", Icon: WandSparkles, accent: "gold" },
  { label: "Prompt Library", screen: "saved-prompts", Icon: BookOpenText, accent: "gold" },
  { label: "Variables", screen: "customize", Icon: Braces, accent: "gold" },
  { label: "Checkpoints", screen: "checkpoints", Icon: Bookmark, accent: "gold" },
  { label: "Dashboard", screen: "dashboard", Icon: BarChart3, accent: "gold" },
];

export function QuickToolsGrid() {
  const setCurrentScreen = useSessionStore((s) => s.setCurrentScreen);
  function openTool(label: string, screen: ScreenId) {
    setCurrentScreen(screen);
    if (label === "Router") window.setTimeout(() => window.dispatchEvent(new CustomEvent("divergence:composer-overlay", { detail: "advanced" })), 0);
  }
  return (
    <section className="quick-tools">
      <div className="quick-tools__header">
        <CirclePlus size={18} aria-hidden="true" />
        <p className="quick-tools__header-label">Quick Tools</p>
      </div>
      <div className="quick-tools-grid" data-testid="quick-tools-grid">
        {TOOLS.map(({ label, screen, Icon, accent }) => (
          <button type="button" className="quick-tools-tile__button" key={label} onClick={() => openTool(label, screen)}>
            <Icon className={`quick-tools-tile__icon is-${accent}`} size={31} strokeWidth={1.55} aria-hidden="true" />
            <span className="quick-tools-tile__label">{label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

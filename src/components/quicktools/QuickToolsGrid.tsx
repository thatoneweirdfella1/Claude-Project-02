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
import type { ScreenId, ScreenSectionId } from "../../stores/types";
import { QUICK_TOOL_NAVIGATION } from "../layout/navigation";

const ICONS: Record<string, LucideIcon> = { router: Network, techniques: WandSparkles, "prompt-library": BookOpenText, variables: Braces, checkpoints: Bookmark, insights: BarChart3 };

export function QuickToolsGrid() {
  const setScreenLocation = useSessionStore((s) => s.setScreenLocation);
  function openTool(id: string, screen: ScreenId, section?: ScreenSectionId) {
    setScreenLocation(screen, section);
    if (id === "router") window.setTimeout(() => window.dispatchEvent(new CustomEvent("divergence:composer-overlay", { detail: "advanced" })), 0);
  }
  return (
    <section className="quick-tools">
      <div className="quick-tools__header">
        <CirclePlus size={18} aria-hidden="true" />
        <p className="quick-tools__header-label">Quick Tools</p>
      </div>
      <div className="quick-tools-grid" data-testid="quick-tools-grid">
        {QUICK_TOOL_NAVIGATION.map(({ id, label, screen, section }) => {
          const Icon = ICONS[id];
          const accent = id === "router" ? "cyan" : "gold";
          return <button type="button" className="quick-tools-tile__button" key={id} data-screen={screen} data-section={section} onClick={() => openTool(id, screen, section)}>
            <Icon className={`quick-tools-tile__icon is-${accent}`} size={31} strokeWidth={1.55} aria-hidden="true" />
            <span className="quick-tools-tile__label">{label}</span>
          </button>;
        })}
      </div>
    </section>
  );
}

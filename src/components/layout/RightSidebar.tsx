import { Plus, Star, Wand2 } from "lucide-react";
import { GlassButton, GlassPanel } from "../primitives";

/* Right sidebar, 300px: state detection pills, quick actions, quick tools grid, accordion stack. */

export function RightSidebar() {
  return (
    <div className="rightsidebar-content">
      {/* State Detection Panels */}
      <div className="state-detection-section">
        <div className="state-pill">
          <span className="state-label">Emotion</span>
          <span className="state-value">● Calm</span>
        </div>
        <div className="state-pill">
          <span className="state-label">RSD Level</span>
          <span className="state-value">Medium ▓▓░</span>
        </div>
        <div className="state-pill">
          <span className="state-label">Interest</span>
          <span className="state-value">High ▓▓▓</span>
        </div>
        <div className="state-pill">
          <span className="state-label">Cognitive Mode</span>
          <span className="state-value">● Analytical</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <div className="quick-actions__header">QUICK ACTIONS</div>
        <div className="quick-actions-row">
          <GlassButton className="quick-action-button">
            <Plus size={16} />
            New
          </GlassButton>
          <GlassButton className="quick-action-button">
            <Star size={16} />
            Save
          </GlassButton>
          <GlassButton className="quick-action-button">
            <Wand2 size={16} />
            Template
          </GlassButton>
        </div>
      </div>

      {/* Quick Tools Grid */}
      <div className="quick-tools-section">
        <div className="quick-tools__header">QUICK TOOLS</div>
        <div className="quick-tools-grid">
          <QuickToolsTile title="Router" icon="🔀" />
          <QuickToolsTile title="Techniques" icon="⚙" />
          <QuickToolsTile title="Prompt Library" icon="📚" />
          <QuickToolsTile title="Variables" icon="x" />
          <QuickToolsTile title="Checkpoints" icon="✓" />
          <QuickToolsTile title="Dashboard" icon="📊" />
        </div>
      </div>

      {/* Accordion Stack */}
      <div className="accordion-section">
        <GlassPanel className="accordion-panel">
          <div className="accordion-header">
            <span>Recent Sessions</span>
            <span className="accordion-chevron">›</span>
          </div>
        </GlassPanel>
        <GlassPanel className="accordion-panel">
          <div className="accordion-header">
            <span>Context Snapshot</span>
            <span className="accordion-chevron">›</span>
          </div>
        </GlassPanel>
        <GlassPanel className="accordion-panel">
          <div className="accordion-header">
            <span>Token Usage</span>
            <span className="accordion-chevron">›</span>
          </div>
        </GlassPanel>
        <GlassPanel className="accordion-panel">
          <div className="accordion-header">
            <span>Model Status</span>
            <span className="accordion-chevron">›</span>
          </div>
        </GlassPanel>
        <GlassPanel className="accordion-panel">
          <div className="accordion-header">
            <span>Active Session</span>
            <span className="accordion-chevron">›</span>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

interface QuickToolsTileProps {
  title: string;
  icon: string;
}

function QuickToolsTile({ title, icon }: QuickToolsTileProps) {
  return (
    <GlassPanel className="quick-tools-tile">
      <div className="quick-tools-tile-icon">{icon}</div>
      <div className="quick-tools-tile__title">{title}</div>
      <div className="quick-tools-tile-status">Coming soon</div>
    </GlassPanel>
  );
}

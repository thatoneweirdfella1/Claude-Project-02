import { Plus, Star, Wand2, Wifi, Sparkles, BookOpen, Code2, CheckCircle, BarChart3 } from "lucide-react";
import { GlassButton, GlassPanel } from "../primitives";

/* Right sidebar, 300px: state detection pills, quick actions, quick tools grid, accordion stack. */

export function RightSidebar() {
  return (
    <div className="rightsidebar-content">
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
          <QuickToolsTile title="Router" Icon={Wifi} colorClass="tile-green" />
          <QuickToolsTile title="Techniques" Icon={Sparkles} colorClass="tile-purple" />
          <QuickToolsTile title="Prompt Library" Icon={BookOpen} colorClass="tile-orange" />
          <QuickToolsTile title="Variables" Icon={Code2} colorClass="tile-cyan" />
          <QuickToolsTile title="Checkpoints" Icon={CheckCircle} colorClass="tile-red" />
          <QuickToolsTile title="Dashboard" Icon={BarChart3} colorClass="tile-blue" />
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
  Icon: React.ComponentType<{ size: number; className?: string }>;
  colorClass: string;
}

function QuickToolsTile({ title, Icon, colorClass }: QuickToolsTileProps) {
  return (
    <GlassPanel className="quick-tools-tile">
      <div className={`quick-tools-tile-icon ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div className="quick-tools-tile__title">{title}</div>
      <div className="quick-tools-tile-status">Coming soon</div>
    </GlassPanel>
  );
}

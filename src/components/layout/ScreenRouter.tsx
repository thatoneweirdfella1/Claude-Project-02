import { useSessionStore } from "../../stores/sessionStore";
import { CenterColumn } from "../pipeline";

function HomeScreen() {
  return (
    <div className="screen screen-home">
      <div className="screen__header">
        <h1>Home</h1>
      </div>
      <div className="screen__content">
        <p>Welcome to Divergence.AI. Start a new translation in the Translate screen.</p>
      </div>
    </div>
  );
}

function DashboardScreen() {
  return (
    <div className="screen screen-dashboard">
      <div className="screen__header">
        <h1>Dashboard</h1>
      </div>
      <div className="screen__content">
        <p>Session statistics and analytics — coming soon.</p>
      </div>
    </div>
  );
}

function MessagesScreen() {
  return (
    <div className="screen screen-messages">
      <div className="screen__header">
        <h1>Messages</h1>
      </div>
      <div className="screen__content">
        <p>Conversation history and archived messages — coming soon.</p>
      </div>
    </div>
  );
}

function ArchiveScreen() {
  return (
    <div className="screen screen-archive">
      <div className="screen__header">
        <h1>Archive</h1>
      </div>
      <div className="screen__content">
        <p>Archived sessions and conversations — coming soon.</p>
      </div>
    </div>
  );
}

function ResourcesScreen() {
  return (
    <div className="screen screen-resources">
      <div className="screen__header">
        <h1>Resources</h1>
      </div>
      <div className="screen__content">
        <p>Knowledge base and resources — coming soon.</p>
      </div>
    </div>
  );
}

function ProjectsScreen() {
  return (
    <div className="screen screen-projects">
      <div className="screen__header">
        <h1>Projects</h1>
      </div>
      <div className="screen__content">
        <p>Organize conversations by project — coming soon.</p>
      </div>
    </div>
  );
}

function IntegrationsScreen() {
  return (
    <div className="screen screen-integrations">
      <div className="screen__header">
        <h1>Integrations</h1>
      </div>
      <div className="screen__content">
        <p>External integrations — decorative placeholder, not planned for this build.</p>
      </div>
    </div>
  );
}

function TasksScreen() {
  return (
    <div className="screen screen-tasks">
      <div className="screen__header">
        <h1>Tasks</h1>
      </div>
      <div className="screen__content">
        <p>Action items extracted from conversations — coming soon.</p>
      </div>
    </div>
  );
}

function CustomizeScreen() {
  return (
    <div className="screen screen-customize">
      <div className="screen__header">
        <h1>Customize</h1>
      </div>
      <div className="screen__content">
        <p>Customize is a future feature planned for panel/widget layout configuration.</p>
        <p>For now, use the Settings gear menu (top right) to control theme, layout, and sidebar visibility.</p>
      </div>
    </div>
  );
}

function TrashScreen() {
  return (
    <div className="screen screen-trash">
      <div className="screen__header">
        <h1>Trash</h1>
      </div>
      <div className="screen__content">
        <p>Deleted sessions and items — coming soon.</p>
      </div>
    </div>
  );
}

export function ScreenRouter() {
  const currentScreen = useSessionStore((s) => s.currentScreen);

  switch (currentScreen) {
    case "translate":
      return <CenterColumn />;
    case "home":
      return <HomeScreen />;
    case "dashboard":
      return <DashboardScreen />;
    case "messages":
      return <MessagesScreen />;
    case "archive":
      return <ArchiveScreen />;
    case "resources":
      return <ResourcesScreen />;
    case "projects":
      return <ProjectsScreen />;
    case "integrations":
      return <IntegrationsScreen />;
    case "tasks":
      return <TasksScreen />;
    case "customize":
      return <CustomizeScreen />;
    case "trash":
      return <TrashScreen />;
    default:
      const _exhaustive: never = currentScreen;
      return _exhaustive;
  }
}

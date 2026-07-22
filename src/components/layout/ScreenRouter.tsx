import { useSessionStore } from "../../stores/sessionStore";
import { useAccountStore } from "../../stores/accountStore";
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
  const sessions = useAccountStore((s) => s.sessions);
  const trashed = useAccountStore((s) => s.trashed);
  const templates = useAccountStore((s) => s.templates);
  const ratings = useAccountStore((s) => s.ratings);
  const archivedPairs = useAccountStore((s) => s.archivedPairs);

  const totalSessions = sessions.length;
  const totalArchivedSessions = sessions.filter((s) => s.archived).length;
  const totalTrashed = trashed.length;
  const customTemplates = templates.filter((t) => !t.id.startsWith("template-")).length;
  const totalRatings = ratings.length;
  const totalArchivedPairs = archivedPairs.length;

  return (
    <div className="screen screen-dashboard">
      <div className="screen__header">
        <h1>Dashboard</h1>
      </div>
      <div className="screen__content">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3 className="dashboard-card__title">Sessions</h3>
            <div className="dashboard-card__metric">{totalSessions}</div>
            <p className="dashboard-card__label">saved sessions</p>
            {totalArchivedSessions > 0 && (
              <p className="dashboard-card__subtext">
                {totalArchivedSessions} archived
              </p>
            )}
          </div>
          <div className="dashboard-card">
            <h3 className="dashboard-card__title">Trash</h3>
            <div className="dashboard-card__metric">{totalTrashed}</div>
            <p className="dashboard-card__label">deleted items</p>
          </div>
          <div className="dashboard-card">
            <h3 className="dashboard-card__title">Templates</h3>
            <div className="dashboard-card__metric">{templates.length}</div>
            <p className="dashboard-card__label">templates available</p>
            {customTemplates > 0 && (
              <p className="dashboard-card__subtext">
                {customTemplates} custom
              </p>
            )}
          </div>
          <div className="dashboard-card">
            <h3 className="dashboard-card__title">Feedback</h3>
            <div className="dashboard-card__metric">{totalRatings}</div>
            <p className="dashboard-card__label">ratings given</p>
          </div>
          <div className="dashboard-card">
            <h3 className="dashboard-card__title">Q/A Pairs</h3>
            <div className="dashboard-card__metric">{totalArchivedPairs}</div>
            <p className="dashboard-card__label">archived pairs</p>
          </div>
        </div>
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

function SessionsScreen() {
  const sessions = useAccountStore((s) => s.sessions);
  const loadSessionRecord = useSessionStore((s) => s.loadSessionRecord);
  const setCurrentScreen = useSessionStore((s) => s.setCurrentScreen);
  const moveSessionToTrash = useAccountStore((s) => s.moveSessionToTrash);

  const handleLoadSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      loadSessionRecord(session);
      setCurrentScreen("translate");
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    moveSessionToTrash(sessionId);
  };

  return (
    <div className="screen screen-sessions">
      <div className="screen__header">
        <h1>Sessions</h1>
      </div>
      <div className="screen__content">
        {sessions.length === 0 ? (
          <p>No saved sessions yet. Create one in the Translate screen.</p>
        ) : (
          <div className="session-list">
            {sessions.map((session) => (
              <div key={session.id} className="session-item">
                <div className="session-item__header">
                  <h3>{session.tag || `Session ${session.id.slice(0, 8)}`}</h3>
                  <span className="session-item__date">
                    {new Date(session.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="session-item__description">
                  Model: {session.model} • Directness: {session.directness}
                </p>
                <div className="session-item__actions">
                  <button
                    type="button"
                    className="session-item__action-btn session-item__action-btn--primary"
                    onClick={() => handleLoadSession(session.id)}
                  >
                    Load
                  </button>
                  <button
                    type="button"
                    className="session-item__action-btn session-item__action-btn--danger"
                    onClick={() => handleDeleteSession(session.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TrashScreen() {
  const trashed = useAccountStore((s) => s.trashed);
  const restoreSessionFromTrash = useAccountStore((s) => s.restoreSessionFromTrash);
  const deleteSessionFromTrash = useAccountStore((s) => s.deleteSessionFromTrash);

  const handleRestoreSession = (sessionId: string) => {
    restoreSessionFromTrash(sessionId);
  };

  const handlePermanentlyDelete = (sessionId: string) => {
    deleteSessionFromTrash(sessionId);
  };

  return (
    <div className="screen screen-trash">
      <div className="screen__header">
        <h1>Trash</h1>
      </div>
      <div className="screen__content">
        {trashed.length === 0 ? (
          <p>No deleted sessions. Items you delete from Sessions will appear here.</p>
        ) : (
          <div className="trashed-list">
            {trashed.map((session) => (
              <div key={session.id} className="trashed-item">
                <div className="trashed-item__header">
                  <h3>{session.tag || `Session ${session.id.slice(0, 8)}`}</h3>
                  <span className="trashed-item__date">
                    {new Date(session.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="trashed-item__description">
                  Model: {session.model} • Directness: {session.directness}
                </p>
                <div className="trashed-item__actions">
                  <button
                    type="button"
                    className="trashed-item__action-btn trashed-item__action-btn--primary"
                    onClick={() => handleRestoreSession(session.id)}
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    className="trashed-item__action-btn trashed-item__action-btn--danger"
                    onClick={() => handlePermanentlyDelete(session.id)}
                  >
                    Delete Permanently
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
    case "sessions":
      return <SessionsScreen />;
    case "trash":
      return <TrashScreen />;
    default:
      const _exhaustive: never = currentScreen;
      return _exhaustive;
  }
}

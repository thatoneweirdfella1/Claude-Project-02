import { useState } from "react";
import { useSessionStore } from "../../stores/sessionStore";
import { useAccountStore } from "../../stores/accountStore";
import { CenterColumn } from "../pipeline";

function HomeScreen() {
  const sessions = useAccountStore((s) => s.sessions);
  const loadSessionRecord = useSessionStore((s) => s.loadSessionRecord);
  const setCurrentScreen = useSessionStore((s) => s.setCurrentScreen);

  const recentSessions = [...sessions].reverse().slice(0, 3);

  const handleLoadSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      loadSessionRecord(session);
      setCurrentScreen("translate");
    }
  };

  return (
    <div className="screen screen-home">
      <div className="screen__header">
        <h1>Welcome to Divergence.AI</h1>
      </div>
      <div className="screen__content">
        <div className="home-section">
          <h2>Get Started</h2>
          <p>Divergence.AI is an ADHD-friendly AI translator that helps you communicate your thoughts clearly. Start composing in the <strong>Translate</strong> tab on the left.</p>
          <div className="home-cta">
            <button
              type="button"
              className="home-cta__btn"
              onClick={() => setCurrentScreen("translate")}
            >
              Go to Translate
            </button>
          </div>
        </div>

        {recentSessions.length > 0 && (
          <div className="home-section">
            <h2>Recent Sessions</h2>
            <div className="home-session-list">
              {recentSessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  className="home-session-card"
                  onClick={() => handleLoadSession(session.id)}
                >
                  <div className="home-session-card__title">
                    {session.tag || `Session ${session.id.slice(0, 6)}`}
                  </div>
                  <div className="home-session-card__meta">
                    {new Date(session.createdAt).toLocaleDateString()} •{" "}
                    {session.conversation.length} messages
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="home-section">
          <h2>Quick Tips</h2>
          <ul className="home-tips">
            <li>Use <strong>Directness</strong> (1–5) to control formality: low is casual, high is professional</li>
            <li>Try different <strong>Techniques</strong> (Socratic, Chain-of-thought, etc.) to explore response styles</li>
            <li>Save frequently used settings as <strong>Templates</strong> for quick reuse</li>
            <li>Search past sessions and templates from the top bar</li>
          </ul>
        </div>

        <div className="home-section">
          <h2>Features</h2>
          <ul className="home-features">
            <li><strong>Sessions:</strong> Save and load complete conversations</li>
            <li><strong>Templates:</strong> Reuse your favorite settings</li>
            <li><strong>Search:</strong> Quickly find sessions and templates</li>
            <li><strong>Dashboard:</strong> View your account statistics</li>
            <li><strong>Archive:</strong> Browse closed and saved sessions</li>
          </ul>
        </div>
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
  const sessions = useAccountStore((s) => s.sessions);

  const allMessages = sessions
    .flatMap((session) =>
      session.conversation.map((msg) => ({
        ...msg,
        sessionId: session.id,
        sessionTag: session.tag || `Session ${session.id.slice(0, 6)}`,
      }))
    )
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 50);

  if (allMessages.length === 0) {
    return (
      <div className="screen screen-messages">
        <div className="screen__header">
          <h1>Messages</h1>
        </div>
        <div className="screen__content">
          <p>No messages yet. Start a conversation in the Translate screen.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen-messages">
      <div className="screen__header">
        <h1>Messages</h1>
      </div>
      <div className="screen__content">
        <div className="messages-list">
          {allMessages.map((msg, idx) => (
            <div key={`${msg.sessionId}-${idx}`} className="message-item">
              <div className="message-item__header">
                <span className="message-item__session">{msg.sessionTag}</span>
                <span className="message-item__role">{msg.role}</span>
                {msg.timestamp && (
                  <span className="message-item__time">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                )}
              </div>
              <p className="message-item__content">{msg.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArchiveScreen() {
  const sessions = useAccountStore((s) => s.sessions);
  const loadSessionRecord = useSessionStore((s) => s.loadSessionRecord);
  const setCurrentScreen = useSessionStore((s) => s.setCurrentScreen);
  const moveSessionToTrash = useAccountStore((s) => s.moveSessionToTrash);

  const archivedSessions = sessions.filter((s) => s.archived);

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
    <div className="screen screen-archive">
      <div className="screen__header">
        <h1>Archive</h1>
      </div>
      <div className="screen__content">
        {archivedSessions.length === 0 ? (
          <p>No archived sessions yet. Use "Close Session → Save and Archive" to archive conversations.</p>
        ) : (
          <div className="session-list">
            {archivedSessions.map((session) => (
              <div key={session.id} className="session-item">
                <div className="session-item__header">
                  <div>
                    <h3>{session.tag || `Session ${session.id.slice(0, 8)}`}</h3>
                    {session.closedAt && (
                      <span className="session-item__closed-date">
                        Archived: {new Date(session.closedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
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

function ResourcesScreen() {
  const resources = [
    {
      title: "Getting Started",
      description: "Learn how to use Divergence.AI to translate your thoughts into clear communication.",
      items: [
        "1. Type your thoughts in the composer",
        "2. Click Translate & Ask to get AI feedback",
        "3. Explore different directness and technique options",
      ],
    },
    {
      title: "Features",
      description: "Core features of Divergence.AI",
      items: [
        "Sessions: Save and load conversation sessions",
        "Templates: Create and reuse preset configurations",
        "Search: Find sessions and templates quickly",
      ],
    },
    {
      title: "Tips",
      description: "Best practices for getting better results",
      items: [
        "Use Directness to control response formality",
        "Try different Techniques to explore various response styles",
        "Save successful sessions as templates",
      ],
    },
  ];

  return (
    <div className="screen screen-resources">
      <div className="screen__header">
        <h1>Resources</h1>
      </div>
      <div className="screen__content">
        <div className="resources-grid">
          {resources.map((resource) => (
            <div key={resource.title} className="resource-card">
              <h3 className="resource-card__title">{resource.title}</h3>
              <p className="resource-card__description">{resource.description}</p>
              <ul className="resource-card__list">
                {resource.items.map((item) => (
                  <li key={item} className="resource-card__item">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectsScreen() {
  const sessions = useAccountStore((s) => s.sessions);

  const projectsMap = new Map<string, typeof sessions>();
  const defaultProject = "Unsorted";

  sessions.forEach((session) => {
    const projectName = session.tag ? session.tag.split(":")[0].trim() : defaultProject;
    if (!projectsMap.has(projectName)) {
      projectsMap.get(projectName) || projectsMap.set(projectName, []);
    }
    projectsMap.get(projectName)?.push(session);
  });

  const projects = Array.from(projectsMap.entries()).sort(([a], [b]) => {
    if (a === defaultProject) return 1;
    if (b === defaultProject) return -1;
    return a.localeCompare(b);
  });

  if (projects.length === 0 || (projects.length === 1 && projects[0][0] === defaultProject && projects[0][1].length === 0)) {
    return (
      <div className="screen screen-projects">
        <div className="screen__header">
          <h1>Projects</h1>
        </div>
        <div className="screen__content">
          <p>No projects yet. Sessions tagged with a project name will appear here. Use "Close Session → Archive Tagged" to tag sessions with a project name (e.g., "MyProject: Description").</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen-projects">
      <div className="screen__header">
        <h1>Projects</h1>
      </div>
      <div className="screen__content">
        <div className="projects-list">
          {projects.map(([projectName, projectSessions]) => (
            <div key={projectName} className="project-group">
              <h3 className="project-group__title">
                {projectName}
                <span className="project-group__count">{projectSessions.length}</span>
              </h3>
              <div className="project-sessions">
                {projectSessions.map((session) => (
                  <div key={session.id} className="project-session">
                    <div className="project-session__info">
                      <h4>{session.tag || `Session ${session.id.slice(0, 6)}`}</h4>
                      <span className="project-session__date">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IntegrationsScreen() {
  const integrations = [
    {
      name: "Email",
      icon: "📧",
      description: "Send translated thoughts directly to your inbox or email them to others",
      status: "planned",
    },
    {
      name: "Slack",
      icon: "💬",
      description: "Post translated messages to Slack channels and save them to your workspace",
      status: "planned",
    },
    {
      name: "Google Docs",
      icon: "📄",
      description: "Export translated conversations to Google Docs for further editing and sharing",
      status: "planned",
    },
    {
      name: "Notion",
      icon: "📝",
      description: "Save sessions and templates to your Notion workspace for centralized knowledge management",
      status: "planned",
    },
    {
      name: "GitHub",
      icon: "🐙",
      description: "Create GitHub issues with translated problem descriptions and technical details",
      status: "planned",
    },
    {
      name: "Discord",
      icon: "🎮",
      description: "Share translated messages with your Discord communities and servers",
      status: "planned",
    },
  ];

  return (
    <div className="screen screen-integrations">
      <div className="screen__header">
        <h1>Integrations</h1>
      </div>
      <div className="screen__content">
        <div className="integrations-intro">
          <p>
            Divergence.AI integrations let you send your translated thoughts to the tools you already use. Connect your favorite apps to streamline your workflow.
          </p>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
            Integrations are planned for a future release. All features listed below are coming soon.
          </p>
        </div>
        <div className="integrations-grid">
          {integrations.map((integration) => (
            <div key={integration.name} className="integration-card">
              <div className="integration-card__icon">{integration.icon}</div>
              <h3 className="integration-card__title">{integration.name}</h3>
              <p className="integration-card__description">{integration.description}</p>
              <div className="integration-card__status">
                <span className="integration-card__badge integration-card__badge--planned">
                  Coming Soon
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TasksScreen() {
  const sessions = useAccountStore((s) => s.sessions);

  const extractedTasks: Array<{
    content: string;
    sessionId: string;
    sessionTag: string;
    timestamp?: number;
  }> = [];

  const taskPatterns = [
    /(?:^|\n)[-*]\s+(\[[ x]\]\s+)?(.+)/gm,
    /(?:^|\n)(?:TODO|FIXME|NOTE)[\s:]+(.+)/gm,
  ];

  sessions.forEach((session) => {
    session.conversation.forEach((msg) => {
      if (msg.role === "assistant") {
        taskPatterns.forEach((pattern) => {
          let match;
          while ((match = pattern.exec(msg.content)) !== null) {
            const taskContent = match[2] || match[1];
            if (taskContent && taskContent.length < 150) {
              extractedTasks.push({
                content: taskContent.trim(),
                sessionId: session.id,
                sessionTag: session.tag || `Session ${session.id.slice(0, 6)}`,
                timestamp: msg.timestamp,
              });
            }
          }
        });
      }
    });
  });

  const uniqueTasks = Array.from(
    new Map(extractedTasks.map((t) => [t.content, t])).values()
  ).slice(0, 20);

  if (uniqueTasks.length === 0) {
    return (
      <div className="screen screen-tasks">
        <div className="screen__header">
          <h1>Tasks</h1>
        </div>
        <div className="screen__content">
          <p>No tasks found. Tasks are automatically extracted from AI responses that contain action items or bullet points.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen screen-tasks">
      <div className="screen__header">
        <h1>Tasks</h1>
      </div>
      <div className="screen__content">
        <div className="tasks-list">
          {uniqueTasks.map((task) => (
            <div key={task.content} className="task-item">
              <div className="task-item__checkbox" />
              <div className="task-item__content">
                <p className="task-item__text">{task.content}</p>
                <span className="task-item__session">{task.sessionTag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplatesScreen() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    model: "auto" as const,
    directness: 2,
    techniques: [] as string[],
  });

  const templates = useAccountStore((s) => s.templates);
  const removeTemplate = useAccountStore((s) => s.removeTemplate);
  const addTemplate = useAccountStore((s) => s.addTemplate);
  const setModel = useSessionStore((s) => s.setModel);
  const setDirectness = useSessionStore((s) => s.setDirectness);
  const setTechniques = useSessionStore((s) => s.setTechniques);
  const setCurrentScreen = useSessionStore((s) => s.setCurrentScreen);

  const builtInTemplates = templates.filter((t) => t.id.startsWith("template-"));
  const customTemplates = templates.filter((t) => !t.id.startsWith("template-"));

  const allTechniques = ["auto-detect", "socratic", "chain-of-thought", "verify", "examples"];

  const handleLoadTemplate = (template: typeof templates[0]) => {
    setModel(template.model);
    setDirectness(template.directness);
    setTechniques(template.techniques);
    setCurrentScreen("translate");
  };

  const handleDeleteTemplate = (templateId: string) => {
    removeTemplate(templateId);
  };

  const handleCreateTemplate = () => {
    if (formData.title.trim()) {
      addTemplate({
        id: `custom-${Date.now()}`,
        title: formData.title,
        model: formData.model,
        directness: formData.directness as 1 | 2 | 3,
        techniques: formData.techniques as any,
      });
      setFormData({ title: "", model: "auto", directness: 2, techniques: [] });
      setShowCreateForm(false);
    }
  };

  const toggleTechnique = (technique: string) => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      techniques: prev.techniques.includes(technique)
        ? prev.techniques.filter((t: string) => t !== technique)
        : [...prev.techniques, technique],
    }));
  };

  return (
    <div className="screen screen-templates">
      <div className="screen__header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>Templates</h1>
          <button
            type="button"
            className="settings-btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{ margin: 0 }}
          >
            {showCreateForm ? "Cancel" : "Create Template"}
          </button>
        </div>
      </div>
      <div className="screen__content">
        {showCreateForm && (
          <div className="template-form">
            <div className="form-group">
              <label className="form-group__label">Template Name</label>
              <input
                type="text"
                className="form-group__input"
                placeholder="e.g., Quick FAQ"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-group__label">Model</label>
              <select
                className="form-group__input"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value as any })}
              >
                <option value="auto">Auto (Recommended)</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-group__label">Directness ({formData.directness})</label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.directness}
                onChange={(e) => setFormData({ ...formData, directness: parseInt(e.target.value) })}
                className="form-group__slider"
              />
            </div>
            <div className="form-group">
              <label className="form-group__label">Techniques</label>
              <div className="form-group__techniques">
                {allTechniques.map((tech) => (
                  <label key={tech} className="form-group__checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.techniques.includes(tech)}
                      onChange={() => toggleTechnique(tech)}
                    />
                    {tech}
                  </label>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="settings-btn"
              onClick={handleCreateTemplate}
            >
              Create
            </button>
          </div>
        )}

        {builtInTemplates.length > 0 && (
          <div className="templates-section">
            <h3 className="templates-section__title">Built-in Templates</h3>
            <div className="template-list">
              {builtInTemplates.map((template) => (
                <div key={template.id} className="template-card">
                  <div className="template-card__header">
                    <h4>{template.title}</h4>
                  </div>
                  <div className="template-card__meta">
                    <span className="template-card__badge">Model: {template.model}</span>
                    <span className="template-card__badge">Directness: {template.directness}</span>
                  </div>
                  {template.techniques && template.techniques.length > 0 && (
                    <div className="template-card__techniques">
                      {template.techniques.map((t) => (
                        <span key={t} className="template-card__technique">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {template.starterQuestion && (
                    <p className="template-card__description">{template.starterQuestion}</p>
                  )}
                  <button
                    type="button"
                    className="template-card__btn template-card__btn--primary"
                    onClick={() => handleLoadTemplate(template)}
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {customTemplates.length > 0 && (
          <div className="templates-section">
            <h3 className="templates-section__title">Custom Templates</h3>
            <div className="template-list">
              {customTemplates.map((template) => (
                <div key={template.id} className="template-card">
                  <div className="template-card__header">
                    <h4>{template.title}</h4>
                  </div>
                  <div className="template-card__meta">
                    <span className="template-card__badge">Model: {template.model}</span>
                    <span className="template-card__badge">Directness: {template.directness}</span>
                  </div>
                  {template.techniques && template.techniques.length > 0 && (
                    <div className="template-card__techniques">
                      {template.techniques.map((t) => (
                        <span key={t} className="template-card__technique">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {template.starterQuestion && (
                    <p className="template-card__description">{template.starterQuestion}</p>
                  )}
                  <div className="template-card__actions">
                    <button
                      type="button"
                      className="template-card__btn template-card__btn--primary"
                      onClick={() => handleLoadTemplate(template)}
                    >
                      Use Template
                    </button>
                    <button
                      type="button"
                      className="template-card__btn template-card__btn--danger"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {templates.length === 0 && (
          <p>No templates yet. Save a template from the Translate screen using "Close Session → Archive Tagged" or create one manually.</p>
        )}
      </div>
    </div>
  );
}

function SettingsScreen() {
  const plan = useAccountStore((s) => s.plan);
  const sessions = useAccountStore((s) => s.sessions);
  const trashed = useAccountStore((s) => s.trashed);

  const totalSessions = sessions.length;
  const totalTrashed = trashed.length;
  const totalMessages = sessions.reduce((sum, s) => sum + s.conversation.length, 0);

  const handleExportData = () => {
    const accountData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      plan,
      stats: {
        totalSessions,
        totalTrashed,
        totalMessages,
      },
      // Note: Full data export would include all sessions, templates, etc.
      // For now, just showing that the feature exists and could be built
    };
    const dataStr = JSON.stringify(accountData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `divergence-ai-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  return (
    <div className="screen screen-settings">
      <div className="screen__header">
        <h1>Settings</h1>
      </div>
      <div className="screen__content">
        <div className="settings-section">
          <h3>Account</h3>
          <div className="settings-item">
            <div className="settings-item__label">Plan</div>
            <div className="settings-item__value">{plan === "free" ? "Free" : "Pro"}</div>
          </div>
          <div className="settings-item">
            <div className="settings-item__label">Email</div>
            <div className="settings-item__value">user@example.com</div>
          </div>
        </div>

        <div className="settings-section">
          <h3>Storage & Sync</h3>
          <div className="settings-item">
            <div className="settings-item__label">Sessions Saved</div>
            <div className="settings-item__value">{totalSessions}</div>
          </div>
          <div className="settings-item">
            <div className="settings-item__label">Items in Trash</div>
            <div className="settings-item__value">{totalTrashed}</div>
          </div>
          <div className="settings-item">
            <div className="settings-item__label">Total Messages</div>
            <div className="settings-item__value">{totalMessages}</div>
          </div>
          <button
            type="button"
            className="settings-btn"
            onClick={handleExportData}
          >
            Export Data as JSON
          </button>
        </div>

        <div className="settings-section">
          <h3>Display</h3>
          <p className="settings-section__note">
            Theme, layout, and sidebar visibility are controlled via the Settings gear icon (⚙️) in the top bar.
          </p>
        </div>

        <div className="settings-section">
          <h3>About Divergence.AI</h3>
          <div className="settings-item">
            <div className="settings-item__label">Version</div>
            <div className="settings-item__value">0.1.0</div>
          </div>
          <p className="settings-section__note">
            Divergence.AI is an ADHD-friendly AI translator that helps you communicate your thoughts clearly.
          </p>
        </div>
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
    case "templates":
      return <TemplatesScreen />;
    case "settings":
      return <SettingsScreen />;
    case "trash":
      return <TrashScreen />;
    default:
      const _exhaustive: never = currentScreen;
      return _exhaustive;
  }
}

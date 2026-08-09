import { useEffect, useState } from "react";
import { UserRound, Wrench } from "lucide-react";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import { desktopBridge } from "../../services/desktopBridge";

export function WorkspaceModeBar() {
  const currentScreen = useSessionStore((state) => state.currentScreen);
  const mode = useAccountStore((state) => state.appMode);
  const setMode = useAccountStore((state) => state.setAppMode);
  const [operator, setOperator] = useState(
    !desktopBridge() && ["localhost", "127.0.0.1"].includes(window.location.hostname),
  );
  useEffect(() => {
    const desktop = desktopBridge();
    if (desktop) void desktop.auth.current().then((user) => setOperator(user?.role === "operator"));
  }, []);
  useEffect(() => {
    if (!operator && mode === "developer") setMode("user");
  }, [mode, operator, setMode]);
  if (currentScreen !== "translate") return null;

  return (
    <div className="workspace-mode-bar">
      <div>
        <h1>Translate</h1>
        <p>Transform your thoughts into clear, effective AI communication.</p>
      </div>
      <div className="workspace-mode-toggle" role="group" aria-label="Application mode">
        <button
          type="button"
          className={mode === "user" ? "is-active" : ""}
          onClick={() => setMode("user")}
        >
          <UserRound size={15} /> User Mode
        </button>
        <button
          type="button"
          className={mode === "developer" ? "is-active" : ""}
          disabled={!operator}
          title={operator ? "Open unlimited testing controls" : "Developer Mode is operator-only"}
          onClick={() => setMode("developer")}
        >
          <Wrench size={15} /> Developer Mode
        </button>
      </div>
    </div>
  );
}

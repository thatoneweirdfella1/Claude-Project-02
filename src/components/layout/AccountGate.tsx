import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { UserPlus, LogIn } from "lucide-react";
import { desktopBridge, type DesktopUser } from "../../services/desktopBridge";
import { loadPersistedState } from "../../services/persistence";
import { AppAccessGate } from "./AppAccessGate";
import { WindowControls } from "./WindowControls";

export function AccountGate({ children }: { children: ReactNode }) {
  const desktop = desktopBridge();
  const [user, setUser] = useState<DesktopUser | null | undefined>(desktop ? undefined : null);
  const [signUp, setSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!desktop) return;
    let active = true;
    desktop.auth.current().then((current) => {
      if (active) setUser(current);
    });
    return () => { active = false; };
  }, [desktop]);

  if (!desktop) return <AppAccessGate>{children}</AppAccessGate>;
  if (user) return <>{children}</>;
  if (user === undefined) return <div className="app-access-gate" aria-label="Loading account" />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const next = signUp
        ? await desktop.auth.signUp({ email, password, displayName: displayName || email.split("@")[0] })
        : await desktop.auth.logIn({ email, password });
      await loadPersistedState();
      setUser(next);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Account access failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <WindowControls floating />
      <div className="app-access-gate desktop-account-gate">
        <form className="desktop-account-gate__card surface-smoked-glass" onSubmit={(event) => void submit(event)}>
          <div className="desktop-account-gate__icon">{signUp ? <UserPlus /> : <LogIn />}</div>
          <h1>{signUp ? "Create Local Account" : "Welcome Back"}</h1>
          <p>Accounts, credits, sessions, and templates stay isolated in this computer's local SQLite database. Passwords are salted and hashed.</p>
          {signUp && <label>Display name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" /></label>}
          <label>Email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>
          <label>Password<input type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={signUp ? "new-password" : "current-password"} /></label>
          {error && <p className="desktop-account-gate__error" role="alert">{error}</p>}
          <button type="submit" disabled={submitting}>{submitting ? "Please wait…" : signUp ? "Create Account" : "Log In"}</button>
          <button type="button" className="desktop-account-gate__switch" onClick={() => { setSignUp((value) => !value); setError(""); }}>
            {signUp ? "Use an existing account" : "Create a new local account"}
          </button>
        </form>
      </div>
    </>
  );
}

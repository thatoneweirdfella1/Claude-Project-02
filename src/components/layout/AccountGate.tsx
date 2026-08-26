import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { UserPlus, LogIn } from "lucide-react";
import { desktopBridge, type DesktopUser } from "../../services/desktopBridge";
import { getAccountStatus, submitAccount, type AccountUser } from "../../services/durableSync";
import { loadPersistedState } from "../../services/persistence";
import { AppAccessGate } from "./AppAccessGate";
import { WindowControls } from "./WindowControls";

export function AccountGate({ children }: { children: ReactNode }) {
  const desktop = desktopBridge();
  const [desktopUser, setDesktopUser] = useState<DesktopUser | null | undefined>(desktop ? undefined : null);
  const [webUser, setWebUser] = useState<AccountUser | null | undefined>(desktop ? null : undefined);
  const [remoteConfigured, setRemoteConfigured] = useState(false);
  const [signUp, setSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    if (desktop) {
      desktop.auth.current().then((current) => {
        if (active) setDesktopUser(current);
      });
    } else {
      getAccountStatus().then((status) => {
        if (!active) return;
        setRemoteConfigured(status.configured);
        setWebUser(status.user);
      }).catch(() => {
        if (active) {
          setRemoteConfigured(false);
          setWebUser(null);
        }
      });
    }
    return () => { active = false; };
  }, [desktop]);

  const user = desktop ? desktopUser : webUser;
  if (user) return <AppAccessGate>{children}</AppAccessGate>;
  if (!desktop && webUser === null && !remoteConfigured) return <AppAccessGate>{children}</AppAccessGate>;
  if (user === undefined) return <div className="app-access-gate" aria-label="Loading account" />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (desktop) {
        const next = signUp
          ? await desktop.auth.signUp({ email, password, displayName: displayName || email.split("@")[0] })
          : await desktop.auth.logIn({ email, password });
        await loadPersistedState();
        setDesktopUser(next);
      } else {
        const next = await submitAccount(signUp ? "register" : "login", {
          email,
          password,
          displayName: displayName || email.split("@")[0],
        });
        setWebUser(next);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Account access failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return <>
    {desktop && <WindowControls floating />}
    <div className={`app-access-gate ${desktop ? "desktop-account-gate" : "web-account-gate"}`}>
      <form className="desktop-account-gate__card surface-smoked-glass" onSubmit={(event) => void submit(event)}>
        <div className="desktop-account-gate__icon">{signUp ? <UserPlus /> : <LogIn />}</div>
        <h1>{signUp ? "Create Account" : "Welcome Back"}</h1>
        <p>{desktop
          ? "This local account isolates data in this computer's encrypted-at-rest operating-system profile."
          : "Your account keeps confirmed sessions and settings available across devices. Conflicting edits are never silently overwritten."}</p>
        {signUp && <label>Display name<input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" /></label>}
        <label>Email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>
        <label>Password<input type="password" minLength={12} required value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={signUp ? "new-password" : "current-password"} /></label>
        {error && <p className="desktop-account-gate__error" role="alert">{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? "Please wait…" : signUp ? "Create Account" : "Log In"}</button>
        <button type="button" className="desktop-account-gate__switch" onClick={() => { setSignUp((value) => !value); setError(""); }}>
          {signUp ? "Use an existing account" : "Create a new account"}
        </button>
      </form>
    </div>
  </>;
}

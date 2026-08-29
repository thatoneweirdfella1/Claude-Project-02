import { desktopBridge } from "./desktopBridge";

export async function logOutCurrentAccount(): Promise<void> {
  const desktop = desktopBridge();
  if (desktop) {
    await desktop.auth.logOut();
    window.location.reload();
    return;
  }
  window.location.href = "/logout";
}

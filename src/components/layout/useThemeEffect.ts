import { useEffect } from "react";
import { useAccountStore } from "../../stores/accountStore";

/* useThemeEffect — CANON Feature 12's Light/Dark/Auto toggle, the
   resolution side. accountStore.theme holds the user's raw preference
   ("light" | "dark" | "auto"); this hook resolves "auto" against the OS's
   prefers-color-scheme and writes the RESOLVED value to
   document.documentElement's data-theme attribute, which tokens.css's
   :root[data-theme="light"] overrides key off — CSS does the actual
   re-theming, this hook only decides which theme applies right now.

   "auto" stays live: if the OS preference changes while "auto" is
   selected (e.g. the system flips to dark mode at sunset), the
   matchMedia listener re-resolves without a reload — CANON's own words,
   "Auto follows the OS preference," not just "reads it once at load." */

function resolveTheme(preference: "light" | "dark" | "auto", prefersLight: boolean): "light" | "dark" {
  if (preference === "auto") return prefersLight ? "light" : "dark";
  return preference;
}

export function useThemeEffect(): void {
  const theme = useAccountStore((s) => s.theme);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");

    function apply() {
      document.documentElement.dataset.theme = resolveTheme(theme, media.matches);
    }

    apply();

    if (theme !== "auto") return; // no OS-change listening needed for an explicit choice
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
}

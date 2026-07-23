import { useEffect } from "react";
import { useAccountStore } from "../../stores/accountStore";

/* useDesignLayoutEffect — CLAUDE.md "Design layouts". accountStore.layout
   holds which complete visual re-skin is active; this hook writes it
   straight to document.documentElement's data-layout attribute, which
   each layout's CSS keys off via :root[data-layout="..."] — same
   mechanism as useThemeEffect.ts's data-theme, just no "auto" to resolve
   (a layout is always an explicit pick, never OS-derived). */

export function useDesignLayoutEffect(): void {
  const layout = useAccountStore((s) => s.layout);

  useEffect(() => {
    document.documentElement.dataset.layout = layout;
  }, [layout]);
}

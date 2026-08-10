import { useEffect } from "react";
import { useAccountStore } from "../../stores/accountStore";
import { isDesktopApp } from "../../services/desktopBridge";

/** The supplied dark/light compositions are the product shell. The layout
    is intentionally frozen; theme and the background behind the glass may
    change, but component placement cannot. */
export function useDesignLayoutEffect(): void {
  const layout = useAccountStore((state) => state.layout);
  useEffect(() => {
    document.documentElement.dataset.layout = isDesktopApp() ? "gold" : layout;
  }, [layout]);
}

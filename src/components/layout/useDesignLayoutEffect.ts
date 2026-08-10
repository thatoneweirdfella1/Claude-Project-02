import { useEffect } from "react";

/** The supplied dark/light compositions are the product shell. The layout
    is intentionally frozen; theme and the background behind the glass may
    change, but component placement cannot. */
export function useDesignLayoutEffect(): void {
  useEffect(() => {
    document.documentElement.dataset.layout = "gold";
  }, []);
}

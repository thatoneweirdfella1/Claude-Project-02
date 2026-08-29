import { useEffect } from "react";

/**
 * The approved light/dark compositions are the only product layout.
 * Historical persisted layout choices must not restore the obsolete shell.
 */
export function useDesignLayoutEffect(): void {
  useEffect(() => {
    document.documentElement.dataset.layout = "gold";
  }, []);
}

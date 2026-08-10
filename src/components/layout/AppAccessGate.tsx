import { type ReactNode } from "react";

export interface AppAccessGateProps {
  children: ReactNode;
}

export function AppAccessGate({ children }: AppAccessGateProps) {
  return <>{children}</>;
}

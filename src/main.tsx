import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppShell } from "./components/layout/AppShell";
import { MarbleSlab } from "./components/layout/MarbleSlab";
import "./styles/tokens.css";
import "./styles/layout.css";
import "./styles/marble.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MarbleSlab />
    <AppShell />
  </StrictMode>,
);

// vite entry point, just mounts App
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// index.html always has this div — safe to assert non-null rather than
// thread an "element might not exist" case through the whole app.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

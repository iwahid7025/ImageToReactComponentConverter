/**
 * Entry point for the React application.
 * This file initializes the React root and renders the App component.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Create React root and render the app in strict mode for highlighting potential issues
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
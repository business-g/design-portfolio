import React from "react";
import { createRoot } from "react-dom/client";
import "@sfinterface/numbers/styles.css";
import "./styles.css";
import Home from "./page";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>,
);

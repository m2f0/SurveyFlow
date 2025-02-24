import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { ResponseProvider } from "./lib/context/ResponseContext";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light">
      <ResponseProvider>
        <BrowserRouter basename={basename}>
          <App />
        </BrowserRouter>
      </ResponseProvider>
    </ThemeProvider>
  </React.StrictMode>,
);

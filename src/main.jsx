import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { AppEventsProvider } from "./context/AppEventsContext";
import { ThemeProvider } from "./hooks/ThemeProvider";
import { PageProvider } from "./context/PageContext";


ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
    <ThemeProvider>
    <AuthProvider>
    <AppEventsProvider>
    <PageProvider>
      <App />
      </PageProvider>
      </AppEventsProvider>
    </AuthProvider>
    </ThemeProvider>
  // </React.StrictMode>
);

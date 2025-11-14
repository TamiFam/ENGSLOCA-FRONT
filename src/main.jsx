import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { AppEventsProvider } from "./context/AppEventsContext";
import { ThemeProvider } from "./hooks/ThemeProvider";


ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
    <ThemeProvider>
    <AuthProvider>
    <AppEventsProvider>
      <App />
      </AppEventsProvider>
    </AuthProvider>
    </ThemeProvider>
  // </React.StrictMode>
);

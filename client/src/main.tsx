import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app";
import AuthUserProvider from "./auth/AuthUserProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthUserProvider>
        <App />
      </AuthUserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
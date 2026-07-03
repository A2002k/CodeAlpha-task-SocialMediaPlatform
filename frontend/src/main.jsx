import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { UserProvider } from "./context/UserContext";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <UserProvider>
        <App />
    </UserProvider>
</BrowserRouter>
);
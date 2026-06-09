import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "leaflet/dist/leaflet.css";

import App from "./App.jsx";
import { SearchProvider } from "./context/SearchContext";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { NotificationProvider } from "./context/NotificationContext";

//toast

createRoot(document.getElementById("root")).render(

    <SearchProvider>
        <BrowserRouter>
            <AuthProvider>
                <SocketProvider>
                  <NotificationProvider>

                    <App />

                  </NotificationProvider>
                </SocketProvider>
            </AuthProvider>
        </BrowserRouter>
    </SearchProvider>


);

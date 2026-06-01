import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "leaflet/dist/leaflet.css";

import App from "./App.jsx";
import { SearchProvider } from "./context/SearchContext";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

//toast

createRoot(document.getElementById("root")).render(

    <SearchProvider>
        <BrowserRouter>
            <AuthProvider>
                <SocketProvider>

                    <App />

                </SocketProvider>
            </AuthProvider>
        </BrowserRouter>
    </SearchProvider>


);

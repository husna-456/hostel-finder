// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token,        setToken]        = useState(null);
  const [role,         setRole]         = useState(null);
  const [user,         setUser]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [lastAuthRole, setLastAuthRole] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedRole  = localStorage.getItem("userRole");
    const savedUser  = localStorage.getItem("user");

    if (savedToken && savedRole) {
      setToken(savedToken);
      setRole(savedRole);
    }
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch {}
    }
    setLoading(false);

    // Hydrate with fresh profile (picks up profilePicture on page reload)
    if (savedToken) {
      const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      fetch(`${BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${savedToken}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?._id) {
            setUser(data);
            localStorage.setItem("user", JSON.stringify(data));
          }
        })
        .catch(() => {});
    }
  }, []);

  const login = (newToken, userRole, userData) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("userRole", userRole);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }
    setToken(newToken);
    setRole(userRole);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...updatedData };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    setLastAuthRole(role);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token, role, user,
        isAuthenticated: !!token,
        login, logout, updateUser,
        loading, lastAuthRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

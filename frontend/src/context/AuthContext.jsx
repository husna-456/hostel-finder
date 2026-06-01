// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastAuthRole, setLastAuthRole] = useState(null);


  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedRole = localStorage.getItem("userRole");

    if (savedToken && savedRole) {
      setToken(savedToken);
      setRole(savedRole);
    }

    setLoading(false);
  }, []);

  const login = (newToken, userRole) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("userRole", userRole);
    setToken(newToken);
    setRole(userRole); // 🔥 triggers re-render
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
  setLastAuthRole(role);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{
      token,
      role,
      isAuthenticated: !!token,
      login,
      logout,
      loading,
      lastAuthRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};
 
export const useAuth = () => useContext(AuthContext);  AuthContext.jsx
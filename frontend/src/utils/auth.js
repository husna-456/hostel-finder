// src/utils/auth.js

// Correct import - named import use karo
import { jwtDecode } from 'jwt-decode';

export const getToken = () => {
  return localStorage.getItem("token");
};
export const getUserRole = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      return decoded.role;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  return null;
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  // Optional: Check token expiration
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      // Token expired
      localStorage.removeItem('token');
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
    localStorage.removeItem("user");
      localStorage.removeItem("userRole");
  window.location.href = '/login';
};

export const getUserId = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      return decoded.userId || decoded.id || decoded.sub;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  return null;
};

export const getUserData = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  return null;
};
export const getLoggedInUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

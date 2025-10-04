import { useEffect, useState, createContext, useContext } from "react";
import axios from "axios";

export const AuthContext = createContext();

import { API_BASE } from "../utils/apiClient";

axios.defaults.baseURL = API_BASE;
axios.defaults.withCredentials = true;


export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("user")) || null;
      } catch {
        return null;
      }
    }
    return null;
  });

  // LOGIN
  const login = async (inputs) => {
    try {
      const res = await axios.post("/auth/login", inputs);
      setCurrentUser(res.data.user);
      return res.data;
    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);
      throw err;
    }
  };

  // REGISTER (sets user because backend returns cookie + user)
  const register = async (inputs) => {
    try {
      const res = await axios.post("/auth/register", inputs);
      // backend returns { user: {...} } and sets cookie
      setCurrentUser(res.data.user);
      return res.data;
    } catch (err) {
      console.error("❌ Register error:", err.response?.data || err.message);
      throw err;
    }
  };

  // LOGOUT
  const logout = async () => {
    try {
      await axios.post("/auth/logout");
      setCurrentUser(null);
      if (typeof window !== "undefined") localStorage.removeItem("user");
    } catch (err) {
      console.error("❌ Logout error:", err.response?.data || err.message);
    }
  };

  // Persist user across refresh
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (currentUser) {
      try {
        localStorage.setItem("user", JSON.stringify(currentUser));
      } catch {}
    } else {
      localStorage.removeItem("user");
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

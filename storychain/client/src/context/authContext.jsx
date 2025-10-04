import { useEffect, useState, createContext, useContext } from "react";
import axios from "axios";
import { API_BASE } from "../utils/apiClient";

export const AuthContext = createContext();

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

  const [token, setToken] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token") || null;
    }
    return null;
  });

  // LOGIN
  const login = async (inputs) => {
    try {
      const res = await axios.post("/auth/login", inputs, { withCredentials: true });
      setCurrentUser(res.data.user);
      setToken(res.data.token);

      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);

      return res.data;
    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);
      throw err;
    }
  };

  // REGISTER
  const register = async (inputs) => {
    try {
      const res = await axios.post("/auth/register", inputs, { withCredentials: true });
      setCurrentUser(res.data.user);
      setToken(res.data.token);

      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);

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
    } catch (err) {
      console.error("❌ Logout error:", err.response?.data || err.message);
    } finally {
      setCurrentUser(null);
      setToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  };

  // Attach token to axios requests
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ currentUser, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

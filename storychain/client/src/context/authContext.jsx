import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { API_BASE } from "../utils/apiClient";

export const AuthContext = createContext();

axios.defaults.baseURL = API_BASE;
axios.defaults.withCredentials = true; // 🔥 Always send cookies

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from backend cookie on app start
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/auth/me");
        setCurrentUser(res.data.user);
      } catch {
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // LOGIN
  const login = async (inputs) => {
    const res = await axios.post("/auth/login", inputs);
    setCurrentUser(res.data.user);
    return res.data;
  };

  // REGISTER
  const register = async (inputs) => {
    const res = await axios.post("/auth/register", inputs);
    setCurrentUser(res.data.user);
    return res.data;
  };

  // LOGOUT
  const logout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch {}
    setCurrentUser(null);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

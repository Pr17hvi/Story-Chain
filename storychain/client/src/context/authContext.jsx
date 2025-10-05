import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { API_BASE } from "../utils/apiClient";

export const AuthContext = createContext();

axios.defaults.baseURL = API_BASE;

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("access_token") || null);

  // Attach token to every axios request
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // LOGIN
  const login = async (inputs) => {
    const res = await axios.post("/auth/login", inputs);
    const { user, token } = res.data;
    setCurrentUser(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("access_token", token);
    return res.data;
  };

  // REGISTER
  const register = async (inputs) => {
    const res = await axios.post("/auth/register", inputs);
    const { user, token } = res.data;
    setCurrentUser(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("access_token", token);
    return res.data;
  };

  // LOGOUT
  const logout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch {}
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
  };

  return (
    <AuthContext.Provider value={{ currentUser, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

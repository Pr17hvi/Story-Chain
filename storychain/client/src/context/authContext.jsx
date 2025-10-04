import { useEffect, useState, createContext, useContext } from "react";
import axios from "axios";

export const AuthContext = createContext();

// 👇 Define API base dynamically (Render or local)
const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Ensure axios always sends cookies + same base
axios.defaults.baseURL = API_BASE;
axios.defaults.withCredentials = true;

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("user")) || null;
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

  // REGISTER (✅ now sets user immediately because backend issues cookie)
  const register = async (inputs) => {
    try {
      const res = await axios.post("/auth/register", inputs);
      setCurrentUser(res.data.user); // ✅ keep user in state
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
      localStorage.removeItem("user");
    } catch (err) {
      console.error("❌ Logout error:", err.response?.data || err.message);
    }
  };

  // Persist user across refresh
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("user", JSON.stringify(currentUser));
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

// ✅ Custom hook for consuming auth
export const useAuth = () => useContext(AuthContext);

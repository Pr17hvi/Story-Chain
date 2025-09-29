import { useEffect, useState, createContext, useContext } from "react";
import axios from "axios";

export const AuthContext = createContext();

// 👇 Define API base from env (works in dev + prod)
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  // LOGIN
  const login = async (inputs) => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, inputs, {
        withCredentials: true,
      });
      setCurrentUser(res.data.user);
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  // REGISTER
  const register = async (inputs) => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/register`, inputs, {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  // LOGOUT
  const logout = async () => {
    await axios.post(`${API_BASE}/api/auth/logout`, {}, { withCredentials: true });
    setCurrentUser(null);
    localStorage.removeItem("user");
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

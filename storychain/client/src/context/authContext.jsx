
// client/src/context/authContext.jsx
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
      localStorage.setItem("access_token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("access_token");
    }
  }, [token]);

  // LOGIN
  const login = async (inputs) => {
    const res = await axios.post("/auth/login", inputs);
    // support both { user, token } and { data: { user, token } } shapes (axios returns data already)
    const payload = res.data || {};
    const user = payload.user ?? payload.data?.user;
    const t = payload.token ?? payload.data?.token;
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("user", JSON.stringify(user));
    }
    if (t) setToken(t);
    return payload;
  };

  // REGISTER
  const register = async (inputs) => {
    const res = await axios.post("/auth/register", inputs);
    const payload = res.data || {};
    const user = payload.user ?? payload.data?.user;
    const t = payload.token ?? payload.data?.token;
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("user", JSON.stringify(user));
    }
    if (t) setToken(t);
    return payload;
  };

  // LOGOUT
  const logout = async () => {
    try {
      // If your backend exposes logout route you can call it. If not, this will fail silently.
      await axios.post("/auth/logout");
    } catch (err) {
      // ignore network errors on logout
    }
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
  };

  // keep currentUser in sync with token (initial hydration)
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const t = localStorage.getItem("access_token");
      if (!t) {
        if (mounted) {
          setToken(null);
          setCurrentUser(JSON.parse(localStorage.getItem("user")) || null);
        }
        return;
      }
      // token present — try to get /auth/me if available (optional)
      try {
        axios.defaults.headers.common["Authorization"] = `Bearer ${t}`;
        const res = await axios.get("/auth/me").catch(() => null);
        if (mounted && res?.data?.user) {
          setCurrentUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        } else if (mounted && !currentUser) {
          // keep existing stored user if /me not available
          setCurrentUser(JSON.parse(localStorage.getItem("user")) || null);
        }
        if (mounted) setToken(t);
      } catch {
        if (mounted) {
          setToken(null);
          setCurrentUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("access_token");
        }
      }
    };
    init();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, token, login, register, logout, axios }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


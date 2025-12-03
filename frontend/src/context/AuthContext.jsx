import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const API_BASE = "https://backend.codeoce.com";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch session user from backend
  async function fetchUser() {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        credentials: "include",
      });

      const data = await res.json();
      if (data.loggedIn) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Auth fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }

  // Run on boot
  useEffect(() => {
    fetchUser();
  }, []);

  // Redirect to Twitch OAuth
  const login = () => {
    window.location.href = `${API_BASE}/auth/login`;
  };

  const logout = () => {
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

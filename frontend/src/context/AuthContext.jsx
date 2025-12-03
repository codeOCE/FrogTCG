import { createContext, useEffect, useState } from "react";
import { api } from "../api";
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load session from backend
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await api.get("/auth/me", { withCredentials: true });
        if (res.data?.loggedIn) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth load error:", err);
        setUser(null);
      }
      setLoading(false);
    }

    loadSession();
  }, []);

  const value = { user, loading, setUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

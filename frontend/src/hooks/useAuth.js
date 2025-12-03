// src/hooks/useAuth.js
import { useState, useEffect } from "react";
import { api } from "@/api";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current session user
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get("/auth/me", { withCredentials: true });
        if (res.data?.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        setUser(null);
      }
      setLoading(false);
    }

    fetchUser();
  }, []);

  // 👇 LOGIN FUNCTION GOES HERE
  const login = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/login`;
  };

  const logout = async () => {
    await api.post("/auth/logout", {}, { withCredentials: true });
    setUser(null);
  };

  return { user, loading, login, logout };
}

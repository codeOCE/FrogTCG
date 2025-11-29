import { useEffect, useState } from "react";
import { api } from "./api";

export function useUser() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/auth/me").then(res => {
      if (res.data.loggedIn) {
        setUser(res.data.user);
      }
      setLoading(false);
    });
  }, []);

  return { user, loading };
}

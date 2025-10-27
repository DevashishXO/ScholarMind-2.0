import { useEffect, useState } from "react";

export function useAuth() {
  const [auth, setAuth] = useState<{
    loading: boolean;
    data?: any;
  }>({ loading: true });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/me`, {
      credentials: "include", // send cookies!
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setAuth({ loading: false, data }))
      .catch(() => setAuth({ loading: false, data: null }));
  }, []);

  return auth;
}

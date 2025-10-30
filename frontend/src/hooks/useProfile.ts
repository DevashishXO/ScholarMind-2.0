import { useEffect, useState } from "react";

export function useProfile() {
  const [profile, setProfile] = useState<{
    loading: boolean;
    data?: any;
  }>({ loading: true });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/profile/me`, {
      credentials: "include", // send cookies!
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setProfile({ loading: false, data }))
      .catch(() => setProfile({ loading: false, data: null }));
  }, []);
  
  console.log(profile)

  return profile;
}

import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  completed?: boolean;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve user from sessionStorage or local state
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    setLoading(false);
  }, []);

  return { user, loading };
}

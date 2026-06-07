import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role?: string;
}

interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          setIsAuthenticated(false);
          return;
        }

        // Verify token by fetching user profile
        const response = await axios.get("/student/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.data?.user) {
          const userData: AuthUser = {
            id: response.data.data.user.user_id,
            email: response.data.data.user.email,
            name: response.data.data.user.full_name,
            phone: response.data.data.user.phone,
            role: response.data.data.user.role,
          };
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    router.push("/auth/login");
  };

  return { user, loading, isAuthenticated, logout };
}
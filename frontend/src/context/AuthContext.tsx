"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "@/lib/axios";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const fetchUserProfile = async (token: string): Promise<AuthUser | null> => {
  try {
    const response = await axios.get("/student/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data?.data?.user) {
      const u = response.data.data.user;
      return {
        id: u.user_id,
        email: u.email,
        name: u.full_name,
        phone: u.phone,
        role: u.role,
      };
    }
    return null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      const userData = await fetchUserProfile(token);
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("token");
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (token: string): Promise<boolean> => {
    setLoading(true);
    localStorage.setItem("token", token);
    const userData = await fetchUserProfile(token);
    if (userData) {
      setUser(userData);
      setIsAuthenticated(true);
      setLoading(false);
      return true;
    }
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setLoading(false);
    return false;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside <AuthProvider>");
  return ctx;
}
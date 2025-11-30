import { useState } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "../api-config";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth-b2e/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Registration failed");
      toast.success("Account created!");
      return result;
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      const res = await fetch(`${API_BASE_URL}/api/auth-b2e/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Login failed");
      toast.success("Logged in successfully!");
      return result;
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch(`${API_BASE_URL}/api/auth-b2e/logout`, {
        method: "POST",
        credentials: "include",
      });
      
      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      toast.success("Logged out successfully");
      
      return true;
    } catch (err: any) {
      toast.error("Logout failed");
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { register, login, logout, isLoading, error };
}
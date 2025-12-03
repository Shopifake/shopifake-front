import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "../api-config";
import { clearSessionId, getSessionId } from "../orders/session";

export interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  telephone?: string;
  address?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  telephone?: string;
  address?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  telephone?: string;
  address?: string;
}

const extractErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    if (data?.error) {
      return data.error as string;
    }
  } catch {
    // ignore JSON parse errors
  }
  return response.statusText || "An error occurred";
};

/**
 * Hook to manage user authentication state
 * Handles login, register, logout, and profile management
 * Also manages cart migration from sessionId to userId
 */
export function useAuth() {
  const [user, setUser] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Check if user is authenticated on mount
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth-b2c/me`, {
        method: "GET",
        credentials: "include", // Include cookies
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.customer);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Login user and migrate guest cart if exists
   */
  const login = useCallback(async (credentials: LoginRequest, siteId?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const guestSessionId = getSessionId();

      const response = await fetch(`${API_BASE_URL}/api/auth-b2c/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      const data = await response.json();
      setUser(data.customer);

      // Migrate guest cart to user cart if sessionId exists and siteId provided
      if (guestSessionId && siteId && data.customer?.id) {
        await migrateGuestCart(guestSessionId, data.customer.id, siteId);
      }

      // Clear guest session after migration
      clearSessionId();

      toast.success("Logged in successfully!");
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to login");
      setError(error);
      toast.error(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register new user and migrate guest cart if exists
   */
  const register = useCallback(async (data: RegisterRequest, siteId?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const guestSessionId = getSessionId();

      const response = await fetch(`${API_BASE_URL}/api/auth-b2c/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      const responseData = await response.json();
      setUser(responseData.customer);

      // Migrate guest cart to user cart if sessionId exists and siteId provided
      if (guestSessionId && siteId && responseData.customer?.id) {
        await migrateGuestCart(guestSessionId, responseData.customer.id, siteId);
      }

      // Clear guest session after migration
      clearSessionId();

      toast.success("Account created successfully!");
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to register");
      setError(error);
      toast.error(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout user and clear session
   */
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await fetch(`${API_BASE_URL}/api/auth-b2c/logout`, {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      clearSessionId();
      toast.success("Logged out successfully!");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to logout");
      setError(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (data: UpdateProfileRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth-b2c/customers/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      const responseData = await response.json();
      setUser(responseData);

      toast.success("Profile updated successfully!");
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to update profile");
      setError(error);
      toast.error(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete user account
   */
  const deleteAccount = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth-b2c/customers/me`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      setUser(null);
      clearSessionId();
      toast.success("Account deleted successfully!");
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to delete account");
      setError(error);
      toast.error(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    deleteAccount,
    refetch: checkAuth,
  };
}

/**
 * Helper function to migrate guest cart to authenticated user
 * This should be called by the orders service
 */
async function migrateGuestCart(sessionId: string, userId: string, siteId: string): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/orders/carts/migrate?siteId=${encodeURIComponent(siteId)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": sessionId,
          "X-User-Id": userId,
        },
        body: JSON.stringify({ sessionId, userId }),
      }
    );

    if (!response.ok) {
      console.error("Failed to migrate cart:", await extractErrorMessage(response));
    }
  } catch (err) {
    console.error("Failed to migrate cart:", err);
  }
}

/**
 * Hook to check if user can proceed to checkout
 * Users must be authenticated to complete payment
 */
export function useCheckoutValidation() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const canCheckout = useCallback(() => {
    if (isLoading) {
      return { allowed: false, reason: "Loading..." };
    }

    if (!isAuthenticated || !user) {
      return {
        allowed: false,
        reason: "Please login or create an account to complete your purchase",
      };
    }

    return { allowed: true, reason: null };
  }, [isAuthenticated, user, isLoading]);

  return { canCheckout, isAuthenticated, user };
}
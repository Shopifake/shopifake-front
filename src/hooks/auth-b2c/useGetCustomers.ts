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
      const url = `${API_BASE_URL}/api/auth-b2c/customers/me`;
      const frontendOrigin = window.location.origin;
      const backendOrigin = API_BASE_URL.replace(/\/$/, '');
      
      console.log("[checkAuth] Vérification de l'authentification...");
      console.log("[checkAuth] Frontend:", frontendOrigin);
      console.log("[checkAuth] Backend:", backendOrigin);
      console.log("[checkAuth] URL:", url);
      
      const response = await fetch(url, {
        method: "GET",
        credentials: "include", // Important: inclut les cookies dans la requête
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("[checkAuth] Status:", response.status);
      
      // Vérifier si les cookies sont visibles (pour débogage)
      // Note: HttpOnly cookies ne seront pas visibles
      const allCookies = document.cookie;
      console.log("[checkAuth] Cookies visibles dans document.cookie:", allCookies || "(aucun)");
      
      // Vérifier les headers de la requête (ne peut pas être fait côté client, mais on peut vérifier la réponse)
      const setCookieHeader = response.headers.get("Set-Cookie");
      if (setCookieHeader) {
        console.log("[checkAuth] Set-Cookie header reçu:", setCookieHeader);
      }

      if (response.ok) {
        const data = await response.json();
        console.log("[checkAuth] ✅ Réponse complète:", data);
        
        // L'API peut retourner soit { customer: {...} } soit directement le customer
        const customer = data.customer || data;
        console.log("[checkAuth] ✅ Customer extrait:", customer);
        console.log("[checkAuth] ✅ Email:", customer?.email);
        
        if (customer && customer.id) {
          setUser(customer);
        } else {
          console.error("[checkAuth] ⚠️ Structure de réponse inattendue, pas de customer valide");
          setUser(null);
        }
      } else {
        // Log pour déboguer en cas d'erreur
        const errorText = await response.text();
        
        console.error("[checkAuth] ❌ Erreur d'authentification:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          frontendOrigin,
          backendOrigin,
          domainesDifferents: frontendOrigin !== backendOrigin,
        });
        
        // Message d'erreur spécifique pour le problème SameSite=Strict
        if (errorText.includes('No token provided') || response.status === 401) {
          console.error("[checkAuth] 🔴 Le cookie n'est probablement pas envoyé au backend");
          if (frontendOrigin !== backendOrigin) {
            console.error("[checkAuth] 🔴 CAUSE PROBABLE: Cookie avec SameSite=Strict empêche l'envoi cross-domain");
            console.error("[checkAuth] SOLUTION: Le backend doit utiliser SameSite=Lax ou SameSite=None (avec Secure)");
            console.error("[checkAuth] 💡 Pour vérifier: Ouvrez l'onglet Network des DevTools et regardez si le header 'Cookie' est présent dans la requête");
          } else {
            console.error("[checkAuth] 💡 Vérifiez que le cookie est bien défini et n'a pas expiré");
          }
        }
        
        setUser(null);
      }
    } catch (err) {
      console.error("[checkAuth] Erreur lors de la vérification d'authentification:", err);
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

      const url = `${API_BASE_URL}/api/auth-b2c/login`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important: permet de recevoir les cookies Set-Cookie
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      const data = await response.json();
      
      // Vérifier si le cookie a SameSite=Strict avec des domaines différents (seulement en cas d'erreur)
      const setCookieHeaders = response.headers.get("Set-Cookie");
      if (setCookieHeaders) {
        const hasSameSiteStrict = setCookieHeaders.includes('SameSite=Strict');
        const frontendOrigin = window.location.origin;
        const backendOrigin = API_BASE_URL.replace(/\/$/, '');
        
        if (hasSameSiteStrict && frontendOrigin !== backendOrigin) {
          console.warn("[login] ⚠️ Cookie avec SameSite=Strict détecté sur des domaines différents");
          console.warn("[login] SOLUTION: Le backend doit utiliser SameSite=Lax ou SameSite=None (avec Secure)");
        }
      }
      
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
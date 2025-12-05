import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "../api-config";
import { getSessionId, setSessionId } from "./session";
import { useAuth } from "../auth-b2c/useGetCustomers";

export interface CartItemResponse {
  id: string;
  productId: string;
  quantity: number;
}

export interface CartResponse {
  id: string;
  userId?: string;
  sessionId?: string;
  siteId: string;
  items: CartItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

const extractErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    if (data?.message) {
      return data.message as string;
    }
  } catch {
    // ignore JSON parse errors
  }
  return response.statusText || "An error occurred";
};

/**
 * Build headers for cart requests
 * - For authenticated users: Include X-User-Id header (backend can also read from JWT cookie)
 * - For guest users: Include X-Session-Id header
 */
const buildHeaders = (isAuthenticated: boolean, userId?: string): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (isAuthenticated && userId) {
    // Send userId header for authenticated users
    headers["X-User-Id"] = userId;
  } else if (!isAuthenticated) {
    // Only send sessionId header if user is NOT authenticated
    const sessionId = getSessionId();
    if (sessionId) {
      headers["X-Session-Id"] = sessionId;
    }
  }

  return headers;
};

const updateSessionIdFromResponse = (response: Response): void => {
  // Try to extract sessionId from response headers or body
  const sessionIdHeader = response.headers.get("X-Session-Id");
  if (sessionIdHeader) {
    setSessionId(sessionIdHeader);
  }
};

export function useGetCart(siteId?: string) {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCart = useCallback(async () => {
    if (!siteId) {
      setCart(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/carts?siteId=${encodeURIComponent(siteId)}`, {
        method: "GET",
        headers: buildHeaders(isAuthenticated, user?.id),
        credentials: "include", // Important: Send cookies
      });

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      const data = (await response.json()) as CartResponse;
      
      // Update sessionId if provided in response (only for guests)
      if (!isAuthenticated && data.sessionId) {
        setSessionId(data.sessionId);
      }
      updateSessionIdFromResponse(response);

      setCart(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch cart");
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [siteId, isAuthenticated, user?.id]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return { cart, isLoading, error, refetch: fetchCart };
}

export function useAddToCart() {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addToCart = useCallback(
    async (siteId: string, payload: AddToCartRequest): Promise<CartResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/orders/carts/items?siteId=${encodeURIComponent(siteId)}`,
          {
            method: "POST",
            headers: buildHeaders(isAuthenticated, user?.id),
            credentials: "include",
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const message = await extractErrorMessage(response);
          throw new Error(message);
        }

        const data = (await response.json()) as CartResponse;

        // Update sessionId if provided in response (for new guest sessions)
        if (!isAuthenticated && data.sessionId) {
          setSessionId(data.sessionId);
        }
        updateSessionIdFromResponse(response);

        toast.success("Added to cart!");
        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to add item to cart");
        setError(error);
        toast.error(error.message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, user?.id]
  );

  return { addToCart, isLoading, error };
}

export function useUpdateCartItem() {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateCartItem = useCallback(
    async (siteId: string, itemId: string, payload: UpdateCartItemRequest): Promise<CartResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/orders/carts/items/${itemId}?siteId=${encodeURIComponent(siteId)}`,
          {
            method: "PATCH",
            headers: buildHeaders(isAuthenticated, user?.id),
            credentials: "include",
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const message = await extractErrorMessage(response);
          throw new Error(message);
        }

        const data = (await response.json()) as CartResponse;
        updateSessionIdFromResponse(response);

        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to update cart item");
        setError(error);
        toast.error(error.message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, user?.id]
  );

  return { updateCartItem, isLoading, error };
}

export function useRemoveCartItem() {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const removeCartItem = useCallback(
    async (siteId: string, itemId: string): Promise<CartResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/orders/carts/items/${itemId}?siteId=${encodeURIComponent(siteId)}`,
          {
            method: "DELETE",
            headers: buildHeaders(isAuthenticated, user?.id),
            credentials: "include",
          }
        );

        if (!response.ok) {
          const message = await extractErrorMessage(response);
          throw new Error(message);
        }

        const data = (await response.json()) as CartResponse;
        updateSessionIdFromResponse(response);

        toast.success("Removed from cart");
        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to remove cart item");
        setError(error);
        toast.error(error.message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, user?.id]
  );

  return { removeCartItem, isLoading, error };
}

export function useClearCart() {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const clearCart = useCallback(
    async (siteId: string): Promise<CartResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/orders/carts?siteId=${encodeURIComponent(siteId)}`,
          {
            method: "DELETE",
            headers: buildHeaders(isAuthenticated, user?.id),
            credentials: "include",
          }
        );

        if (!response.ok) {
          const message = await extractErrorMessage(response);
          throw new Error(message);
        }

        const data = (await response.json()) as CartResponse;
        updateSessionIdFromResponse(response);

        toast.success("Cart cleared");
        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to clear cart");
        setError(error);
        toast.error(error.message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, user?.id]
  );

  return { clearCart, isLoading, error };
}
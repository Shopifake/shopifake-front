import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "../api-config";
import { getSessionId, setSessionId, clearSessionId } from "./session";

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

const buildHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // For authenticated users, you would add X-User-Id header here
  // const userId = getUserId();
  // if (userId) {
  //   headers["X-User-Id"] = userId;
  // }

  // For guest users, include sessionId if available
  const sessionId = getSessionId();
  if (sessionId) {
    headers["X-Session-Id"] = sessionId;
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
        headers: buildHeaders(),
      });

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      const data = (await response.json()) as CartResponse;
      
      // Update sessionId if provided in response
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }
      updateSessionIdFromResponse(response);

      setCart(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch cart");
      setError(error);
      // Don't show toast for initial load errors
    } finally {
      setIsLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return { cart, isLoading, error, refetch: fetchCart };
}

export function useAddToCart() {
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
            headers: buildHeaders(),
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const message = await extractErrorMessage(response);
          throw new Error(message);
        }

        const data = (await response.json()) as CartResponse;

        // Update sessionId if provided in response (for new guest sessions)
        if (data.sessionId) {
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
    []
  );

  return { addToCart, isLoading, error };
}

export function useUpdateCartItem() {
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
            headers: buildHeaders(),
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
    []
  );

  return { updateCartItem, isLoading, error };
}

export function useRemoveCartItem() {
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
            headers: buildHeaders(),
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
    []
  );

  return { removeCartItem, isLoading, error };
}

export function useClearCart() {
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
            headers: buildHeaders(),
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
    []
  );

  return { clearCart, isLoading, error };
}


import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  CreatePriceRequest,
  PriceResponse,
  UpdatePriceRequest,
} from "../../types/api/pricingApiTypes";
import { API_BASE_URL } from "../api-config";

const extractErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    if (data?.message) {
      return data.message as string;
    }
  } catch {
    // ignore
  }
  return response.statusText || "Une erreur est survenue";
};

export function useCreatePrice() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createPrice = async (payload: CreatePriceRequest): Promise<PriceResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/prices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      const price = (await response.json()) as PriceResponse;
      return price;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Impossible de créer le prix");
      setError(error);
      toast.error(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createPrice, isLoading, error };
}

export function useUpdatePrice() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updatePrice = async (priceId: string, payload: UpdatePriceRequest): Promise<PriceResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/prices/${priceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      const price = (await response.json()) as PriceResponse;
      return price;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Impossible de mettre à jour le prix");
      setError(error);
      toast.error(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { updatePrice, isLoading, error };
}

export function useGetProductPrices(productId?: string) {
  const [prices, setPrices] = useState<PriceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrices = useCallback(async () => {
    if (!productId) {
      setPrices([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/prices/product/${productId}`);

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      const data = (await response.json()) as PriceResponse[];
      setPrices(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Impossible de récupérer les prix");
      setError(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  return { prices, isLoading, error, refetch: fetchPrices };
}

export function useGetActivePrice(productId?: string) {
  const [price, setPrice] = useState<PriceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrice = useCallback(async () => {
    if (!productId) {
      setPrice(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/prices/product/${productId}/active`);

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      const data = (await response.json()) as PriceResponse;
      setPrice(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Impossible de récupérer le prix actif");
      setError(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  return { price, isLoading, error, refetch: fetchPrice };
}


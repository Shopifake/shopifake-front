import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  AdjustInventoryRequest,
  CreateInventoryRequest,
  InventoryResponse,
  InventoryStatus,
} from "../../types/api/inventoryApiTypes";
import { API_BASE_URL } from "../api-config";

const buildQueryString = (params: Record<string, string | undefined>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.append(key, value);
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
};

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

export function useCreateInventory() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createInventory = async (payload: CreateInventoryRequest): Promise<InventoryResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory`, {
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

      const inventory = (await response.json()) as InventoryResponse;
      return inventory;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Impossible de créer l'inventaire");
      setError(error);
      toast.error(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createInventory, isLoading, error };
}

export function useGetInventoryByProduct(productId?: string) {
  const [inventory, setInventory] = useState<InventoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchInventory = useCallback(async () => {
    if (!productId) {
      setInventory(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory/${productId}`);

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      const data = (await response.json()) as InventoryResponse;
      setInventory(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Impossible de récupérer l'inventaire");
      setError(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return { inventory, isLoading, error, refetch: fetchInventory };
}

export function useListInventory(params: { status?: InventoryStatus } = {}) {
  const [inventory, setInventory] = useState<InventoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const status = params.status;

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const query = buildQueryString({ status });
      const response = await fetch(`${API_BASE_URL}/api/inventory${query}`);

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      const data = (await response.json()) as InventoryResponse[];
      setInventory(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Impossible de lister l'inventaire");
      setError(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return { inventory, isLoading, error, refetch: fetchInventory };
}

export function useAdjustInventory() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const adjustInventory = async (
    productId: string,
    payload: AdjustInventoryRequest,
  ): Promise<InventoryResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory/${productId}/adjust`, {
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

      const data = (await response.json()) as InventoryResponse;
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Impossible d'ajuster l'inventaire");
      setError(error);
      toast.error(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { adjustInventory, isLoading, error };
}

export function useDeleteInventory() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteInventory = async (productId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Impossible de supprimer l'inventaire");
      setError(error);
      toast.error(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteInventory, isLoading, error };
}


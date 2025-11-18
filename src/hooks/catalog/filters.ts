import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { CreateFilterRequest, FilterResponse } from "../../types/api/catalogApiTypes";
import { API_BASE_URL } from "../api-config";

const extractErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    if (data?.message) {
      return data.message as string;
    }
  } catch {
    // ignore JSON parsing errors
  }
  return response.statusText || "Une erreur est survenue";
};

export function useListFilters(siteId?: string) {
  const [filters, setFilters] = useState<FilterResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchFilters = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const query = siteId ? `?siteId=${encodeURIComponent(siteId)}` : "";
      const response = await fetch(`${API_BASE_URL}/api/catalog/filters${query}`);

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      const data = (await response.json()) as FilterResponse[];
      setFilters(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Impossible de récupérer les filtres");
      setError(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  return { filters, isLoading, error, refetch: fetchFilters };
}

export function useCreateFilter() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createFilter = async (payload: CreateFilterRequest): Promise<FilterResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/catalog/filters`, {
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

      const filter = (await response.json()) as FilterResponse;
      return filter;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Impossible de créer le filtre");
      setError(error);
      toast.error(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createFilter, isLoading, error };
}


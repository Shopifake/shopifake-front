import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { CurrenciesResponse } from "../../types/api/sitesApiTypes";
import { API_BASE_URL } from "../api-config";

export function useGetCurrencies() {
  const [currencies, setCurrencies] = useState<CurrenciesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCurrencies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/sites/currencies`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch currencies: ${response.statusText}`);
        }

        const data: CurrenciesResponse = await response.json();
        setCurrencies(data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to fetch currencies");
        setError(error);
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  return { currencies, isLoading, error };
}


import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { LanguagesResponse } from "../../types/api/sitesApiTypes";
import { API_BASE_URL } from "../api-config";

export function useGetLanguages() {
  const [languages, setLanguages] = useState<LanguagesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/sites/languages`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch languages: ${response.statusText}`);
        }

        const data: LanguagesResponse = await response.json();
        setLanguages(data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to fetch languages");
        setError(error);
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  return { languages, isLoading, error };
}


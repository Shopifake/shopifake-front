import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { SiteResponse } from "../../types/api/sitesApiTypes";
import { API_BASE_URL, DEFAULT_OWNER_ID } from "../api-config";

export function useGetSitesByOwner(ownerId: number = DEFAULT_OWNER_ID) {
  const [sites, setSites] = useState<SiteResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSites = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/sites?ownerId=${ownerId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch sites: ${response.statusText}`);
        }

        const data: SiteResponse[] = await response.json();
        setSites(data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to fetch sites");
        setError(error);
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSites();
  }, [ownerId]);

  const refetch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/sites?ownerId=${ownerId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch sites: ${response.statusText}`);
      }

      const data: SiteResponse[] = await response.json();
      setSites(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch sites");
      setError(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { sites, isLoading, error, refetch };
}


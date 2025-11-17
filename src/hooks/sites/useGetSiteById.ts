import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { SiteResponse } from "../../types/api/sitesApiTypes";
import { API_BASE_URL } from "../api-config";

export function useGetSiteById(siteId: string) {
  const [site, setSite] = useState<SiteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSite = async () => {
      if (!siteId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/sites/${siteId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setSite(null);
            setIsLoading(false);
            return;
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch site: ${response.statusText}`);
        }

        const data: SiteResponse = await response.json();
        setSite(data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to fetch site");
        setError(error);
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSite();
  }, [siteId]);

  const refetch = async () => {
    if (!siteId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/sites/${siteId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setSite(null);
          setIsLoading(false);
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch site: ${response.statusText}`);
      }

      const data: SiteResponse = await response.json();
      setSite(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch site");
      setError(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { site, isLoading, error, refetch };
}


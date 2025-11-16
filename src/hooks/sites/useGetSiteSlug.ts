import { useState } from "react";
import { toast } from "sonner";
import type { SiteSlugResponse } from "../../types/api/sitesApiTypes";
import { API_BASE_URL } from "../api-config";

export function useGetSiteSlug() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getSiteSlug = async (siteId: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/sites/${siteId}/slug`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Site not found");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch site slug: ${response.statusText}`);
      }

      const data: SiteSlugResponse = await response.json();
      return data.slug;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch site slug");
      setError(error);
      toast.error(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { getSiteSlug, isLoading, error };
}


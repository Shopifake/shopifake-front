import { useState } from "react";
import { toast } from "sonner";
import type { UpdateSiteRequest, SiteResponse } from "../../types/api/sitesApiTypes";
import { API_BASE_URL } from "../api-config";

export function useUpdateSite() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateSite = async (siteId: string, data: UpdateSiteRequest): Promise<SiteResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/sites/${siteId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update site: ${response.statusText}`);
      }

      const site: SiteResponse = await response.json();
      toast.success("Site updated successfully");
      return site;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to update site");
      setError(error);
      toast.error(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateSite, isLoading, error };
}


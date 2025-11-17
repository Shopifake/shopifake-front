import { useState } from "react";
import { toast } from "sonner";
import type { UpdateSiteStatusRequest, SiteResponse } from "../../types/api/sitesApiTypes";
import { API_BASE_URL } from "../api-config";

export function useUpdateSiteStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateSiteStatus = async (siteId: string, status: UpdateSiteStatusRequest["status"]): Promise<SiteResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/sites/${siteId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update site status: ${response.statusText}`);
      }

      const site: SiteResponse = await response.json();
      toast.success(`Site status updated to ${status}`);
      return site;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to update site status");
      setError(error);
      toast.error(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateSiteStatus, isLoading, error };
}


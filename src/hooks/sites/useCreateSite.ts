import { useState } from "react";
import { toast } from "sonner";
import type { CreateSiteRequest, SiteResponse } from "../../types/api/sitesApiTypes";
import { API_BASE_URL, DEFAULT_OWNER_ID } from "../api-config";

export function useCreateSite() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createSite = async (data: CreateSiteRequest): Promise<SiteResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/sites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Owner-Id": String(DEFAULT_OWNER_ID),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create site: ${response.statusText}`);
      }

      const site: SiteResponse = await response.json();
      return site;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create site");
      setError(error);
      toast.error(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createSite, isLoading, error };
}


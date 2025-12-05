import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { SiteWithRole, SiteResponse } from "../../types/api/sitesApiTypes";
import { API_BASE_URL } from "../api-config";
import { authFetch } from "../../utils/authFetch";

export function useGetSiteById(siteId: string) {
  const [site, setSite] = useState<SiteWithRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSiteWithRole = async () => {
    if (!siteId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const managedRes = await authFetch(
        `${API_BASE_URL}/api/auth-b2e/users/me/sites`
      );

      if (!managedRes.ok) {
        throw new Error("Failed to fetch user sites");
      }

      const managedSites = await managedRes.json();
      const userSite = managedSites.find((s: any) => s.siteId === siteId);

      const siteRes = await authFetch(`${API_BASE_URL}/api/sites/${siteId}`);

      if (!siteRes.ok) {
        if (siteRes.status === 404) {
          setSite(null);
          setIsLoading(false);
          return;
        }
        const errorData = await siteRes.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch site: ${siteRes.statusText}`);
      }

      const siteData: SiteResponse = await siteRes.json();
      
      setSite({
        ...siteData,
        role: userSite?.role || ""
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch site");
      setError(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteWithRole();
  }, [siteId]);

  const refetch = async () => {
    await fetchSiteWithRole();
  };

  return { site, isLoading, error, refetch };
}
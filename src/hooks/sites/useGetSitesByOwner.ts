// src/hooks/sites/useGetSitesByOwner.ts

import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { SiteResponse, SiteWithRole, UserSiteRole } from "../../types/api/sitesApiTypes";
import { API_BASE_URL } from "../api-config";
import { authFetch } from "../../utils/authFetch";
import { useAuthContext } from "../../contexts/AuthContext";

export function useGetSitesByOwner() {
  const { user } = useAuthContext();
  const [sites, setSites] = useState<SiteWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchSites = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const managedRes = await authFetch(
          `${API_BASE_URL}/api/auth-b2e/users/me/sites`
        );
        
        if (!managedRes.ok) {
          const errorData = await managedRes.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch managed sites");
        }
        
        const managedSites: { siteId: string, role: UserSiteRole }[] = await managedRes.json();
        
        const siteDetailsPromises = managedSites.map(async (managed) => {
          const siteRes = await authFetch(
            `${API_BASE_URL}/api/sites/${managed.siteId}`
          );
          
          if (!siteRes.ok) {
            console.error(`Failed to fetch site ${managed.siteId}`);
            return null;
          }
          
          const siteData: SiteResponse = await siteRes.json();
          return { ...siteData, role: managed.role };
        });

        const sitesWithDetails = await Promise.all(siteDetailsPromises);
        
        const validSites = sitesWithDetails.filter(
          (site): site is SiteWithRole => site !== null
        );
        
        setSites(validSites);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to fetch sites");
        setError(error);
        toast.error(error.message);
        setSites([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSites();
  }, [user]);

  return { sites, isLoading, error };
}
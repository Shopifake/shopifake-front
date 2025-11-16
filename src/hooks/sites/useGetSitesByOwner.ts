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

        // Check if response is JSON before parsing
        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");

        if (!response.ok) {
          let errorMessage = `Failed to fetch sites: ${response.statusText}`;
          if (isJson) {
            try {
              const errorData = await response.json();
              errorMessage = errorData.message || errorMessage;
            } catch {
              // If JSON parsing fails, use default message
            }
          } else {
            // If response is HTML (error page), provide a more helpful message
            errorMessage = `Server returned an error page. Please check if the API is running at ${API_BASE_URL}`;
          }
          throw new Error(errorMessage);
        }

        if (!isJson) {
          throw new Error(`Expected JSON response but received ${contentType || "unknown content type"}`);
        }

        const data: SiteResponse[] = await response.json();
        
        // TODO: remove after test - Ajouter un site de test pour tester la redirection
        const testSite: SiteResponse = {
          id: "test-site-123",
          name: "Site de Test",
          slug: "test-site",
          description: "Site de test pour vérifier la redirection",
          currency: "EUR",
          language: "FR",
          status: "ACTIVE",
          ownerId: ownerId,
          config: JSON.stringify({
            bannerUrl: "",
            name: "Site de Test",
            title: "Bienvenue sur mon site de test",
            subtitle: "Test de redirection",
            heroDescription: "Ceci est un site de test",
            logoUrl: "",
            aboutPortraitOneUrl: "",
            aboutLandscapeUrl: "",
            aboutPortraitTwoUrl: "",
            history: "",
            values: [],
            contactHeading: "Contact",
            contactDescription: "Contactez-nous",
            contactDetails: "",
            primaryColor: "#3B82F6",
            secondaryColor: "#22C55E"
          }),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setSites([testSite, ...data]);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to fetch sites");
        setError(error);
        toast.error(error.message);
        
        // TODO: remove after test - Ajouter un site de test même en cas d'erreur pour permettre les tests
        const testSite: SiteResponse = {
          id: "test-site-123",
          name: "Site de Test",
          slug: "test-site",
          description: "Site de test pour vérifier la redirection",
          currency: "EUR",
          language: "FR",
          status: "ACTIVE",
          ownerId: ownerId,
          config: JSON.stringify({
            bannerUrl: "",
            name: "Site de Test",
            title: "Bienvenue sur mon site de test",
            subtitle: "Test de redirection",
            heroDescription: "Ceci est un site de test",
            logoUrl: "",
            aboutPortraitOneUrl: "",
            aboutLandscapeUrl: "",
            aboutPortraitTwoUrl: "",
            history: "",
            values: [],
            contactHeading: "Contact",
            contactDescription: "Contactez-nous",
            contactDetails: "",
            primaryColor: "#3B82F6",
            secondaryColor: "#22C55E"
          }),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setSites([testSite]);
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

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      if (!response.ok) {
        let errorMessage = `Failed to fetch sites: ${response.statusText}`;
        if (isJson) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            // If JSON parsing fails, use default message
          }
        } else {
          // If response is HTML (error page), provide a more helpful message
          errorMessage = `Server returned an error page. Please check if the API is running at ${API_BASE_URL}`;
        }
        throw new Error(errorMessage);
      }

      if (!isJson) {
        throw new Error(`Expected JSON response but received ${contentType || "unknown content type"}`);
      }

      const data: SiteResponse[] = await response.json();
      
      // TODO: remove after test - Ajouter un site de test pour tester la redirection
      const testSite: SiteResponse = {
        id: "test-site-123",
        name: "Site de Test",
        slug: "test-site",
        description: "Site de test pour vérifier la redirection",
        currency: "EUR",
        language: "FR",
        status: "ACTIVE",
        ownerId: ownerId,
        config: JSON.stringify({
          bannerUrl: "",
          name: "Site de Test",
          title: "Bienvenue sur mon site de test",
          subtitle: "Test de redirection",
          heroDescription: "Ceci est un site de test",
          logoUrl: "",
          aboutPortraitOneUrl: "",
          aboutLandscapeUrl: "",
          aboutPortraitTwoUrl: "",
          history: "",
          values: [],
          contactHeading: "Contact",
          contactDescription: "Contactez-nous",
          contactDetails: "",
          primaryColor: "#3B82F6",
          secondaryColor: "#22C55E"
        }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setSites([testSite, ...data]);
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


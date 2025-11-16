import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { SiteResponse } from "../../types/api/sitesApiTypes";
import { API_BASE_URL } from "../api-config";

export function useGetSiteBySlug(slug: string | null) {
  const [site, setSite] = useState<SiteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSite = async () => {
      if (!slug) {
        setSite(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Assuming the API endpoint is /api/sites/slug/{slug}
        const response = await fetch(`${API_BASE_URL}/api/sites/slug/${slug}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Check if response is JSON before parsing
        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");

        if (!response.ok) {
          if (response.status === 404) {
            // TODO: remove after test - Return mock data for test-site
            if (slug === "test-site") {
              const mockSite: SiteResponse = {
                id: "test-site-123",
                name: "Site de Test",
                slug: "test-site",
                description: "Site de test pour vérifier la redirection",
                currency: "EUR",
                language: "FR",
                status: "ACTIVE",
                ownerId: 1,
                config: JSON.stringify({
                  bannerUrl: "",
                  name: "Site de Test",
                  title: "Bienvenue sur mon site de test",
                  subtitle: "Test de redirection",
                  heroDescription: "Ceci est un site de test pour vérifier que la redirection fonctionne correctement",
                  logoUrl: "",
                  aboutPortraitOneUrl: "",
                  aboutLandscapeUrl: "",
                  aboutPortraitTwoUrl: "",
                  history: "Ce site a été créé pour tester le système de sous-domaines",
                  values: ["Qualité", "Test", "Développement"],
                  contactHeading: "Contactez-nous",
                  contactDescription: "Pour toute question concernant ce site de test",
                  contactDetails: "Email: test@example.com",
                  primaryColor: "#3B82F6",
                  secondaryColor: "#22C55E"
                }),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              setSite(mockSite);
              setIsLoading(false);
              return;
            }
            setSite(null);
            setIsLoading(false);
            return;
          }
          let errorMessage = `Failed to fetch site: ${response.statusText}`;
          if (isJson) {
            try {
              const errorData = await response.json();
              errorMessage = errorData.message || errorMessage;
            } catch {
              // If JSON parsing fails, use default message
            }
          }
          throw new Error(errorMessage);
        }

        if (!isJson) {
          throw new Error(`Expected JSON response but received ${contentType || "unknown content type"}`);
        }

        const data: SiteResponse = await response.json();
        setSite(data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to fetch site");
        setError(error);
        
        // TODO: remove after test - Return mock data for test-site on error
        if (slug === "test-site") {
          const mockSite: SiteResponse = {
            id: "test-site-123",
            name: "Site de Test",
            slug: "test-site",
            description: "Site de test pour vérifier la redirection",
            currency: "EUR",
            language: "FR",
            status: "ACTIVE",
            ownerId: 1,
            config: JSON.stringify({
              bannerUrl: "",
              name: "Site de Test",
              title: "Bienvenue sur mon site de test",
              subtitle: "Test de redirection",
              heroDescription: "Ceci est un site de test pour vérifier que la redirection fonctionne correctement",
              logoUrl: "",
              aboutPortraitOneUrl: "",
              aboutLandscapeUrl: "",
              aboutPortraitTwoUrl: "",
              history: "Ce site a été créé pour tester le système de sous-domaines",
              values: ["Qualité", "Test", "Développement"],
              contactHeading: "Contactez-nous",
              contactDescription: "Pour toute question concernant ce site de test",
              contactDetails: "Email: test@example.com",
              primaryColor: "#3B82F6",
              secondaryColor: "#22C55E"
            }),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setSite(mockSite);
          setError(null);
        } else {
          // Don't show toast for 404 errors (site not found)
          if (error.message !== "Site not found") {
            toast.error(error.message);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSite();
  }, [slug]);

  const refetch = async () => {
    if (!slug) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/sites/slug/${slug}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      if (!response.ok) {
        if (response.status === 404) {
          // TODO: remove after test - Return mock data for test-site
          if (slug === "test-site") {
            const mockSite: SiteResponse = {
              id: "test-site-123",
              name: "Site de Test",
              slug: "test-site",
              description: "Site de test pour vérifier la redirection",
              currency: "EUR",
              language: "FR",
              status: "ACTIVE",
              ownerId: 1,
              config: JSON.stringify({
                bannerUrl: "",
                name: "Site de Test",
                title: "Bienvenue sur mon site de test",
                subtitle: "Test de redirection",
                heroDescription: "Ceci est un site de test pour vérifier que la redirection fonctionne correctement",
                logoUrl: "",
                aboutPortraitOneUrl: "",
                aboutLandscapeUrl: "",
                aboutPortraitTwoUrl: "",
                history: "Ce site a été créé pour tester le système de sous-domaines",
                values: ["Qualité", "Test", "Développement"],
                contactHeading: "Contactez-nous",
                contactDescription: "Pour toute question concernant ce site de test",
                contactDetails: "Email: test@example.com",
                primaryColor: "#3B82F6",
                secondaryColor: "#22C55E"
              }),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setSite(mockSite);
            setIsLoading(false);
            return;
          }
          setSite(null);
          setIsLoading(false);
          return;
        }
        let errorMessage = `Failed to fetch site: ${response.statusText}`;
        if (isJson) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            // If JSON parsing fails, use default message
          }
        }
        throw new Error(errorMessage);
      }

      if (!isJson) {
        throw new Error(`Expected JSON response but received ${contentType || "unknown content type"}`);
      }

      const data: SiteResponse = await response.json();
      setSite(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch site");
      setError(error);
      
      // TODO: remove after test - Return mock data for test-site on error
      if (slug === "test-site") {
        const mockSite: SiteResponse = {
          id: "test-site-123",
          name: "Site de Test",
          slug: "test-site",
          description: "Site de test pour vérifier la redirection",
          currency: "EUR",
          language: "FR",
          status: "ACTIVE",
          ownerId: 1,
          config: JSON.stringify({
            bannerUrl: "",
            name: "Site de Test",
            title: "Bienvenue sur mon site de test",
            subtitle: "Test de redirection",
            heroDescription: "Ceci est un site de test pour vérifier que la redirection fonctionne correctement",
            logoUrl: "",
            aboutPortraitOneUrl: "",
            aboutLandscapeUrl: "",
            aboutPortraitTwoUrl: "",
            history: "Ce site a été créé pour tester le système de sous-domaines",
            values: ["Qualité", "Test", "Développement"],
            contactHeading: "Contactez-nous",
            contactDescription: "Pour toute question concernant ce site de test",
            contactDetails: "Email: test@example.com",
            primaryColor: "#3B82F6",
            secondaryColor: "#22C55E"
          }),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setSite(mockSite);
        setError(null);
      } else {
        if (error.message !== "Site not found") {
          toast.error(error.message);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { site, isLoading, error, refetch };
}


import { useState } from "react";
import { toast } from "sonner";
import type { AlternativeSlugSuggestion } from "../../types/api/sitesApiTypes";
import { API_BASE_URL } from "../api-config";

export function useSuggestSlug() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const suggestSlug = async (slug: string): Promise<AlternativeSlugSuggestion | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/sites/suggest-slug?slug=${encodeURIComponent(slug)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to suggest slug: ${response.statusText}`);
      }

      const data: AlternativeSlugSuggestion = await response.json();
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to suggest slug");
      setError(error);
      toast.error(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { suggestSlug, isLoading, error };
}


import { useState } from "react";
import { toast } from "sonner";
import type { SlugAvailabilityResponse } from "../../types/api/sitesApiTypes";
import { API_BASE_URL } from "../api-config";

export function useCheckSlugAvailability() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const checkSlugAvailability = async (slug: string): Promise<boolean | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/sites/check-slug?slug=${encodeURIComponent(slug)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to check slug availability: ${response.statusText}`);
      }

      const data: SlugAvailabilityResponse = await response.json();
      return data.available;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to check slug availability");
      setError(error);
      toast.error(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { checkSlugAvailability, isLoading, error };
}


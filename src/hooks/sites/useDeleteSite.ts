import { useState } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "../api-config";
import { authFetch } from "../../utils/authFetch";

export function useDeleteSite() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteSite = async (siteId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Delete from main API
      const response = await fetch(`${API_BASE_URL}/api/sites/${siteId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) throw new Error("Site not found");
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete site: ${response.statusText}`);
      }

      // 2. Delete from auth-b2e
      const response2 = await authFetch(
        `${API_BASE_URL}/api/auth-b2e/users/me/sites/${siteId}`,
        { method: "DELETE", headers: { "Content-Type": "application/json" } }
      );

      if (!response2.ok) {
        if (response2.status === 404) throw new Error("Site not found in auth-b2e");
        const errorData = await response2.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete site from auth-b2e: ${response2.statusText}`);
      }

      toast.success("Site deleted successfully");
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to delete site");
      setError(error);
      toast.error(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteSite, isLoading, error };
}
import { useState } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "../api-config";
import { authFetch } from "../../utils/authFetch";

export type DeleteManagerParams = {
  siteId: string;
  email: string;
};

export function useDeleteManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteManager = async ({ siteId, email }: DeleteManagerParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authFetch(
        `${API_BASE_URL}/api/auth-b2e/users/me/sites/${siteId}/users`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete manager");
      }
      toast.success("Manager removed successfully");
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to delete manager");
      setError(error);
      toast.error(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteManager, isLoading, error };
}

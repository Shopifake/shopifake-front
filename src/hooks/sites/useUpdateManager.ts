import { useState } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "../api-config";
import { authFetch } from "../../utils/authFetch";

export type UpdateManagerParams = {
  siteId: string;
  email: string;
  role: "Owner" | "CM" | "SM";
};

export function useUpdateManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateManager = async ({ siteId, email, role }: UpdateManagerParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authFetch(
        `${API_BASE_URL}/api/auth-b2e/users/me/sites/${siteId}/users`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, role }),
        }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update manager");
      }
      toast.success("Manager role updated successfully");
      return await res.json();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to update manager");
      setError(error);
      toast.error(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateManager, isLoading, error };
}

import { useEffect, useState } from "react";
import { API_BASE_URL } from "../api-config";
import { authFetch } from "../../utils/authFetch";

export function useGetManagers(siteId: string) {
	const [managers, setManagers] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!siteId) return;
		setIsLoading(true);
		setError(null);
		authFetch(`${API_BASE_URL}/api/auth-b2e/users/me/sites/${siteId}/users`)
			.then(async (res) => {
				if (!res.ok) {
					const errorData = await res.json().catch(() => ({}));
					throw new Error(errorData.error || "Failed to fetch managers");
				}
				return res.json();
			})
			.then((data) => setManagers(data))
			.catch((err) => setError(err instanceof Error ? err : new Error("Failed to fetch managers")))
			.finally(() => setIsLoading(false));
	}, [siteId]);

	return { managers, isLoading, error };
}

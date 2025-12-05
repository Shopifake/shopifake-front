// utils/authFetch.ts
import { API_BASE_URL } from "../hooks/api-config";

export async function authFetch(url: string, options: RequestInit = {}) {
  const makeRequest = () =>
    fetch(url, {
      ...options,
      credentials: "include",
    });

  let response = await makeRequest();

  if (response.status === 401 && !url.includes('/refresh')) {
    const refreshRes = await fetch(`${API_BASE_URL}/api/auth-b2e/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      response = await makeRequest();
    }
  }

  return response;
}
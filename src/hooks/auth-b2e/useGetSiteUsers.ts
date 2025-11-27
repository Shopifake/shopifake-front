import { API_BASE_URL } from '../api-config';

export async function getSiteUsers(token: string, siteId: string) {
  const res = await fetch(`${API_BASE_URL}/api/users/me/sites/${siteId}/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Failed to fetch site users');
  return result;
}

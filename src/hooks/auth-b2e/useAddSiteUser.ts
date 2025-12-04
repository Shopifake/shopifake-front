import { API_BASE_URL } from '../api-config';

export async function addSiteUser(token: string, siteId: string, userId: string, role: string) {
  const res = await fetch(`${API_BASE_URL}/api/users/me/sites/${siteId}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ userId, role })
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Failed to add user to site');
  return result;
}

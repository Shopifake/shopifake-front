import { API_BASE_URL } from '../api-config';

export async function removeSiteUser(token: string, siteId: string, userId: string) {
  const res = await fetch(`${API_BASE_URL}/api/users/me/sites/${siteId}/users/${userId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to remove user from site');
}

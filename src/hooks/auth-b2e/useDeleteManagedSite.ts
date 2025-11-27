import { API_BASE_URL } from '../api-config';

export async function useDeleteManagedSite(token: string, siteId: string) {
  const res = await fetch(`${API_BASE_URL}/api/users/me/sites/${siteId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete managed site');
}
import { API_BASE_URL } from '../api-config';

export async function useUpdateManagedSiteRole(token: string, siteId: string, role: string) {
  const res = await fetch(`${API_BASE_URL}/api/users/me/sites/${siteId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ role })
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Failed to update managed site role');
  return result;
}

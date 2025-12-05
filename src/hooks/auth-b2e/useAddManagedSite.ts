import { API_BASE_URL } from '../api-config';

export async function useAddManagedSite(token: string, siteId: string, role: string) {
  const res = await fetch(`${API_BASE_URL}/api/users/me/sites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ siteId, role })
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Failed to add managed site');
  return result;
}

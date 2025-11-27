import { API_BASE_URL } from '../api-config';

export async function useDeleteProfile(token: string, reason: string) {
  const res = await fetch(`${API_BASE_URL}/api/users/me`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ reason })
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Failed to delete profile');
  return result;
}

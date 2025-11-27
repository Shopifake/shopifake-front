import { API_BASE_URL } from '../api-config';

export async function useGetProfile(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Failed to fetch profile');
  return result;
}

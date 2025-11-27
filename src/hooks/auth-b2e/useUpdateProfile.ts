import { API_BASE_URL } from '../api-config';

export async function useUpdateProfile(token: string, data: { firstName?: string; lastName?: string; phone?: string; address?: string }) {
  const res = await fetch(`${API_BASE_URL}/api/users/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Failed to update profile');
  return result;
}

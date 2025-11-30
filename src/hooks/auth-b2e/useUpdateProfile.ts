import { API_BASE_URL } from '../api-config';
import { authFetch } from '../../utils/authFetch';
import { useCallback } from 'react';

export function useUpdateProfile() {
  const updateProfile = useCallback(async (data: { firstName?: string; lastName?: string; phone?: string; address?: string }) => {
    const res = await authFetch(`${API_BASE_URL}/api/auth-b2e/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update profile');
    return result;
  }, []);

  return { updateProfile };
}
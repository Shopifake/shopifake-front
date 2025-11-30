import { API_BASE_URL } from '../api-config';
import { authFetch } from '../../utils/authFetch';
import { useAuth } from './useAuth';

export function useDeleteProfile() {
  const { logout } = useAuth();

  const deleteProfile = async (deleteReason: string) => {
    const res = await authFetch(`${API_BASE_URL}/api/auth-b2e/users/me`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deleteReason }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete profile');
    await logout();
    return result;
  };

  return { deleteProfile };
}
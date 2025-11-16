// API Configuration
// Uses environment variable with fallback to relative path for production
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL || '';
  if (envUrl) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  // Fallback to relative path if no env variable is set (for production)
  return '';
};

export const API_BASE_URL = getApiBaseUrl();
export const DEFAULT_OWNER_ID = 1;


// API Configuration
// Uses environment variable with fallback to relative path for production
type ImportMetaWithEnv = ImportMeta & {
  env?: Record<string, string | undefined>;
};

const getEnvValue = (key: string): string => {
  const env = (import.meta as ImportMetaWithEnv).env;
  return env?.[key] ?? "";
};

const getApiBaseUrl = (): string => {
  const envUrl = getEnvValue("VITE_API_URL");
  if (envUrl) {
    return envUrl.endsWith("/") ? envUrl.slice(0, -1) : envUrl;
  }
  // Fallback to relative path if no env variable is set (for production)
  return "";
};

const getRecommenderBaseUrl = (): string => {
  const envUrl = getEnvValue("VITE_RECOMMENDER_URL");
  if (envUrl) {
    return envUrl.endsWith("/") ? envUrl.slice(0, -1) : envUrl;
  }
  return "";
};

export const API_BASE_URL = getApiBaseUrl();
export const RECOMMENDER_BASE_URL = getRecommenderBaseUrl();
export const DEFAULT_OWNER_ID = "11111111-1111-1111-1111-111111111111";


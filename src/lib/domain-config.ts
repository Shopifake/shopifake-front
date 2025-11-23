/**
 * Domain Configuration
 * Uses environment variable with fallback for development
 */
const getBaseDomain = (): string => {
  const envDomain = (import.meta.env as { VITE_BASE_DOMAIN?: string }).VITE_BASE_DOMAIN;
  if (envDomain) {
    return envDomain;
  }
  // Fallback for development
  return "shopifake.com";
};

export const BASE_DOMAIN = getBaseDomain();

/**
 * Gets the full URL for a site slug
 */
export function getSiteUrl(slug: string, useHttps: boolean = false): string {
  const protocol = useHttps ? "https" : "http";
  return `${protocol}://${slug}.${BASE_DOMAIN}`;
}


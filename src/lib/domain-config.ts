/**
 * Domain Configuration
 * Uses environment variable with environment-aware fallbacks
 */
const getBaseDomain = (): string => {
  const envDomain = (import.meta.env as { VITE_BASE_DOMAIN?: string }).VITE_BASE_DOMAIN;
  if (envDomain && envDomain.trim().length > 0) {
    return envDomain.trim();
  }

  if (import.meta.env.DEV || (import.meta.env as { MODE?: string }).MODE === "development") {
    // nip.io lets any subdomain resolve to 127.0.0.1, which is ideal for local testing
    return "127.0.0.1.nip.io";
  }

  // Production fallback
  return "shopifake.com";
};

export const BASE_DOMAIN = getBaseDomain();
console.log('[DEBUG] BASE_DOMAIN:', BASE_DOMAIN);

/**
 * Gets the full URL for a site slug
 */
export function getSiteUrl(slug: string, useHttps: boolean = false): string {
  const protocol = useHttps ? "https" : "http";
  return `${protocol}://${slug}.${BASE_DOMAIN}`;
}


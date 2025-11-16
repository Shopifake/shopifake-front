import { BASE_DOMAIN } from "./domain-config";

/**
 * Utility functions for subdomain detection and extraction
 */

/**
 * Extracts the subdomain from the current hostname
 * @param hostname - The hostname (defaults to window.location.hostname)
 * @param baseDomain - The base domain (defaults to BASE_DOMAIN from env)
 * @returns The subdomain or null if no subdomain is present
 */
export function getSubdomain(hostname?: string, baseDomain: string = BASE_DOMAIN): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const currentHostname = hostname || window.location.hostname;
  
  // Handle localhost for development
  if (currentHostname === "localhost" || currentHostname === "127.0.0.1" || currentHostname.startsWith("localhost:")) {
    // In development, you might want to use a query param or allow localhost subdomains
    // For now, return null to show the main app
    return null;
  }

  // Remove port if present
  const hostnameWithoutPort = currentHostname.split(":")[0];

  // Check if the hostname ends with the base domain
  if (!hostnameWithoutPort.endsWith(baseDomain)) {
    return null;
  }

  // Extract subdomain
  const subdomain = hostnameWithoutPort.replace(`.${baseDomain}`, "");

  // If subdomain is empty or equals the base domain, return null
  if (!subdomain || subdomain === baseDomain) {
    return null;
  }

  return subdomain;
}

/**
 * Checks if the current hostname is a subdomain
 */
export function isSubdomain(hostname?: string, baseDomain: string = BASE_DOMAIN): boolean {
  return getSubdomain(hostname, baseDomain) !== null;
}


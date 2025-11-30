// API Types based on API_DOCUMENTATION.md

export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY";
export type Language = "EN" | "FR" | "DE" | "ES" | "IT" | "PT" | "NL" | "JA" | "ZH";
export type SiteStatus = "DRAFT" | "ACTIVE" | "DISABLED";

export interface SiteConfig {
  bannerUrl: string;
  name: string;
  title: string;
  subtitle: string;
  heroDescription: string;
  logoUrl: string;
  aboutPortraitOneUrl: string;
  aboutLandscapeUrl: string;
  aboutPortraitTwoUrl: string;
  history: string;
  values: string[];
  contactHeading: string;
  contactDescription: string;
  contactDetails: string;
  contactExtraNote?: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface CreateSiteRequest {
  name: string;
  slug?: string;
  description?: string;
  currency: Currency;
  language: Language;
  config: string; // JSON string of SiteConfig
}

export interface SiteResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  currency: Currency;
  language: Language;
  status: SiteStatus;
  ownerId: string;
  config: string; // JSON string of SiteConfig
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSiteRequest {
  name?: string;
  slug?: string;
  description?: string;
  currency?: Currency;
  language?: Language;
  config?: string; // JSON string of SiteConfig
}

export interface UpdateSiteStatusRequest {
  status: SiteStatus;
}

export interface SiteSlugResponse {
  slug: string;
}

export interface AlternativeSlugSuggestion {
  originalSlug: string;
  suggestedSlug: string;
  message: string;
}

export interface SlugAvailabilityResponse {
  slug: string;
  available: boolean;
}

export interface LanguagesResponse {
  languages: Language[];
  count: number;
}

export interface CurrenciesResponse {
  currencies: Currency[];
  count: number;
}

export type UserSiteRole = "Owner" | "CM" | "SM";

export type SiteWithRole = SiteResponse & {
  role: UserSiteRole;
};


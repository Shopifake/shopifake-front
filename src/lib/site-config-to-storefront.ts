import { mockStorefrontConfig, type StorefrontConfig } from "./storefront-config";
import type { SiteConfig } from "../types/api/sitesApiTypes";
import { Flower2, Heart, Leaf, Sparkles } from "lucide-react";

/**
 * Converts a SiteConfig from the API to a StorefrontConfig
 */
export function buildStorefrontConfigFromSiteConfig(siteConfig: SiteConfig, siteName: string): StorefrontConfig {
  const base = mockStorefrontConfig;

  // Parse contact details
  const details = siteConfig.contactDetails
    ? siteConfig.contactDetails
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

  // Map values to storefront value configs
  const valueIcons = [Flower2, Heart, Leaf, Sparkles];
  const values = siteConfig.values
    .slice(0, 4)
    .map((value, index) => ({
      icon: valueIcons[index] || Flower2,
      title: `Value ${index + 1}`,
      description: value,
    }));

  return {
    ...base,
    branding: {
      ...base.branding,
      name: siteConfig.name || siteName,
      tagline: siteConfig.subtitle || base.branding.tagline,
      logoUrl: siteConfig.logoUrl || base.branding.logoUrl,
      iconGradientClass: "storefront-icon-gradient",
      nameClass: "storefront-text-primary",
      taglineClass: "storefront-text-secondary",
    },
    navigation: {
      ...base.navigation,
      mainMenuLabel: base.navigation.mainMenuLabel,
      navLinkHoverClass: "storefront-nav-hover",
      iconButtonHoverClass: "storefront-icon-hover",
      outlineButtonHoverClass: "storefront-outline-hover",
    },
    home: {
      ...base.home,
      hero: {
        ...base.home.hero,
        title: siteConfig.title || siteConfig.name || base.home.hero.title,
        subtitle: siteConfig.subtitle || base.home.hero.subtitle,
        description: siteConfig.heroDescription || base.home.hero.description,
        imageUrl: siteConfig.bannerUrl || base.home.hero.imageUrl,
        iconWrapperClass: "storefront-icon-gradient",
        titleClass: "storefront-text-primary",
        subtitleClass: "storefront-text-secondary",
      },
      productSiteId: "site", // This should be the actual site ID when available
      productCard: {
        hoverBorderClass: "storefront-hover-border-primary",
        titleClass: "storefront-text-primary",
        priceClass: "storefront-text-secondary",
        freshBadgeClass: "storefront-badge-primary",
      },
    },
    categoriesPage: {
      ...base.categoriesPage,
      heading: siteConfig.name ? `Explore ${siteConfig.name}` : base.categoriesPage.heading,
      subheading: siteConfig.subtitle || base.categoriesPage.subheading,
      headingClass: "storefront-heading-primary",
      cardHoverClass: "storefront-hover-border-primary",
      countClass: "storefront-text-primary",
    },
    about: {
      hero: {
        ...base.about.hero,
        imageUrl: siteConfig.aboutPortraitOneUrl || base.about.hero.imageUrl,
        title: siteConfig.name ? `About ${siteConfig.name}` : base.about.hero.title,
        subtitle: siteConfig.subtitle || base.about.hero.subtitle,
      },
      story: {
        ...base.about.story,
        imageUrl: siteConfig.aboutLandscapeUrl || base.about.story.imageUrl,
        paragraphs: siteConfig.history ? [siteConfig.history] : base.about.story.paragraphs,
        headingClass: "storefront-heading-primary",
      },
      values: values.length > 0 ? values : base.about.values,
      contact: {
        ...base.about.contact,
        heading: siteConfig.contactHeading || base.about.contact.heading,
        description: siteConfig.contactDescription || base.about.contact.description,
        details: details.length > 0 ? details : base.about.contact.details,
        extraNote: siteConfig.contactExtraNote || base.about.contact.extraNote,
        imageUrl: siteConfig.aboutPortraitTwoUrl || base.about.contact.imageUrl,
        headingClass: "storefront-heading-primary",
        extraNoteClass: "storefront-text-secondary",
      },
    },
    account: {
      primaryButtonClass: "storefront-btn-primary",
    },
    cart: {
      emptyStateButtonClass: "storefront-btn-primary",
    },
    theme: {
      wrapperClass: base.theme.wrapperClass,
      accentBorderClass: "storefront-accent-border",
      primaryColor: siteConfig.primaryColor || base.theme.primaryColor,
      primaryForeground: base.theme.primaryForeground,
      secondaryColor: siteConfig.secondaryColor || base.theme.secondaryColor,
      secondaryForeground: base.theme.secondaryForeground,
      gradientFrom: siteConfig.primaryColor || base.theme.gradientFrom,
      gradientTo: siteConfig.secondaryColor || base.theme.gradientTo,
    },
  };
}


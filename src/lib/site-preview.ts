import { mockStorefrontConfig, type StorefrontConfig } from "./storefront-config";
import type { SiteConfig } from "../types/api/sitesApiTypes";

export interface SiteDraft {
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
  values: [string, string, string, string];
  contactHeading: string;
  contactDescription: string;
  contactDetails: string;
  contactExtraNote: string;
  primaryColor: string;
  secondaryColor: string;
}

export function createEmptySiteDraft(): SiteDraft {
  return {
    bannerUrl: "",
    name: "",
    title: "",
    subtitle: "",
    heroDescription: "",
    logoUrl: "",
    aboutPortraitOneUrl: "",
    aboutLandscapeUrl: "",
    aboutPortraitTwoUrl: "",
    history: "",
    values: ["", "", "", ""],
    contactHeading: "",
    contactDescription: "",
    contactDetails: "",
    contactExtraNote: "",
    primaryColor: "#000000",
    secondaryColor: "#000000",
  };
}

export function siteConfigToDraft(config: SiteConfig): SiteDraft {
  return {
    bannerUrl: config.bannerUrl ?? "",
    name: config.name ?? "",
    title: config.title ?? "",
    subtitle: config.subtitle ?? "",
    heroDescription: config.heroDescription ?? "",
    logoUrl: config.logoUrl ?? "",
    aboutPortraitOneUrl: config.aboutPortraitOneUrl ?? "",
    aboutLandscapeUrl: config.aboutLandscapeUrl ?? "",
    aboutPortraitTwoUrl: config.aboutPortraitTwoUrl ?? "",
    history: config.history ?? "",
    values: [
      config.values?.[0] ?? "",
      config.values?.[1] ?? "",
      config.values?.[2] ?? "",
      config.values?.[3] ?? "",
    ],
    contactHeading: config.contactHeading ?? "",
    contactDescription: config.contactDescription ?? "",
    contactDetails: config.contactDetails ?? "",
    contactExtraNote: config.contactExtraNote ?? "",
    primaryColor: config.primaryColor ?? "#000000",
    secondaryColor: config.secondaryColor ?? "#000000",
  };
}

export function draftToSiteConfig(draft: SiteDraft): SiteConfig {
  return {
    bannerUrl: draft.bannerUrl,
    name: draft.name,
    title: draft.title,
    subtitle: draft.subtitle,
    heroDescription: draft.heroDescription,
    logoUrl: draft.logoUrl,
    aboutPortraitOneUrl: draft.aboutPortraitOneUrl,
    aboutLandscapeUrl: draft.aboutLandscapeUrl,
    aboutPortraitTwoUrl: draft.aboutPortraitTwoUrl,
    history: draft.history,
    values: [...draft.values],
    contactHeading: draft.contactHeading,
    contactDescription: draft.contactDescription,
    contactDetails: draft.contactDetails,
    contactExtraNote: draft.contactExtraNote,
    primaryColor: draft.primaryColor || demoSiteDraft.primaryColor,
    secondaryColor: draft.secondaryColor || demoSiteDraft.secondaryColor,
  };
}

// Temporary seed to make the creation flow immediately testable.
// Remove or replace with live data once the API integration is ready.
export const demoSiteDraft: SiteDraft = {
  bannerUrl: "https://as1.ftcdn.net/jpg/04/64/70/80/1000_F_464708086_IyYKIbcIMzVBpN0HOKveCxjEArkd9n3b.jpg",
  name: "Analog Atlas",
  title: "Analog Atlas Vinyl & Audio",
  subtitle: "Curated records, hi-fi essentials, and limited artist drops",
  heroDescription: "Hand-picked analog records, hi-fi gear, and live in-store sessions every week.",
  logoUrl: "https://ravennaareachamber.com/wp-content/uploads/2017/03/your-company-lsiting.png",
  aboutPortraitOneUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d4?auto=format&fit=crop&w=900&q=80",
  aboutLandscapeUrl: "https://images.unsplash.com/photo-1522175142171-0420f1e3a7da?auto=format&fit=crop&w=1200&q=80",
  aboutPortraitTwoUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80",
  history:
    "Analog Atlas opened as a pop-up listening bar in 2016, quickly becoming a haven for crate diggers and sound designers alike. Every pressing we stock is auditioned in-house, pairing warm analog nuance with contemporary audio gear.",
  values: [
    "Limited-run pressings sourced directly from independent labels worldwide.",
    "Hi-fi consultants on staff to help dial in the perfect home listening setup.",
    "Monthly artist sessions streamed live from our in-store studio.",
    "Carbon-neutral shipping with reusable mailers for collectors.",
  ],
  contactHeading: "Visit the Listening Bar",
  contactDescription:
    "Drop into our Brooklyn flagship to spin new arrivals, book a private listening suite, or tune into a live DJ set.",
  contactDetails: "📍 421 Wythe Ave, Brooklyn, NY\n📧 crew@analogatlas.com\n📞 +1 (347) 555-2046",
  contactExtraNote: "Free stylus tune-ups every first Saturday of the month",
  primaryColor: "#000000",
  secondaryColor: "#000000",
};

export function buildStorefrontConfigFromDraft(draft: SiteDraft): StorefrontConfig {
  const base = mockStorefrontConfig;

  const details = draft.contactDetails
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  return {
    ...base,
    branding: {
      ...base.branding,
      name: draft.name || base.branding.name,
      tagline: draft.subtitle || base.branding.tagline,
      logoUrl: draft.logoUrl || base.branding.logoUrl,
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
        title: draft.title || draft.name || base.home.hero.title,
        subtitle: draft.subtitle || base.home.hero.subtitle,
        description: draft.heroDescription || base.home.hero.description,
        imageUrl: draft.bannerUrl || base.home.hero.imageUrl,
        iconWrapperClass: "storefront-icon-gradient",
        titleClass: "storefront-text-primary",
        subtitleClass: "storefront-text-secondary",
      },
      productSiteId: "preview",
      productCard: {
        hoverBorderClass: "storefront-hover-border-primary",
        titleClass: "storefront-text-primary",
        priceClass: "storefront-text-secondary",
        freshBadgeClass: "storefront-badge-primary",
      },
    },
    categoriesPage: {
      ...base.categoriesPage,
      heading: draft.name ? `Explore ${draft.name}` : base.categoriesPage.heading,
      subheading: draft.subtitle || base.categoriesPage.subheading,
      headingClass: "storefront-heading-primary",
      cardHoverClass: "storefront-hover-border-primary",
      countClass: "storefront-text-primary",
    },
    about: {
      hero: {
        ...base.about.hero,
        imageUrl: draft.aboutPortraitOneUrl || base.about.hero.imageUrl,
        title: draft.name ? `About ${draft.name}` : base.about.hero.title,
        subtitle: draft.subtitle || base.about.hero.subtitle,
      },
      story: {
        ...base.about.story,
        imageUrl: draft.aboutLandscapeUrl || base.about.story.imageUrl,
        paragraphs: draft.history ? [draft.history] : base.about.story.paragraphs,
        headingClass: "storefront-heading-primary",
      },
      values: base.about.values.map((value, index) => ({
        ...value,
        description: draft.values[index] || value.description,
      })),
      contact: {
        ...base.about.contact,
        heading: draft.contactHeading || base.about.contact.heading,
        description: draft.contactDescription || base.about.contact.description,
        details: details.length ? details : base.about.contact.details,
        extraNote: draft.contactExtraNote || base.about.contact.extraNote,
        imageUrl: draft.aboutPortraitTwoUrl || base.about.contact.imageUrl,
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
      primaryColor: draft.primaryColor || base.theme.primaryColor,
      primaryForeground: base.theme.primaryForeground,
      secondaryColor: draft.secondaryColor || base.theme.secondaryColor,
      secondaryForeground: base.theme.secondaryForeground,
      gradientFrom: draft.primaryColor || base.theme.gradientFrom,
      gradientTo: draft.secondaryColor || base.theme.gradientTo,
    },
  };
}

import { createContext, useContext } from "react";
import type { LucideIcon } from "lucide-react";
import { Flower2, Heart, Leaf, Sparkles } from "lucide-react";

export interface StorefrontBrandingConfig {
  name: string;
  tagline: string;
  Icon: LucideIcon;
  iconGradientClass: string;
  nameClass: string;
  taglineClass: string;
}

export interface StorefrontNavigationConfig {
  homeLabel: string;
  categoriesLabel: string;
  aboutLabel: string;
  accountLabel: string;
  mainMenuLabel: string;
  searchPlaceholder: string;
  navLinkHoverClass: string;
  iconButtonHoverClass: string;
  outlineButtonHoverClass: string;
}

export interface StorefrontHeroConfig {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  Icon: LucideIcon;
  iconWrapperClass: string;
  titleClass: string;
  subtitleClass: string;
}

export interface StorefrontHomeProductCardConfig {
  hoverBorderClass: string;
  titleClass: string;
  priceClass: string;
  freshBadgeClass: string;
}

export interface StorefrontHomeConfig {
  hero: StorefrontHeroConfig;
  filterCategories: string[];
  productSiteId: string;
  productCard: StorefrontHomeProductCardConfig;
}

export interface StorefrontCategoryCardConfig {
  name: string;
  description: string;
  count: number;
  slug?: string;
}

export interface StorefrontCategoriesConfig {
  heading: string;
  headingClass: string;
  subheading: string;
  cardHoverClass: string;
  countClass: string;
  cards: StorefrontCategoryCardConfig[];
}

export interface StorefrontValueConfig {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface StorefrontAboutConfig {
  hero: {
    imageUrl: string;
    title: string;
    subtitle: string;
  };
  story: {
    heading: string;
    headingClass: string;
    imageUrl: string;
    paragraphs: string[];
  };
  values: StorefrontValueConfig[];
  contact: {
    heading: string;
    headingClass: string;
    description: string;
    details: string[];
    hours: string[];
    extraNote: string;
    extraNoteClass: string;
    imageUrl: string;
  };
}

export interface StorefrontAccountConfig {
  primaryButtonClass: string;
}

export interface StorefrontCartConfig {
  emptyStateButtonClass: string;
}

export interface StorefrontThemeConfig {
  wrapperClass: string;
  accentBorderClass: string;
}

export interface StorefrontConfig {
  branding: StorefrontBrandingConfig;
  navigation: StorefrontNavigationConfig;
  home: StorefrontHomeConfig;
  categoriesPage: StorefrontCategoriesConfig;
  about: StorefrontAboutConfig;
  account: StorefrontAccountConfig;
  cart: StorefrontCartConfig;
  theme: StorefrontThemeConfig;
}

const StorefrontConfigContext = createContext<StorefrontConfig | null>(null);

export const StorefrontConfigProvider = StorefrontConfigContext.Provider;

export function useStorefrontConfig(): StorefrontConfig {
  const context = useContext(StorefrontConfigContext);
  if (!context) {
    throw new Error("useStorefrontConfig must be used within a StorefrontConfigProvider");
  }
  return context;
}

export const mockStorefrontConfig: StorefrontConfig = {
  branding: {
    name: "Petal & Bloom",
    tagline: "Artisan Florals",
    Icon: Flower2,
    iconGradientClass: "bg-gradient-to-br from-[#EC4899] to-[#F43F5E]",
    nameClass: "text-[#EC4899]",
    taglineClass: "text-[#10B981]",
  },
  navigation: {
    homeLabel: "Shop",
    categoriesLabel: "Categories",
    aboutLabel: "About",
    accountLabel: "Account",
    mainMenuLabel: "Main Menu",
    searchPlaceholder: "Search products...",
    navLinkHoverClass: "hover:text-[#EC4899]",
    iconButtonHoverClass: "hover:bg-[#EC4899]/10 hover:text-[#EC4899]",
    outlineButtonHoverClass: "hover:bg-[#EC4899]/10 hover:text-[#EC4899] hover:border-[#EC4899]",
  },
  home: {
    hero: {
      title: "Petal & Bloom",
      subtitle: "Artisan Florals",
      description: "Hand-crafted with love by our expert florists. Fresh blooms daily.",
      imageUrl:
        "https://images.unsplash.com/photo-1666508130265-3d5491525a34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG93ZXIlMjBzaG9wJTIwY29sb3JmdWwlMjBib3VxdWV0fGVufDF8fHx8MTc2MjI5NTY4Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      Icon: Flower2,
      iconWrapperClass: "bg-gradient-to-br from-[#EC4899] to-[#F43F5E]",
      titleClass: "text-[#EC4899]",
      subtitleClass: "text-[#10B981]",
    },
    filterCategories: ["Bouquets", "Plants", "Specialty"],
    productSiteId: "1",
    productCard: {
      hoverBorderClass: "hover:border-[#EC4899]/30",
      titleClass: "text-[#EC4899]",
      priceClass: "text-[#10B981]",
      freshBadgeClass: "bg-[#10B981] hover:bg-[#10B981]/90",
    },
  },
  categoriesPage: {
    heading: "Explore Our Collections",
    headingClass: "text-[#EC4899]",
    subheading: "From romantic roses to elegant orchids - find the perfect blooms",
    cardHoverClass: "hover:border-[#EC4899]/30",
    countClass: "text-[#EC4899]",
    cards: [
      {
        name: "Bouquets",
        description: "Hand-tied fresh flower bouquets for any occasion",
        count: 28,
      },
      {
        name: "Plants",
        description: "Potted plants and succulents for lasting beauty",
        count: 15,
      },
      {
        name: "Wedding & Events",
        description: "Custom arrangements for your special day",
        count: 12,
      },
      {
        name: "Gift Sets",
        description: "Curated flower and gift combinations",
        count: 18,
      },
      {
        name: "Specialty",
        description: "Dried flowers, wreaths, and unique arrangements",
        count: 10,
      },
      {
        name: "Seasonal",
        description: "Fresh seasonal blooms and holiday specials",
        count: 22,
      },
    ],
  },
  about: {
    hero: {
      imageUrl:
        "https://images.unsplash.com/photo-1707486142706-d2749b04459a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGZsb3dlciUyMGJvdXF1ZXQlMjBwaW5rfGVufDF8fHx8MTc2MjI5NTgwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      title: "About Petal & Bloom",
      subtitle:
        "Where passion meets petals - Your local artisan flower shop bringing nature's beauty to life.",
    },
    story: {
      heading: "Our Story",
      headingClass: "text-[#EC4899]",
      imageUrl:
        "https://images.unsplash.com/photo-1595549269082-bdf7ac28b345?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG9yaXN0JTIwYXJyYW5naW5nJTIwZmxvd2Vyc3xlbnwxfHx8fDE3NjIyOTU4MDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      paragraphs: [
        "Founded in 2018 by master florist Elena Rodriguez, Petal & Bloom began as a small neighborhood shop with a big dream: to bring the joy and beauty of fresh flowers to every occasion. What started as a passion project in a tiny storefront has blossomed into the community's most beloved flower destination.",
        "Elena, who trained at the renowned Floral Design Institute in Amsterdam, combines traditional European techniques with modern aesthetics. Each arrangement tells a story, whether it's celebrating life's milestones or simply brightening someone's day. Our team of skilled florists shares Elena's dedication to excellence, ensuring every bloom is perfect before it leaves our shop.",
        "We partner exclusively with local and sustainable flower farms, supporting our community while ensuring the freshest blooms. When you choose Petal & Bloom, you're not just buying flowers – you're supporting local agriculture and getting arrangements that last longer and look more vibrant than mass-produced alternatives.",
        "From intimate wedding ceremonies to grand corporate events, and from \"just because\" gestures to life's most important moments, we're honored to be part of your story. Every petal, every stem, every arrangement is created with intention, care, and love.",
      ],
    },
    values: [
      {
        icon: Flower2,
        title: "Artisan Quality",
        description:
          "Each arrangement is handcrafted by our skilled florists with attention to every petal and stem.",
      },
      {
        icon: Heart,
        title: "Made with Love",
        description: "We pour our passion into every bouquet, creating arrangements that speak from the heart.",
      },
      {
        icon: Leaf,
        title: "Fresh & Sustainable",
        description:
          "We source our flowers from local growers and use eco-friendly packaging materials.",
      },
      {
        icon: Sparkles,
        title: "Same-Day Delivery",
        description:
          "Express your feelings today with our reliable same-day delivery service in the metro area.",
      },
    ],
    contact: {
      heading: "Visit Our Shop",
      headingClass: "text-[#EC4899]",
      description:
        "Stop by to see our beautiful blooms in person, or give us a call for custom arrangements!",
      details: [
        "📍 742 Garden Lane, Bloomville, CA 94102",
        "📧 hello@petalandbloom.com",
        "📞 (555) FLOWERS | (555) 356-9377",
      ],
      hours: [
        "🕐 Tuesday - Saturday: 9AM - 7PM",
        "Sunday: 10AM - 4PM | Closed Mondays",
      ],
      extraNote: "Same-day delivery available for orders placed before 2PM",
      extraNoteClass: "text-[#10B981]",
      imageUrl:
        "https://images.unsplash.com/photo-1718568698870-d80ad5cdf6e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG93ZXIlMjBzaG9wJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYyMjQ1NDE4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    },
  },
  account: {
    primaryButtonClass: "bg-[#EC4899] hover:bg-[#EC4899]/90 text-white",
  },
  cart: {
    emptyStateButtonClass: "bg-[#EC4899] hover:bg-[#EC4899]/90 text-white",
  },
  theme: {
    wrapperClass: "storefront-theme",
    accentBorderClass: "border-[#EC4899]/20",
  },
};

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { toast } from "sonner";
import { Toaster } from "../ui/sonner";
import { StorefrontConfigProvider, type StorefrontConfig } from "../../lib/storefront-config";
import { StorefrontHeader } from "./StorefrontHeader";
import { StorefrontHome, type StorefrontFiltersState } from "./StorefrontHome";
import { ProductDetail } from "./ProductDetail";
import { Cart } from "./Cart";
import { Checkout } from "./Checkout";
import { OrderConfirmation } from "./OrderConfirmation";
import { Categories } from "./Categories";
import { About } from "./About";
import { Account } from "./Account";
import { mockProducts } from "../../lib/mock-data";
import { useStorefrontCatalog } from "../../hooks/storefront/useStorefrontCatalog";
import type { StorefrontProductEntry } from "../../types/storefront";

type StorefrontView =
  | "home"
  | "product-detail"
  | "cart"
  | "checkout"
  | "confirmation"
  | "categories"
  | "about"
  | "account";

interface CartItem {
  productId: string;
  quantity: number;
}

interface StorefrontExperienceProps {
  config: StorefrontConfig;
  onReturnToMain?: () => void;
  isLiveStorefront?: boolean;
}

const getEntryCategories = (entry: StorefrontProductEntry) => {
  if (entry.kind === "live") {
    return entry.product.categories?.map((category) => category.name).filter(Boolean) ?? [];
  }

  return entry.product.category ? [entry.product.category] : [];
};

const isPublished = (entry: StorefrontProductEntry) => {
  if (entry.kind === "live") {
    return entry.product.status === "PUBLISHED";
  }

  return entry.product.status.toLowerCase() === "published";
};

const DEFAULT_FILTERS_STATE: StorefrontFiltersState = {
  selectedCategory: "all",
  priceRange: null,
  selectedFilterValues: {},
  sortOption: "featured",
};

export function StorefrontExperience({ config, onReturnToMain, isLiveStorefront = false }: StorefrontExperienceProps) {
  const [view, setView] = useState<StorefrontView>("home");
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderId, setOrderId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [productFilters, setProductFilters] = useState<StorefrontFiltersState>(DEFAULT_FILTERS_STATE);

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const previousTitle = document.title;
    const previousFaviconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    const faviconLink =
      previousFaviconLink ??
      (() => {
        const link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
        return link;
      })();

    const previousHref = faviconLink.getAttribute("href");

    const nextTitle = config.branding.name || config.home.hero.title || previousTitle;
    document.title = nextTitle;

    const logoUrl = config.branding.logoUrl;
    if (logoUrl) {
      faviconLink.setAttribute("href", logoUrl);
    }

    return () => {
      document.title = previousTitle;
      if (logoUrl) {
        if (previousHref) {
          faviconLink.setAttribute("href", previousHref);
        } else if (!previousFaviconLink) {
          faviconLink.remove();
        } else {
          faviconLink.removeAttribute("href");
        }
      }
    };
  }, [config.branding.name, config.home.hero.title, config.branding.logoUrl]);

  const themeStyle = useMemo(() => {
    const hexToRgba = (hex: string, alpha: number) => {
      const sanitized = hex.replace("#", "");
      if (sanitized.length !== 6) {
        return hex;
      }
      const r = parseInt(sanitized.substring(0, 2), 16);
      const g = parseInt(sanitized.substring(2, 4), 16);
      const b = parseInt(sanitized.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    return {
      "--storefront-primary": config.theme.primaryColor,
      "--storefront-primary-foreground": config.theme.primaryForeground,
      "--storefront-secondary": config.theme.secondaryColor,
      "--storefront-secondary-foreground": config.theme.secondaryForeground,
      "--storefront-gradient-from": config.theme.gradientFrom,
      "--storefront-gradient-to": config.theme.gradientTo,
      "--storefront-primary-transparent": hexToRgba(config.theme.primaryColor, 0.12),
      "--storefront-secondary-transparent": hexToRgba(config.theme.secondaryColor, 0.12),
    } as CSSProperties;
  }, [config.theme]);

  const handleProductClick = (id: string) => {
    setSelectedProductId(id);
    setView("product-detail");
  };

  const handleAddToCart = (productId: string, quantity: number) => {
    setCartItems((current) => {
      const existingItem = current.find((item) => item.productId === productId);
      if (existingItem) {
        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...current, { productId, quantity }];
    });
    toast.success("Added to cart!");
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCartItems((current) => {
      if (quantity <= 0) {
        return current.filter((item) => item.productId !== productId);
      }
      return current.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((current) => current.filter((item) => item.productId !== productId));
    toast.success("Removed from cart");
  };

  const handleCheckout = () => {
    setView("checkout");
  };

  const handleOrderComplete = () => {
    const newOrderId = `ORD-${Math.floor(Math.random() * 10000)}`;
    setOrderId(newOrderId);
    setCartItems([]);
    setView("confirmation");
    toast.success("Order placed successfully!");
  };

  const productSiteId = config.home.productSiteId;
  const canUseLiveData = Boolean(isLiveStorefront && productSiteId && productSiteId !== "preview" && productSiteId !== "site");
  const { products: liveProducts, isLoading: isLoadingLive } = useStorefrontCatalog(productSiteId, canUseLiveData);

  const catalogEntries: StorefrontProductEntry[] = useMemo(() => {
    if (canUseLiveData) {
      return liveProducts;
    }

    const fallbackSiteId = productSiteId ?? "1";
    const fallback = mockProducts.filter((product) => product.siteId === fallbackSiteId);
    const source = fallback.length > 0 ? fallback : mockProducts;
    const published = source.filter((product) => product.status.toLowerCase() === "published");
    const list = published.length > 0 ? published : source;
    return list.map((product) => ({
      kind: "mock",
      product,
    }));
  }, [canUseLiveData, liveProducts, productSiteId]);

  const categoryStats = useMemo(() => {
    const counts = new Map<string, number>();
    catalogEntries.forEach((entry) => {
      if (!isPublished(entry)) {
        return;
      }
      getEntryCategories(entry).forEach((name) => {
        counts.set(name, (counts.get(name) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
  }, [catalogEntries]);

  const categoryDescriptions = useMemo(() => {
    const map = new Map<string, string>();
    config.categoriesPage.cards.forEach((card) => {
      map.set(card.name, card.description);
    });
    return map;
  }, [config.categoriesPage.cards]);

  return (
    <StorefrontConfigProvider value={config}>
      <Toaster />
      <div
        className={`min-h-screen bg-background ${config.theme.wrapperClass}`}
        style={themeStyle}
      >
        {view !== "confirmation" && (
          <StorefrontHeader
            cartCount={totalCartItems}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCartClick={() => setView("cart")}
            onLogoClick={() => setView("home")}
            onCategoriesClick={() => setView("categories")}
            onAboutClick={() => setView("about")}
            onAccountClick={() => setView("account")}
            onReturnToMain={onReturnToMain}
          />
        )}

        {view === "home" && (
          <StorefrontHome
            products={catalogEntries}
            isLoading={isLoadingLive && canUseLiveData}
            searchQuery={searchQuery}
            onProductClick={handleProductClick}
            categories={categoryStats}
            filters={productFilters}
            onFiltersChange={setProductFilters}
          />
        )}

        {view === "product-detail" && selectedProductId && (
          <ProductDetail
            productId={selectedProductId}
            products={catalogEntries}
            onBack={() => setView("home")}
            onAddToCart={handleAddToCart}
          />
        )}

        {view === "cart" && (
          <Cart
            items={cartItems}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemove={handleRemoveFromCart}
            onCheckout={handleCheckout}
            onContinueShopping={() => setView("home")}
            products={catalogEntries}
          />
        )}

        {view === "checkout" && (
          <Checkout items={cartItems} products={catalogEntries} onComplete={handleOrderComplete} />
        )}

        {view === "confirmation" && (
          <OrderConfirmation orderId={orderId} onContinue={() => setView("home")} />
        )}

        {view === "categories" && (
          <Categories
            categories={categoryStats}
            descriptions={categoryDescriptions}
            isLoading={isLoadingLive && canUseLiveData}
            onCategoryClick={() => setView("home")}
            fallbackCards={config.categoriesPage.cards}
            heading={config.categoriesPage.heading}
            subheading={config.categoriesPage.subheading}
            headingClass={config.categoriesPage.headingClass}
            cardHoverClass={config.categoriesPage.cardHoverClass}
            countClass={config.categoriesPage.countClass}
          />
        )}

        {view === "about" && <About />}

        {view === "account" && <Account />}
      </div>
    </StorefrontConfigProvider>
  );
}

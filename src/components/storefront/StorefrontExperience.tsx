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
import {
  useGetCart,
  useAddToCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
  type CartItemResponse,
} from "../../hooks/orders";
import { useAdjustInventory } from "../../hooks/inventory";
import { API_BASE_URL } from "../../hooks/api-config";
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

// Polling interval for refetching storefront data (in milliseconds)
const STOREFRONT_DATA_REFETCH_INTERVAL = 30000; // 30 seconds

export function StorefrontExperience({ config, onReturnToMain, isLiveStorefront = false }: StorefrontExperienceProps) {
  const [view, setView] = useState<StorefrontView>("home");
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
  const [orderId, setOrderId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [productFilters, setProductFilters] = useState<StorefrontFiltersState>(DEFAULT_FILTERS_STATE);
  // Fallback local cart state for preview/mock mode
  const [localCartItems, setLocalCartItems] = useState<CartItem[]>([]);

  const productSiteId = config.home.productSiteId;
  const canUseLiveData = Boolean(isLiveStorefront && productSiteId && productSiteId !== "preview" && productSiteId !== "site");
  
  // Cart hooks - only use if we have a valid siteId
  const siteIdForCart = canUseLiveData && productSiteId ? productSiteId : undefined;
  const { cart, isLoading: isLoadingCart, refetch: refetchCart } = useGetCart(siteIdForCart);
  const { addToCart, isLoading: isAddingToCart } = useAddToCart();
  const { updateCartItem, isLoading: isUpdatingCart } = useUpdateCartItem();
  const { removeCartItem, isLoading: isRemovingFromCart } = useRemoveCartItem();
  const { clearCart } = useClearCart();
  const { adjustInventory } = useAdjustInventory();

  // Convert cart items to local format for compatibility
  // Use API cart if available, otherwise fall back to local state
  const cartItems: CartItem[] = useMemo(() => {
    if (siteIdForCart && cart?.items) {
      return cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
    }
    return localCartItems;
  }, [cart, localCartItems, siteIdForCart]);

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

  const handleAddToCart = async (productId: string, quantity: number) => {
    if (!siteIdForCart) {
      // Fallback to local state if no siteId (for preview/mock mode)
      setLocalCartItems((current) => {
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
      return;
    }

    const result = await addToCart(siteIdForCart, { productId, quantity });
    if (result) {
      refetchCart();
    }
  };

  const handleUpdateCartQuantity = async (productId: string, quantity: number) => {
    if (!siteIdForCart || !cart) {
      // Fallback to local state if no siteId
      setLocalCartItems((current) => {
        if (quantity <= 0) {
          return current.filter((item) => item.productId !== productId);
        }
        return current.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        );
      });
      return;
    }

    const cartItem = cart.items.find((item) => item.productId === productId);
    if (!cartItem) return;

    if (quantity <= 0) {
      await handleRemoveFromCart(productId);
      return;
    }

    const result = await updateCartItem(siteIdForCart, cartItem.id, { quantity });
    if (result) {
      refetchCart();
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
    if (!siteIdForCart || !cart) {
      // Fallback to local state if no siteId
      setLocalCartItems((current) => current.filter((item) => item.productId !== productId));
      toast.success("Removed from cart");
      return;
    }

    const cartItem = cart.items.find((item) => item.productId === productId);
    if (!cartItem) return;

    const result = await removeCartItem(siteIdForCart, cartItem.id);
    if (result) {
      refetchCart();
    }
  };

  const handleCheckout = async () => {
    // For preview mode, proceed directly to checkout
    if (!canUseLiveData) {
      setView("checkout");
      return;
    }

    // Fetch actual stock from API for each product in cart
    const stockIssues: Array<{ productName: string; requested: number; available: number }> = [];
    
    try {
      // Get product names for error messages
      const productMap = new Map<string, string>();
      catalogEntries.forEach((entry) => {
        const productId = entry.kind === "live" ? entry.product.id : entry.product.id;
        const productName = entry.kind === "live" ? entry.product.name : entry.product.name;
        productMap.set(productId, productName);
      });

      // Fetch inventory for all products in cart
      const inventoryChecks = await Promise.allSettled(
        cartItems.map(async (item) => {
          try {
            const response = await fetch(`${API_BASE_URL}/api/inventory/${item.productId}`);
            if (!response.ok) {
              // If inventory doesn't exist, assume infinite stock
              return { productId: item.productId, availableQuantity: Number.POSITIVE_INFINITY };
            }
            const inventory = (await response.json()) as { availableQuantity: number };
            return { productId: item.productId, availableQuantity: inventory.availableQuantity };
          } catch (error) {
            // On error, assume infinite stock to not block checkout
            console.error(`Failed to fetch inventory for product ${item.productId}:`, error);
            return { productId: item.productId, availableQuantity: Number.POSITIVE_INFINITY };
          }
        })
      );

      // Check stock availability
      inventoryChecks.forEach((result, index) => {
        if (result.status === "fulfilled") {
          const { productId, availableQuantity } = result.value;
          const item = cartItems[index];
          const productName = productMap.get(productId) || "Unknown Product";

          if (availableQuantity < item.quantity) {
            stockIssues.push({
              productName,
              requested: item.quantity,
              available: availableQuantity,
            });
          }
        }
      });

      // If there are stock issues, display error and prevent checkout
      if (stockIssues.length > 0) {
        const issuesMessages = stockIssues.map((issue) => {
          if (issue.available === 0) {
            return `${issue.productName}: Out of stock (requested ${issue.requested})`;
          }
          return `${issue.productName}: Requested ${issue.requested}, maximum available: ${issue.available}`;
        });

        toast.error(`Insufficient stock:\n${issuesMessages.join("\n")}`, {
          duration: 6000,
        });

        // Refetch catalog to get latest stock
        refetchCatalog();
        return; // Don't proceed to checkout
      }

      // All stock checks passed, proceed to checkout
      setView("checkout");
    } catch (error) {
      console.error("Error checking stock:", error);
      toast.error("Failed to verify stock availability. Please try again.");
    }
  };

  const handleOrderComplete = async () => {
    try {
      const newOrderId = `ORD-${Math.floor(Math.random() * 10000)}`;
      setOrderId(newOrderId);
      
      // Update inventory for each product in the cart
      // Only update inventory if we're using live data (not preview mode)
      if (canUseLiveData) {
        const inventoryUpdates = cartItems.map(async (item) => {
          try {
            // Reduce inventory by the quantity sold (negative delta)
            const result = await adjustInventory(item.productId, {
              quantityDelta: -item.quantity,
              reason: `Order ${newOrderId} - Checkout completed`,
            });
            
            if (!result) {
              console.error(`Failed to update inventory for product ${item.productId}`);
              // Continue with other products even if one fails
            }
          } catch (error) {
            console.error(`Error updating inventory for product ${item.productId}:`, error);
            // Continue with other products even if one fails
          }
        });

        // Wait for all inventory updates to complete (but don't fail the order if some fail)
        await Promise.allSettled(inventoryUpdates);
      }
      
      // Clear cart after order completion
      if (siteIdForCart) {
        await clearCart(siteIdForCart);
        refetchCart();
      } else {
        // Clear local cart for preview mode
        setLocalCartItems([]);
      }
      
      // Refetch catalog data after purchase to update inventory/availability
      if (canUseLiveData) {
        refetchCatalog();
      }
      
      setView("confirmation");
      toast.success("Order placed successfully!");
    } catch (error) {
      console.error("Error completing order:", error);
      toast.error("Order placed, but there was an issue updating inventory. Please contact support.");
      // Still show confirmation even if inventory update fails
      setView("confirmation");
    }
  };

  const { products: liveProducts, isLoading: isLoadingLive, refetch: refetchCatalog } = useStorefrontCatalog(productSiteId, canUseLiveData);

  // Refetch data when user returns to the page (visibility change)
  useEffect(() => {
    if (!canUseLiveData || typeof document === "undefined") {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refetchCatalog();
        if (siteIdForCart) {
          refetchCart();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [canUseLiveData, siteIdForCart, refetchCatalog, refetchCart]);

  // Polling: refetch data at regular intervals
  useEffect(() => {
    if (!canUseLiveData) {
      return;
    }

    const intervalId = setInterval(() => {
      refetchCatalog();
      if (siteIdForCart) {
        refetchCart();
      }
    }, STOREFRONT_DATA_REFETCH_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [canUseLiveData, siteIdForCart, refetchCatalog, refetchCart]);

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

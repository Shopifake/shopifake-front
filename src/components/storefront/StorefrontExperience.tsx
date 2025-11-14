import { useMemo, useState, type CSSProperties } from "react";
import { toast } from "sonner";
import { Toaster } from "../ui/sonner";
import { StorefrontConfigProvider, type StorefrontConfig } from "../../lib/storefront-config";
import { StorefrontHeader } from "./StorefrontHeader";
import { StorefrontHome } from "./StorefrontHome";
import { ProductDetail } from "./ProductDetail";
import { Cart } from "./Cart";
import { Checkout } from "./Checkout";
import { OrderConfirmation } from "./OrderConfirmation";
import { Categories } from "./Categories";
import { About } from "./About";
import { Account } from "./Account";

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
}

export function StorefrontExperience({ config, onReturnToMain }: StorefrontExperienceProps) {
  const [view, setView] = useState<StorefrontView>("home");
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderId, setOrderId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
          <StorefrontHome onProductClick={handleProductClick} searchQuery={searchQuery} />
        )}

        {view === "product-detail" && selectedProductId && (
          <ProductDetail
            productId={selectedProductId}
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
          />
        )}

        {view === "checkout" && (
          <Checkout items={cartItems} onComplete={handleOrderComplete} />
        )}

        {view === "confirmation" && (
          <OrderConfirmation orderId={orderId} onContinue={() => setView("home")} />
        )}

        {view === "categories" && (
          <Categories onCategoryClick={() => setView("home")} />
        )}

        {view === "about" && <About />}

        {view === "account" && <Account />}
      </div>
    </StorefrontConfigProvider>
  );
}

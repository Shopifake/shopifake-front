import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { StorefrontLogo } from "./StorefrontLogo";
import { ShoppingCart, User, Search, Menu, ArrowLeft } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "../ui/sheet";
import { cn } from "../ui/utils";
import { useStorefrontConfig } from "../../lib/storefront-config";

export function StorefrontHeader({ 
  cartCount, 
  searchQuery,
  onSearchChange,
  onCartClick, 
  onLogoClick,
  onCategoriesClick,
  onAboutClick,
  onAccountClick,
  onReturnToMain 
}: { 
  cartCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCartClick: () => void;
  onLogoClick: () => void;
  onCategoriesClick: () => void;
  onAboutClick: () => void;
  onAccountClick: () => void;
  onReturnToMain?: () => void;
}) {
  const { navigation, theme } = useStorefrontConfig();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 backdrop-blur-sm storefront-header-gradient border-b",
        theme.accentBorderClass
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button onClick={onLogoClick}>
              <StorefrontLogo />
            </button>
            
            <nav className="hidden md:flex gap-6">
              <button
                onClick={onLogoClick}
                className={cn("text-sm transition-colors", navigation.navLinkHoverClass)}
              >
                {navigation.homeLabel}
              </button>
              <button
                onClick={onCategoriesClick}
                className={cn("text-sm transition-colors", navigation.navLinkHoverClass)}
              >
                {navigation.categoriesLabel}
              </button>
              <button
                onClick={onAboutClick}
                className={cn("text-sm transition-colors", navigation.navLinkHoverClass)}
              >
                {navigation.aboutLabel}
              </button>
            </nav>
          </div>

          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder={navigation.searchPlaceholder}
                className="pl-9" 
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onReturnToMain && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReturnToMain}
                className={cn(
                  "hidden md:flex gap-2",
                  navigation.outlineButtonHoverClass
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                {navigation.mainMenuLabel}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onAccountClick}
              className={cn("hidden lg:flex", navigation.iconButtonHoverClass)}
            >
              <User className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onCartClick}
              className={cn("relative", navigation.iconButtonHoverClass)}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("md:hidden", navigation.iconButtonHoverClass)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Browse store sections
                </SheetDescription>
                <nav className="flex flex-col gap-4 mt-4">
                  {onReturnToMain && (
                    <>
                      <button
                        onClick={onReturnToMain}
                        className={cn(
                          "text-lg transition-colors flex items-center gap-2",
                          navigation.navLinkHoverClass
                        )}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        {navigation.mainMenuLabel}
                      </button>
                      <div className="border-t my-2" />
                    </>
                  )}
                  <button
                    onClick={onLogoClick}
                    className={cn("text-lg transition-colors text-left", navigation.navLinkHoverClass)}
                  >
                    {navigation.homeLabel}
                  </button>
                  <button
                    onClick={onCategoriesClick}
                    className={cn("text-lg transition-colors text-left", navigation.navLinkHoverClass)}
                  >
                    {navigation.categoriesLabel}
                  </button>
                  <button
                    onClick={onAboutClick}
                    className={cn("text-lg transition-colors text-left", navigation.navLinkHoverClass)}
                  >
                    {navigation.aboutLabel}
                  </button>
                  <button
                    onClick={onAccountClick}
                    className={cn("text-lg transition-colors text-left", navigation.navLinkHoverClass)}
                  >
                    {navigation.accountLabel}
                  </button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

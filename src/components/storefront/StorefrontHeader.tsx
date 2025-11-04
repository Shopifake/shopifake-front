import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { StorefrontLogo } from "./StorefrontLogo";
import { ShoppingCart, User, Search, Menu, ArrowLeft } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "../ui/sheet";

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
  return (
    <header className="sticky top-0 z-50 border-b border-[#EC4899]/20 bg-gradient-to-r from-pink-50/95 to-green-50/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button onClick={onLogoClick}>
              <StorefrontLogo />
            </button>
            
            <nav className="hidden md:flex gap-6">
              <button onClick={onLogoClick} className="text-sm hover:text-[#EC4899] transition-colors">Shop</button>
              <button onClick={onCategoriesClick} className="text-sm hover:text-[#EC4899] transition-colors">Categories</button>
              <button onClick={onAboutClick} className="text-sm hover:text-[#EC4899] transition-colors">About</button>
            </nav>
          </div>

          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-9" 
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onReturnToMain && (
              <Button variant="outline" size="sm" onClick={onReturnToMain} className="hidden md:flex gap-2 hover:bg-[#EC4899]/10 hover:text-[#EC4899] hover:border-[#EC4899]">
                <ArrowLeft className="h-4 w-4" />
                Main Menu
              </Button>
            )}
            
            <Button variant="ghost" size="icon" onClick={onAccountClick} className="hidden lg:flex hover:bg-[#EC4899]/10 hover:text-[#EC4899]">
              <User className="h-5 w-5" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={onCartClick} className="relative hover:bg-[#EC4899]/10 hover:text-[#EC4899]">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden hover:bg-[#EC4899]/10 hover:text-[#EC4899]">
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
                      <button onClick={onReturnToMain} className="text-lg hover:text-[#EC4899] transition-colors flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Main Menu
                      </button>
                      <div className="border-t my-2" />
                    </>
                  )}
                  <button onClick={onLogoClick} className="text-lg hover:text-[#EC4899] transition-colors text-left">Shop</button>
                  <button onClick={onCategoriesClick} className="text-lg hover:text-[#EC4899] transition-colors text-left">Categories</button>
                  <button onClick={onAboutClick} className="text-lg hover:text-[#EC4899] transition-colors text-left">About</button>
                  <button onClick={onAccountClick} className="text-lg hover:text-[#EC4899] transition-colors text-left">Account</button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { SlidersHorizontal } from "lucide-react";
import { mockProducts } from "../../lib/mock-data";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "../ui/sheet";
import { cn } from "../ui/utils";
import { useStorefrontConfig } from "../../lib/storefront-config";

export function StorefrontHome({ 
  onProductClick,
  searchQuery 
}: { 
  onProductClick: (id: string) => void;
  searchQuery: string;
}) {
  const { home, theme, branding } = useStorefrontConfig();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState([0, 100]);

  const categories = ["all", ...home.filterCategories];
  const HeroIcon = home.hero.Icon;

  // Demo storefront shows products for the configured site only
  const filteredProducts = mockProducts
    .filter(p => p.siteId === home.productSiteId)
    .filter(p => p.status === "published")
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    });

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4">Categories</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center space-x-2">
              <Checkbox
                id={cat}
                checked={selectedCategory === cat}
                onCheckedChange={() => setSelectedCategory(cat)}
              />
              <Label htmlFor={cat} className="text-sm cursor-pointer">
                {cat === "all" ? "All Products" : cat}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4">Price Range</h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background storefront-section-background">
      {/* Hero Banner */}
  <div className={cn("relative border-b mb-8 overflow-hidden", theme.accentBorderClass)}>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${home.hero.imageUrl}')`
          }}
        />
        <div className="absolute inset-0 storefront-hero-overlay" />
        <div className="relative container mx-auto px-4 py-12">
          <div className="max-w-3xl flex items-center gap-8">
            <div className="flex-shrink-0">
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={branding.name}
                  className="h-20 w-20 object-contain drop-shadow-xl"
                />
              ) : (
                <div className={cn("p-6 rounded-2xl shadow-lg flex items-center justify-center", home.hero.iconWrapperClass)}>
                  <HeroIcon className="h-16 w-16 text-white" />
                </div>
              )}
            </div>
            <div>
              <h1 className={cn("mb-2", home.hero.titleClass)}>{home.hero.title}</h1>
              <p className={cn("text-2xl italic mb-3", home.hero.subtitleClass)}>{home.hero.subtitle}</p>
              <p className="text-lg text-muted-foreground">
                {home.hero.description}
              </p>
            </div>
          </div>
        </div>
      </div>

  <div className="container mx-auto px-4 pb-8">

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Card className="sticky top-20">
              <CardContent className="pt-6">
                <FilterPanel />
              </CardContent>
            </Card>
          </aside>

          <div className="flex-1">
            <div className="mb-6 flex gap-4 justify-end">
              <Select defaultValue="featured">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Filter products by category and price range
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterPanel />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className={cn(
                    "group cursor-pointer hover:shadow-xl transition-all",
                    home.productCard.hoverBorderClass
                  )}
                  onClick={() => onProductClick(product.id)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-square overflow-hidden rounded-t-lg bg-gradient-to-br from-pink-50 to-green-50">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className={cn("mb-2", home.productCard.titleClass)}>{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={cn("text-xl", home.productCard.priceClass)}>${product.price}</span>
                        {product.stock === 0 ? (
                          <Badge variant="destructive">Sold Out</Badge>
                        ) : product.stock < 15 ? (
                          <Badge className="bg-[#F59E0B] hover:bg-[#F59E0B]/90">
                            Only {product.stock} left
                          </Badge>
                        ) : (
                          <Badge className={home.productCard.freshBadgeClass}>Fresh Today</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

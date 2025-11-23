import React, { useCallback, useEffect, useMemo } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "../ui/sheet";
import { cn } from "../ui/utils";
import { useStorefrontConfig } from "../../lib/storefront-config";
import type { StorefrontProductEntry } from "../../types/storefront";
import type { ProductFilterAssignmentResponse } from "../../types/api/catalogApiTypes";

export type StorefrontFiltersState = {
  selectedCategory: string;
  priceRange: [number, number] | null;
  selectedFilterValues: Record<string, string[]>;
  sortOption: string;
};

type StorefrontHomeProps = {
  products: StorefrontProductEntry[];
  isLoading: boolean;
  categories: { name: string; count: number }[];
  onProductClick: (id: string) => void;
  searchQuery: string;
  filters: StorefrontFiltersState;
  onFiltersChange: (next: StorefrontFiltersState) => void;
};

type NormalizedProduct = {
  id: string;
  name: string;
  description: string;
  categories: string[];
  imageUrl?: string;
  priceAmount?: number;
  priceCurrency?: string;
  stock?: number;
  status: string;
  filters: ProductFilterAssignmentResponse[];
  createdAt: number;
};

const normalizeProduct = (entry: StorefrontProductEntry): NormalizedProduct => {
  if (entry.kind === "live") {
    return {
      id: entry.product.id,
      name: entry.product.name,
      description: entry.product.description ?? "",
      categories: entry.product.categories?.map((category) => category.name).filter(Boolean) ?? [],
      imageUrl: entry.product.images?.[0],
      priceAmount: entry.price?.amount,
      priceCurrency: entry.price?.currency,
      stock: entry.inventory?.availableQuantity ?? undefined,
      status: entry.product.status.toLowerCase(),
      filters: entry.product.filters ?? [],
      createdAt: entry.product.createdAt ? new Date(entry.product.createdAt).getTime() : 0,
    };
  }

  return {
    id: entry.product.id,
    name: entry.product.name,
    description: entry.product.description ?? "",
    categories: entry.product.category ? [entry.product.category] : [],
    imageUrl: entry.product.imageUrl,
    priceAmount: entry.product.price,
    priceCurrency: "USD",
    stock: entry.product.stock,
    status: entry.product.status.toLowerCase(),
    filters: [],
    createdAt: 0,
  };
};

export function StorefrontHome({
  products,
  isLoading,
  categories,
  onProductClick,
  searchQuery,
  filters,
  onFiltersChange,
}: StorefrontHomeProps) {
  const { home, theme, branding } = useStorefrontConfig();
  const updateFilters = useCallback(
    (partial: Partial<StorefrontFiltersState>) => {
      onFiltersChange({
        selectedCategory: filters.selectedCategory,
        priceRange: filters.priceRange,
        selectedFilterValues: filters.selectedFilterValues,
        sortOption: filters.sortOption,
        ...partial,
      });
    },
    [filters, onFiltersChange],
  );

  const normalizedProducts = useMemo(
    () =>
      products
        .map(normalizeProduct)
        .filter((product) => product.status === "published"),
    [products],
  );

  const categoryOptions = useMemo(() => {
    if (categories.length > 0) {
      return categories;
    }
    const counts = new Map<string, number>();
    normalizedProducts.forEach((product) => {
      product.categories.forEach((category) => {
        counts.set(category, (counts.get(category) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
  }, [categories, normalizedProducts]);

  const categoryFilterFacets = useMemo(() => {
    const result = new Map<
      string,
      Map<
        string,
        {
          displayName: string;
          values: Map<string, number>;
        }
      >
    >();

    normalizedProducts.forEach((product) => {
      product.categories.forEach((category) => {
        if (!result.has(category)) {
          result.set(category, new Map());
        }
        const filterMap = result.get(category)!;
        product.filters.forEach((filter) => {
          if (!filter.textValue) {
            return;
          }
          const key = filter.key;
          if (!filterMap.has(key)) {
            filterMap.set(key, {
              displayName: filter.displayName ?? key,
              values: new Map(),
            });
          }
          const facet = filterMap.get(key)!;
          facet.values.set(filter.textValue, (facet.values.get(filter.textValue) ?? 0) + 1);
        });
      });
    });

    return result;
  }, [normalizedProducts]);

  const priceBounds = useMemo(() => {
    const values = normalizedProducts
      .map((product) => product.priceAmount)
      .filter((value): value is number => typeof value === "number" && !Number.isNaN(value));

    if (values.length === 0) {
      return [0, 100] as [number, number];
    }

    const min = Math.floor(Math.min(...values));
    const max = Math.ceil(Math.max(...values));
    if (min === max) {
      return [0, Math.max(100, max)] as [number, number];
    }
    return [min, max] as [number, number];
  }, [normalizedProducts]);

  useEffect(() => {
    const currentRange = filters.priceRange;
    if (!currentRange) {
      updateFilters({ priceRange: priceBounds });
      return;
    }
    const [rangeMin, rangeMax] = currentRange;
    const [boundsMin, boundsMax] = priceBounds;
    const clampedMin = Math.max(rangeMin, boundsMin);
    const clampedMax = Math.min(rangeMax, boundsMax);
    if (clampedMin !== rangeMin || clampedMax !== rangeMax) {
      updateFilters({ priceRange: [clampedMin, clampedMax] });
    }
  }, [priceBounds, filters.priceRange, updateFilters]);

  const activePriceRange = filters.priceRange ?? priceBounds;

  const allProductsCount = normalizedProducts.length;
  const categoriesWithAll = [{ name: "all", count: allProductsCount }, ...categoryOptions];
  const HeroIcon = home.hero.Icon;

  const filteredProducts = normalizedProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filters.selectedCategory === "all" || product.categories.includes(filters.selectedCategory);
    const matchesPrice =
      product.priceAmount === undefined ||
      (product.priceAmount >= activePriceRange[0] && product.priceAmount <= activePriceRange[1]);
    const filterEntries = Object.entries(filters.selectedFilterValues).filter(([, values]) => values.length > 0);
    const matchesFilters =
      filterEntries.length === 0 ||
      filterEntries.every(([filterKey, values]) => {
        const productFilter = product.filters.find((filter) => filter.key === filterKey);
        if (!productFilter?.textValue) {
          return false;
        }
        return values.includes(productFilter.textValue);
      });

    return matchesSearch && matchesCategory && matchesPrice && matchesFilters;
  });

  const sortedProducts = useMemo(() => {
    const productsToSort = [...filteredProducts];
    switch (filters.sortOption) {
      case "price-low":
        productsToSort.sort((a, b) => {
          const priceA = a.priceAmount ?? Number.POSITIVE_INFINITY;
          const priceB = b.priceAmount ?? Number.POSITIVE_INFINITY;
          return priceA - priceB;
        });
        break;
      case "price-high":
        productsToSort.sort((a, b) => {
          const priceA = a.priceAmount ?? 0;
          const priceB = b.priceAmount ?? 0;
          return priceB - priceA;
        });
        break;
      case "newest":
        productsToSort.sort((a, b) => b.createdAt - a.createdAt);
        break;
      default:
        break;
    }
    return productsToSort;
  }, [filteredProducts, filters.sortOption]);

  const toggleFilterValue = (filterKey: string, value: string) => {
    const currentValues = filters.selectedFilterValues[filterKey] ?? [];
    const exists = currentValues.includes(value);
    const nextValues = exists ? currentValues.filter((entry) => entry !== value) : [...currentValues, value];
    const nextState = { ...filters.selectedFilterValues };
    if (nextValues.length === 0) {
      delete nextState[filterKey];
    } else {
      nextState[filterKey] = nextValues;
    }
    updateFilters({ selectedFilterValues: nextState });
  };

  const handleSelectCategory = (category: string) => {
    updateFilters({
      selectedCategory: category,
      selectedFilterValues: {},
    });
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4">Categories</h3>
        <div className="space-y-2">
          {categoriesWithAll.map((cat) => {
            const isSelected = filters.selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition hover:border-primary",
                  isSelected ? "border-primary bg-primary/5 text-primary" : "",
                )}
                onClick={() => handleSelectCategory(cat.name)}
              >
                <span>{cat.name === "all" ? "All Products" : cat.name}</span>
                <span className="text-xs text-muted-foreground">{cat.count ?? 0}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-4">Price Range</h3>
        <div className="space-y-4">
          <Slider
            value={activePriceRange}
            onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
            min={priceBounds[0]}
            max={priceBounds[1]}
            step={1}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>${activePriceRange[0]}</span>
            <span>${activePriceRange[1]}</span>
          </div>
        </div>
      </div>

      {filters.selectedCategory !== "all" && (
        <div>
          <h3 className="mb-4">Filters</h3>
          {(() => {
            const facets = categoryFilterFacets.get(filters.selectedCategory);
            if (!facets || facets.size === 0) {
              return <p className="text-sm text-muted-foreground">Aucun filtre disponible pour cette catégorie.</p>;
            }
            return (
              <div className="space-y-4">
                {Array.from(facets.entries()).map(([filterKey, facet]) => (
                  <div key={filterKey} className="space-y-3 rounded-lg border p-3">
                    <p className="text-sm font-medium">{facet.displayName}</p>
                    <div className="space-y-2">
                      {Array.from(facet.values.entries()).map(([value, count]) => {
                        const selectedValues = filters.selectedFilterValues[filterKey] ?? [];
                        const isChecked = selectedValues.includes(value);
                        return (
                          <label key={value} className="flex items-center justify-between gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => toggleFilterValue(filterKey, value)}
                              />
                              <span>{value}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{count}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}
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
              <Select value={filters.sortOption} onValueChange={(value) => updateFilters({ sortOption: value })}>
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

            {isLoading && (
              <div className="text-center py-12 text-muted-foreground">Loading products...</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => {
                const priceLabel =
                  product.priceAmount !== undefined
                    ? `${product.priceAmount.toFixed(2)} ${product.priceCurrency ?? ""}`.trim()
                    : "Price unavailable";
                const imageUrl =
                  product.imageUrl ||
                  "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80";
                return (
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
                        src={imageUrl}
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
                          <div className="flex flex-col gap-2">
                            <span className={cn("text-xl", home.productCard.priceClass)}>{priceLabel}</span>
                            <Badge variant="secondary" className="w-fit uppercase tracking-wide">
                              Published
                            </Badge>
                          </div>
                          {product.stock === 0 ? (
                            <Badge variant="destructive">Sold Out</Badge>
                          ) : typeof product.stock === "number" && product.stock < 15 ? (
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
                );
              })}
            </div>

            {!isLoading && filteredProducts.length === 0 && (
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

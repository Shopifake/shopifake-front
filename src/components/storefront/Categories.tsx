import { Card, CardContent } from "../ui/card";
import { cn } from "../ui/utils";
import type { StorefrontCategoryCardConfig } from "../../lib/storefront-config";

type CategoriesProps = {
  categories: { name: string; count: number }[];
  descriptions: Map<string, string>;
  fallbackCards: StorefrontCategoryCardConfig[];
  heading: string;
  subheading: string;
  headingClass: string;
  cardHoverClass: string;
  countClass: string;
  isLoading: boolean;
  onCategoryClick: (category: string) => void;
};

export function Categories({
  categories,
  descriptions,
  fallbackCards,
  heading,
  subheading,
  headingClass,
  cardHoverClass,
  countClass,
  isLoading,
  onCategoryClick,
}: CategoriesProps) {
  const cardsToDisplay =
    categories.length > 0
      ? categories.map((category) => ({
          name: category.name,
          description: descriptions.get(category.name) ?? `Browse the ${category.name} collection`,
          count: category.count,
        }))
      : fallbackCards;

  return (
    <div className="min-h-screen storefront-section-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className={cn("mb-2", headingClass)}>{heading}</h1>
          <p className="text-muted-foreground">{subheading}</p>
          {isLoading && <p className="text-sm text-muted-foreground mt-2">Loading categories…</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cardsToDisplay.map((category) => {
            const slug = category.name;
            return (
              <Card
                key={category.name}
                className={cn("group cursor-pointer hover:shadow-lg transition-all", cardHoverClass)}
                onClick={() => onCategoryClick(slug)}
              >
                <CardContent className="p-6">
                  <div>
                    <h3 className="mb-1">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                    <p className={cn("text-sm", countClass)}>
                      {category.count} published {category.count === 1 ? "item" : "items"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

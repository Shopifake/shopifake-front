import { Card, CardContent } from "../ui/card";
import { cn } from "../ui/utils";
import { useStorefrontConfig } from "../../lib/storefront-config";

export function Categories({ onCategoryClick }: { onCategoryClick: (category: string) => void }) {
  const { categoriesPage } = useStorefrontConfig();

  return (
  <div className="min-h-screen storefront-section-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className={cn("mb-2", categoriesPage.headingClass)}>{categoriesPage.heading}</h1>
          <p className="text-muted-foreground">{categoriesPage.subheading}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesPage.cards.map((category) => {
            const slug = category.slug ?? category.name;
            return (
              <Card
                key={category.name}
                className={cn(
                  "group cursor-pointer hover:shadow-lg transition-all",
                  categoriesPage.cardHoverClass
                )}
                onClick={() => onCategoryClick(slug)}
              >
                <CardContent className="p-6">
                  <div>
                    <h3 className="mb-1">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {category.description}
                    </p>
                    <p className={cn("text-sm", categoriesPage.countClass)}>
                      {category.count} items available
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

import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Flower2, Heart, Gift, Sparkles, TreePine, Leaf } from "lucide-react";

export function Categories({ onCategoryClick }: { onCategoryClick: (category: string) => void }) {
  const categories = [
    {
      name: "Bouquets",
      icon: Flower2,
      description: "Hand-tied fresh flower bouquets for any occasion",
      count: 28,
      color: "bg-[#EC4899]/10 text-[#EC4899]"
    },
    {
      name: "Plants",
      icon: TreePine,
      description: "Potted plants and succulents for lasting beauty",
      count: 15,
      color: "bg-[#10B981]/10 text-[#10B981]"
    },
    {
      name: "Wedding & Events",
      icon: Heart,
      description: "Custom arrangements for your special day",
      count: 12,
      color: "bg-[#F43F5E]/10 text-[#F43F5E]"
    },
    {
      name: "Gift Sets",
      icon: Gift,
      description: "Curated flower and gift combinations",
      count: 18,
      color: "bg-[#EC4899]/10 text-[#EC4899]"
    },
    {
      name: "Specialty",
      icon: Sparkles,
      description: "Dried flowers, wreaths, and unique arrangements",
      count: 10,
      color: "bg-[#A855F7]/10 text-[#A855F7]"
    },
    {
      name: "Seasonal",
      icon: Leaf,
      description: "Fresh seasonal blooms and holiday specials",
      count: 22,
      color: "bg-[#10B981]/10 text-[#10B981]"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/30 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-[#EC4899]">Explore Our Collections</h1>
          <p className="text-muted-foreground">From romantic roses to elegant orchids - find the perfect blooms</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            return (
              <Card
                key={category.name}
                className="group cursor-pointer hover:shadow-lg hover:border-[#EC4899]/30 transition-all"
                onClick={() => onCategoryClick(category.name)}
              >
                <CardContent className="p-6">
                  <div>
                    <h3 className="mb-1">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {category.description}
                    </p>
                    <p className="text-sm text-[#EC4899]">
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

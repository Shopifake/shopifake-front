import { Card, CardContent } from "../ui/card";
import { Flower2, Heart, Leaf, Sparkles } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

export function About() {
  const values = [
    {
      icon: Flower2,
      title: "Artisan Quality",
      description: "Each arrangement is handcrafted by our skilled florists with attention to every petal and stem."
    },
    {
      icon: Heart,
      title: "Made with Love",
      description: "We pour our passion into every bouquet, creating arrangements that speak from the heart."
    },
    {
      icon: Leaf,
      title: "Fresh & Sustainable",
      description: "We source our flowers from local growers and use eco-friendly packaging materials."
    },
    {
      icon: Sparkles,
      title: "Same-Day Delivery",
      description: "Express your feelings today with our reliable same-day delivery service in the metro area."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden mb-6 h-64 md:h-80">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1707486142706-d2749b04459a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGZsb3dlciUyMGJvdXF1ZXQlMjBwaW5rfGVufDF8fHx8MTc2MjI5NTgwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Fresh pink flower bouquet"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white text-center">
              <h1 className="mb-3">About Petal & Bloom</h1>
              <p className="text-lg text-white/90">
                Where passion meets petals - Your local artisan flower shop bringing nature's beauty to life.
              </p>
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="mb-12 max-w-6xl mx-auto">
          <Card className="border-[#EC4899]/20 overflow-hidden">
            <CardContent className="!p-0 h-full">
              <div className="grid md:grid-cols-2 h-full">
                <div className="relative min-h-[16rem] h-full">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1595549269082-bdf7ac28b345?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG9yaXN0JTIwYXJyYW5naW5nJTIwZmxvd2Vyc3xlbnwxfHx8fDE3NjIyOTU4MDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Florist arranging flowers"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center h-full">
                  <h2 className="mb-4 text-[#EC4899]">Our Story</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Founded in 2018 by master florist Elena Rodriguez, Petal & Bloom began as a small
                      neighborhood shop with a big dream: to bring the joy and beauty of fresh flowers
                      to every occasion. What started as a passion project in a tiny storefront has
                      blossomed into the community's most beloved flower destination.
                    </p>
                    <p>
                      Elena, who trained at the renowned Floral Design Institute in Amsterdam, combines
                      traditional European techniques with modern aesthetics. Each arrangement tells a
                      story, whether it's celebrating life's milestones or simply brightening someone's day.
                      Our team of skilled florists shares Elena's dedication to excellence, ensuring every
                      bloom is perfect before it leaves our shop.
                    </p>
                    <p>
                      We partner exclusively with local and sustainable flower farms, supporting our
                      community while ensuring the freshest blooms. When you choose Petal & Bloom, you're
                      not just buying flowers – you're supporting local agriculture and getting arrangements
                      that last longer and look more vibrant than mass-produced alternatives.
                    </p>
                    <p>
                      From intimate wedding ceremonies to grand corporate events, and from "just because"
                      gestures to life's most important moments, we're honored to be part of your story.
                      Every petal, every stem, every arrangement is created with intention, care, and love.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-12">
          <h2 className="mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => {
              return (
                <Card key={value.title}>
                  <CardContent className="p-6 text-center">
                    <h3 className="mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Contact Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-[#EC4899]/20 overflow-hidden">
            <CardContent className="!p-0 h-full">
              <div className="grid md:grid-cols-5 h-full">
                <div className="md:col-span-3 p-8 flex flex-col justify-center h-full">
                  <h2 className="mb-4 text-[#EC4899]">Visit Our Shop</h2>
                  <p className="text-muted-foreground mb-6">
                    Stop by to see our beautiful blooms in person, or give us a call for custom arrangements!
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="text-base">📍 742 Garden Lane, Bloomville, CA 94102</p>
                    <p>📧 hello@petalandbloom.com</p>
                    <p>📞 (555) FLOWERS | (555) 356-9377</p>
                    <p className="pt-2">🕐 Tuesday - Saturday: 9AM - 7PM</p>
                    <p>Sunday: 10AM - 4PM | Closed Mondays</p>
                    <p className="pt-4 italic text-[#10B981]">Same-day delivery available for orders placed before 2PM</p>
                  </div>
                </div>
                <div className="md:col-span-2 relative min-h-[16rem] h-full">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1718568698870-d80ad5cdf6e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG93ZXIlMjBzaG9wJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYyMjQ1NDE4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Flower shop interior"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

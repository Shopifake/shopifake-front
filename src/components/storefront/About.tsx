import { Card, CardContent } from "../ui/card";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { cn } from "../ui/utils";
import { useStorefrontConfig } from "../../lib/storefront-config";

export function About() {
  const { about, theme } = useStorefrontConfig();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden mb-6 h-64 md:h-80">
            <ImageWithFallback
              src={about.hero.imageUrl}
              alt={about.hero.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white text-center">
              <h1 className="mb-3">{about.hero.title}</h1>
              <p className="text-lg text-white/90">{about.hero.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="mb-12 max-w-6xl mx-auto">
          <Card className={cn("overflow-hidden", theme.accentBorderClass)}>
            <CardContent className="!p-0 h-full">
              <div className="grid md:grid-cols-2 h-full">
                <div className="relative min-h-[16rem] h-full">
                  <ImageWithFallback
                    src={about.story.imageUrl}
                    alt={about.story.heading}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center h-full">
                  <h2 className={cn("mb-4", about.story.headingClass)}>{about.story.heading}</h2>
                  <div className="space-y-4 text-muted-foreground">
                    {about.story.paragraphs.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
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
            {about.values.map((value) => {
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
          <Card className={cn("overflow-hidden", theme.accentBorderClass)}>
            <CardContent className="!p-0 h-full">
              <div className="grid md:grid-cols-5 h-full">
                <div className="md:col-span-3 p-8 flex flex-col justify-center h-full">
                  <h2 className={cn("mb-4", about.contact.headingClass)}>{about.contact.heading}</h2>
                  <p className="text-muted-foreground mb-6">
                    {about.contact.description}
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {about.contact.details.map((detail, index) => (
                      <p key={index} className={index === 0 ? "text-base" : undefined}>{detail}</p>
                    ))}
                    {about.contact.hours.map((line, index) => (
                      <p key={`hours-${index}`} className={index === 0 ? "pt-2" : undefined}>{line}</p>
                    ))}
                    <p className={cn("pt-4 italic", about.contact.extraNoteClass)}>
                      {about.contact.extraNote}
                    </p>
                  </div>
                </div>
                <div className="md:col-span-2 relative min-h-[16rem] h-full">
                  <ImageWithFallback
                    src={about.contact.imageUrl}
                    alt={about.contact.heading}
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

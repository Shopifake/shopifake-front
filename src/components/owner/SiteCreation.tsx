import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowLeft, Globe } from "lucide-react";

interface SiteCreationProps {
  onBack: () => void;
}

export function SiteCreation({ onBack }: SiteCreationProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1>Create a New Site</h1>
          <p className="text-muted-foreground">
            Begin outlining a fresh storefront and return anytime.
          </p>
        </div>
      </div>

      <Card className="border-dashed">
        <CardHeader className="items-center text-center">
          <Globe className="h-12 w-12 text-primary" />
          <CardTitle className="mt-4">Site setup coming soon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-muted-foreground">
          <p>
            This placeholder keeps the layout consistent until the creation flow is implemented.
          </p>
          <Button variant="outline" onClick={onBack}>
            Back to My Sites
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Separator } from "./ui/separator";
import { Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export function DesignSystem() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div>
          <h1 className="mb-4">Shopifake Design System</h1>
          <p className="text-muted-foreground">
            A comprehensive design system for the Shopifake e-commerce builder platform
          </p>
        </div>

        {/* Colors */}
        <section>
          <h2 className="mb-6">Color Palette</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Primary - Blue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-[#3B82F6] h-24 rounded-lg mb-3" />
                <p className="text-sm text-muted-foreground">#3B82F6</p>
                <p className="text-sm mt-2">Used for primary actions, links, and interactive elements</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accent - Green</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-[#22C55E] h-24 rounded-lg mb-3" />
                <p className="text-sm text-muted-foreground">#22C55E</p>
                <p className="text-sm mt-2">Used for success states, positive feedback, and secondary CTAs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Background</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-[#F9FAFB] border h-24 rounded-lg mb-3" />
                <p className="text-sm text-muted-foreground">#F9FAFB</p>
                <p className="text-sm mt-2">Main background color for a clean, neutral appearance</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Warning - Orange</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-[#F59E0B] h-24 rounded-lg mb-3" />
                <p className="text-sm text-muted-foreground">#F59E0B</p>
                <p className="text-sm mt-2">Used for warnings and attention-grabbing alerts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Destructive - Red</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-[#EF4444] h-24 rounded-lg mb-3" />
                <p className="text-sm text-muted-foreground">#EF4444</p>
                <p className="text-sm mt-2">Used for errors, destructive actions, and critical alerts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Borders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-[#E5E7EB] h-24 rounded-lg mb-3" />
                <p className="text-sm text-muted-foreground">#E5E7EB</p>
                <p className="text-sm mt-2">Subtle borders for cards and dividers</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Typography */}
        <section>
          <h2 className="mb-6">Typography</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Font Family</p>
                <p className="text-lg">Inter - A versatile, modern sans-serif typeface</p>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div>
                  <h1>Heading 1 - Main Page Titles</h1>
                  <p className="text-sm text-muted-foreground">2xl, medium weight</p>
                </div>
                <div>
                  <h2>Heading 2 - Section Headers</h2>
                  <p className="text-sm text-muted-foreground">xl, medium weight</p>
                </div>
                <div>
                  <h3>Heading 3 - Subsections</h3>
                  <p className="text-sm text-muted-foreground">lg, medium weight</p>
                </div>
                <div>
                  <h4>Heading 4 - Card Titles</h4>
                  <p className="text-sm text-muted-foreground">base, medium weight</p>
                </div>
                <div>
                  <p>Body text - Regular paragraph content with comfortable reading size and line height for optimal readability.</p>
                  <p className="text-sm text-muted-foreground mt-1">base, normal weight</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Buttons */}
        <section>
          <h2 className="mb-6">Buttons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Primary Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-primary hover:bg-primary/90">Primary Button</Button>
                <Button variant="secondary" className="w-full">Secondary Button</Button>
                <Button variant="outline" className="w-full">Outline Button</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Special States</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="destructive" className="w-full">Destructive Action</Button>
                <Button variant="ghost" className="w-full">Ghost Button</Button>
                <Button disabled className="w-full">Disabled Button</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Badges */}
        <section>
          <h2 className="mb-6">Badges & Status Indicators</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-[#22C55E] hover:bg-[#22C55E]/90">Published</Badge>
                <Badge variant="secondary">Draft</Badge>
                <Badge className="bg-[#F59E0B] hover:bg-[#F59E0B]/90">Low Stock</Badge>
                <Badge variant="destructive">Out of Stock</Badge>
                <Badge variant="outline">Inactive</Badge>
                <Badge className="bg-primary hover:bg-primary/90">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Alerts */}
        <section>
          <h2 className="mb-6">Alerts & Notifications</h2>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This is an informational alert to provide helpful context.
              </AlertDescription>
            </Alert>

            <Alert className="border-[#22C55E] bg-[#22C55E]/10">
              <CheckCircle className="h-4 w-4 text-[#22C55E]" />
              <AlertDescription>
                This is a success alert confirming a completed action.
              </AlertDescription>
            </Alert>

            <Alert className="border-[#F59E0B] bg-[#F59E0B]/10">
              <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
              <AlertDescription>
                This is a warning alert drawing attention to important information.
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                This is an error alert indicating a critical issue.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        <Separator />

        {/* Cards */}
        <section>
          <h2 className="mb-6">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Standard Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Cards have rounded corners (0.5rem), soft shadows, and a white background. 
                  They're the primary container for grouping related content.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>Interactive Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Cards can be interactive with hover effects, useful for clickable items like 
                  product cards or navigation elements.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Form Elements */}
        <section>
          <h2 className="mb-6">Form Elements</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm">Input Field</label>
                <Input placeholder="Enter text here..." />
              </div>

              <div className="space-y-2">
                <label className="text-sm">Input with Error</label>
                <Input placeholder="Invalid input" className="border-destructive" />
                <p className="text-sm text-destructive">This field is required</p>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="checkbox" className="rounded" />
                <label htmlFor="checkbox" className="text-sm">Checkbox with label</label>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Spacing & Layout */}
        <section>
          <h2 className="mb-6">Spacing & Layout Principles</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2">Container Padding</h3>
                  <p className="text-sm text-muted-foreground">
                    Main content areas use 4 (1rem) padding on mobile and 8 (2rem) on desktop
                  </p>
                </div>
                <div>
                  <h3 className="mb-2">Card Spacing</h3>
                  <p className="text-sm text-muted-foreground">
                    Cards have 6pt internal padding and 4-6pt gaps in grids
                  </p>
                </div>
                <div>
                  <h3 className="mb-2">Border Radius</h3>
                  <p className="text-sm text-muted-foreground">
                    Standard radius is 0.5rem (8px) for a modern, friendly appearance
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Accessibility */}
        <section>
          <h2 className="mb-6">Accessibility</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2">Color Contrast</h3>
                  <p className="text-sm text-muted-foreground">
                    All text meets WCAG 2.1 AA standards with minimum 4.5:1 contrast ratio
                  </p>
                </div>
                <div>
                  <h3 className="mb-2">Interactive States</h3>
                  <p className="text-sm text-muted-foreground">
                    Status is conveyed through icons, text, and color to support colorblind users
                  </p>
                </div>
                <div>
                  <h3 className="mb-2">Focus Indicators</h3>
                  <p className="text-sm text-muted-foreground">
                    All interactive elements have visible focus states for keyboard navigation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

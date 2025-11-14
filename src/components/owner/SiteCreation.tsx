import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowLeft, Eye } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { createEmptySiteDraft, demoSiteDraft, type SiteDraft } from "../../lib/site-preview";

interface SiteCreationProps {
  onBack: () => void;
  onPreview: (draft: SiteDraft) => void;
  initialDraft?: SiteDraft;
}

const buildDraftState = (draft?: SiteDraft): SiteDraft => {
  const base = { ...createEmptySiteDraft(), ...demoSiteDraft };
  const merged = draft ? { ...base, ...draft } : base;
  const defaultValues = base.values;
  const sourceValues = draft?.values;

  return {
    ...merged,
    values: [
      sourceValues?.[0] ?? defaultValues[0],
      sourceValues?.[1] ?? defaultValues[1],
      sourceValues?.[2] ?? defaultValues[2],
      sourceValues?.[3] ?? defaultValues[3],
    ],
  };
};

export function SiteCreation({ onBack, onPreview, initialDraft }: SiteCreationProps) {
  const [formData, setFormData] = useState<SiteDraft>(() => buildDraftState(initialDraft));

  useEffect(() => {
    setFormData(buildDraftState(initialDraft));
  }, [initialDraft]);

  const updateField = <K extends keyof SiteDraft>(field: K, value: SiteDraft[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateValue = (index: number, value: string) => {
    setFormData(prev => {
      const nextValues = [...prev.values];
      nextValues[index] = value;
      return { ...prev, values: nextValues as SiteDraft["values"] };
    });
  };

  const handlePreview = () => {
    if (!formData.name || !formData.title || !formData.subtitle || !formData.bannerUrl) {
      toast.error("Please fill the banner, name, title, and subtitle before previewing.");
      return;
    }

    const preparedDraft: SiteDraft = {
      ...formData,
      primaryColor: formData.primaryColor || demoSiteDraft.primaryColor,
      secondaryColor: formData.secondaryColor || demoSiteDraft.secondaryColor,
      values: [...formData.values] as SiteDraft["values"],
    };

    onPreview(preparedDraft);
    toast.success("Preview ready in a new tab");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1>Create a New Site</h1>
          <p className="text-muted-foreground">
            Provide the key storytelling elements for your storefront and preview the experience instantly.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Storefront Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="e.g. Maison Lumen"
                value={formData.name}
                onChange={event => updateField("name", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner">Banner image URL</Label>
              <Input
                id="banner"
                placeholder="https://..."
                value={formData.bannerUrl}
                onChange={event => updateField("bannerUrl", event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[2fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="logo">Logo (image URL)</Label>
              <Input
                id="logo"
                placeholder="https://..."
                value={formData.logoUrl}
                onChange={event => updateField("logoUrl", event.target.value)}
                type="url"
              />
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2 flex-shrink-0">
                <Label htmlFor="primaryColor">Primary color</Label>
                <Input
                  id="primaryColor"
                  type="color"
                  value={formData.primaryColor}
                  className="h-10 w-24 shrink-0 cursor-pointer"
                  onChange={event => updateField("primaryColor", event.target.value)}
                />
              </div>
              <div className="space-y-2 flex-shrink-0">
                <Label htmlFor="secondaryColor">Secondary color</Label>
                <Input
                  id="secondaryColor"
                  type="color"
                  value={formData.secondaryColor}
                  className="h-10 w-24 shrink-0 cursor-pointer"
                  onChange={event => updateField("secondaryColor", event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Hero headline"
                value={formData.title}
                onChange={event => updateField("title", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                placeholder="Concise elevator pitch"
                value={formData.subtitle}
                onChange={event => updateField("subtitle", event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroDescription">Hero description</Label>
            <Textarea
              id="heroDescription"
              placeholder="Two to three sentences that reinforce your brand promise"
              value={formData.heroDescription}
              onChange={event => updateField("heroDescription", event.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="portraitOne">Portrait 1 URL</Label>
              <Input
                id="portraitOne"
                placeholder="https://..."
                value={formData.aboutPortraitOneUrl}
                onChange={event => updateField("aboutPortraitOneUrl", event.target.value)}
              />
              <p className="text-xs text-muted-foreground">Shown in the about hero.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="landscape">Landscape URL</Label>
              <Input
                id="landscape"
                placeholder="https://..."
                value={formData.aboutLandscapeUrl}
                onChange={event => updateField("aboutLandscapeUrl", event.target.value)}
              />
              <p className="text-xs text-muted-foreground">Displayed with the story text.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="portraitTwo">Portrait 2 URL</Label>
              <Input
                id="portraitTwo"
                placeholder="https://..."
                value={formData.aboutPortraitTwoUrl}
                onChange={event => updateField("aboutPortraitTwoUrl", event.target.value)}
              />
              <p className="text-xs text-muted-foreground">Used on the contact card.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="history">History (short text)</Label>
            <Textarea
              id="history"
              placeholder="Share the origin story of the brand"
              value={formData.history}
              onChange={event => updateField("history", event.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-3">
            <Label>Values (4 short blurbs)</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {formData.values.map((value, index) => (
                <div key={index} className="space-y-2">
                  <Input
                    placeholder={`Value ${index + 1}`}
                    value={value}
                    onChange={event => updateValue(index, event.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactHeading">Section heading</Label>
              <Input
                id="contactHeading"
                placeholder="Visit Maison Lumen"
                value={formData.contactHeading}
                onChange={event => updateField("contactHeading", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNote">Extra note</Label>
              <Input
                id="contactNote"
                placeholder="Same-day delivery before 6 PM"
                value={formData.contactExtraNote}
                onChange={event => updateField("contactExtraNote", event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactDescription">Description</Label>
            <Textarea
              id="contactDescription"
              placeholder="Explain how customers can reach out"
              value={formData.contactDescription}
              onChange={event => updateField("contactDescription", event.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactDetails">Contact details (one per line)</Label>
            <Textarea
              id="contactDetails"
              placeholder={"📍 Address\n📧 Email\n📞 Phone"}
              value={formData.contactDetails}
              onChange={event => updateField("contactDetails", event.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to My Sites
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setFormData(buildDraftState())}
          >
            Reset to demo
          </Button>
          <Button onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            Preview site
          </Button>
        </div>
      </div>
    </div>
  );
}

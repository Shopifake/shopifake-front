import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Save, RefreshCcw, Braces, Code, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Skeleton } from "../ui/skeleton";
import { useGetSiteById, useUpdateSite } from "../../hooks/sites";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { SiteConfig } from "../../types/api/sitesApiTypes";
import {
  createEmptySiteDraft,
  draftToSiteConfig,
  siteConfigToDraft,
  type SiteDraft,
} from "../../lib/site-preview";

interface SiteConfigEditorProps {
  siteId: string;
  onBack: () => void;
}

export function SiteConfigEditor({ siteId, onBack }: SiteConfigEditorProps) {
  const { site, isLoading, refetch } = useGetSiteById(siteId);
  const { updateSite, isLoading: isSaving } = useUpdateSite();

  const [configText, setConfigText] = useState("");
  const [originalConfigText, setOriginalConfigText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"form" | "json">("form");
  const [formState, setFormState] = useState<SiteDraft>(createEmptySiteDraft());

  useEffect(() => {
    if (!site?.config) {
      return;
    }
    try {
      const parsed = JSON.parse(site.config) as SiteConfig;
      const formatted = JSON.stringify(parsed, null, 2);
      setConfigText(formatted);
      setOriginalConfigText(formatted);
      setFormState(siteConfigToDraft(parsed));
      setErrorMessage(null);
    } catch {
      setConfigText(site.config);
      setOriginalConfigText(site.config);
      setFormState(createEmptySiteDraft());
      setErrorMessage("Unable to format existing config. It might not be valid JSON.");
    }
  }, [site?.config]);

  const currentFormConfigString = useMemo(() => {
    const draftConfig = draftToSiteConfig(formState);
    return JSON.stringify(draftConfig, null, 2);
  }, [formState]);

  const hasChanges = useMemo(() => {
    if (viewMode === "json") {
      return configText !== originalConfigText;
    }
    return currentFormConfigString !== originalConfigText;
  }, [viewMode, configText, originalConfigText, currentFormConfigString]);

  const validateConfig = () => {
    try {
      const parsed = JSON.parse(configText);
      return parsed;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid JSON structure.";
      setErrorMessage(message);
      return null;
    }
  };

  const handleFormat = () => {
    const parsed = validateConfig();
    if (!parsed) {
      toast.error("Cannot format invalid JSON.");
      return;
    }
    const formatted = JSON.stringify(parsed, null, 2);
    setConfigText(formatted);
    setErrorMessage(null);
  };

  const handleReset = () => {
    setConfigText(originalConfigText);
    try {
      const parsed = JSON.parse(originalConfigText) as SiteConfig;
      setFormState(siteConfigToDraft(parsed));
      setErrorMessage(null);
    } catch {
      setErrorMessage("Unable to reset form view because the original config is invalid JSON.");
    }
  };

  const handleSave = async () => {
    let payloadConfig: SiteConfig | null = null;

    if (viewMode === "json") {
      const parsed = validateConfig();
      if (!parsed) {
        toast.error("Please fix JSON errors before saving.");
        return;
      }
      payloadConfig = parsed as SiteConfig;
    } else {
      payloadConfig = draftToSiteConfig(formState);
    }

    const payload = {
      config: JSON.stringify(payloadConfig),
    };

    const updated = await updateSite(siteId, payload);
    if (updated) {
      toast.success("Site configuration updated.");
      const formatted = JSON.stringify(payloadConfig, null, 2);
      setOriginalConfigText(formatted);
      setConfigText(formatted);
      setErrorMessage(null);
      refetch();
    }
  };

  if (isLoading || !site) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-60 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSwitchMode = (next: "form" | "json") => {
    if (next === viewMode) {
      return;
    }
    if (next === "form") {
      const parsed = viewMode === "json" ? validateConfig() : JSON.parse(currentFormConfigString);
      if (!parsed) {
        toast.error("Cannot switch to form view: invalid JSON.");
        return;
      }
      setFormState(siteConfigToDraft(parsed as SiteConfig));
      setErrorMessage(null);
      setViewMode("form");
    } else {
      const formatted = JSON.stringify(draftToSiteConfig(formState), null, 2);
      setConfigText(formatted);
      setErrorMessage(null);
      setViewMode("json");
    }
  };

  const updateFormField = <K extends keyof SiteDraft>(field: K, value: SiteDraft[K]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const updateValue = (index: number, value: string) => {
    setFormState((prev) => {
      const nextValues = [...prev.values];
      nextValues[index] = value;
      return { ...prev, values: nextValues as SiteDraft["values"] };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Site
        </Button>
        <div>
          <h1>Edit Site Config</h1>
          <p className="text-muted-foreground">Advanced storefront configuration for {site.name}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant={viewMode === "form" ? "default" : "outline"}
          className="gap-2"
          onClick={() => handleSwitchMode("form")}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Form view
        </Button>
        <Button
          variant={viewMode === "json" ? "default" : "outline"}
          className="gap-2"
          onClick={() => handleSwitchMode("json")}
        >
          <Code className="h-4 w-4" />
          JSON view
        </Button>
      </div>

      {viewMode === "json" ? (
        <Card>
          <CardHeader>
            <CardTitle>Configuration JSON</CardTitle>
            <CardDescription>Update the advanced presentation details of your storefront.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={configText}
              onChange={(event) => {
                setConfigText(event.target.value);
                setErrorMessage(null);
              }}
              rows={24}
              className="font-mono text-sm"
            />
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero & Branding</CardTitle>
              <CardDescription>Update the headline, visuals, and brand voice.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Site Name</Label>
                  <Input
                    id="name"
                    value={formState.name}
                    onChange={(event) => updateFormField("name", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    type="url"
                    value={formState.logoUrl}
                    onChange={(event) => updateFormField("logoUrl", event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bannerUrl">Hero Banner URL</Label>
                <Input
                  id="bannerUrl"
                  type="url"
                  value={formState.bannerUrl}
                  onChange={(event) => updateFormField("bannerUrl", event.target.value)}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Hero Title</Label>
                  <Input
                    id="title"
                    value={formState.title}
                    onChange={(event) => updateFormField("title", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Hero Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formState.subtitle}
                    onChange={(event) => updateFormField("subtitle", event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroDescription">Hero Description</Label>
                <Textarea
                  id="heroDescription"
                  value={formState.heroDescription}
                  onChange={(event) => updateFormField("heroDescription", event.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formState.primaryColor}
                    onChange={(event) => updateFormField("primaryColor", event.target.value)}
                    className="h-10 w-24 cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={formState.secondaryColor}
                    onChange={(event) => updateFormField("secondaryColor", event.target.value)}
                    className="h-10 w-24 cursor-pointer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About Section</CardTitle>
              <CardDescription>Edit the story visuals and copy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="aboutPortraitOneUrl">Portrait 1 URL</Label>
                  <Input
                    id="aboutPortraitOneUrl"
                    type="url"
                    value={formState.aboutPortraitOneUrl}
                    onChange={(event) => updateFormField("aboutPortraitOneUrl", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aboutLandscapeUrl">Landscape URL</Label>
                  <Input
                    id="aboutLandscapeUrl"
                    type="url"
                    value={formState.aboutLandscapeUrl}
                    onChange={(event) => updateFormField("aboutLandscapeUrl", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aboutPortraitTwoUrl">Portrait 2 URL</Label>
                  <Input
                    id="aboutPortraitTwoUrl"
                    type="url"
                    value={formState.aboutPortraitTwoUrl}
                    onChange={(event) => updateFormField("aboutPortraitTwoUrl", event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="history">Story</Label>
                <Textarea
                  id="history"
                  rows={4}
                  value={formState.history}
                  onChange={(event) => updateFormField("history", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Values</Label>
                <div className="grid gap-3 md:grid-cols-2">
                  {formState.values.map((value, index) => (
                    <Input
                      key={`value-${index}`}
                      value={value}
                      onChange={(event) => updateValue(index, event.target.value)}
                      placeholder={`Value ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Section</CardTitle>
              <CardDescription>Update contact info, CTA text, and the extra note.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactHeading">Heading</Label>
                  <Input
                    id="contactHeading"
                    value={formState.contactHeading}
                    onChange={(event) => updateFormField("contactHeading", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactExtraNote">Extra Note</Label>
                  <Input
                    id="contactExtraNote"
                    value={formState.contactExtraNote}
                    onChange={(event) => updateFormField("contactExtraNote", event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactDescription">Description</Label>
                <Textarea
                  id="contactDescription"
                  rows={3}
                  value={formState.contactDescription}
                  onChange={(event) => updateFormField("contactDescription", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactDetails">Contact Details (one per line)</Label>
                <Textarea
                  id="contactDetails"
                  rows={3}
                  value={formState.contactDetails}
                  onChange={(event) => updateFormField("contactDetails", event.target.value)}
                  placeholder={"📍 Address\n📧 Email\n📞 Phone"}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={handleReset} disabled={!hasChanges || isSaving}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Reset Changes
        </Button>
        <div className="flex flex-wrap gap-3">
          {viewMode === "json" && (
            <Button variant="outline" onClick={handleFormat} disabled={!configText}>
              <Braces className="mr-2 h-4 w-4" />
              Format JSON
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Config"}
          </Button>
        </div>
      </div>
    </div>
  );
}

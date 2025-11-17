import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { ArrowLeft, Save, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useGetSiteById, useUpdateSite, useDeleteSite, useCheckSlugAvailability, useSuggestSlug, useGetLanguages, useGetCurrencies } from "../../hooks/sites";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Skeleton } from "../ui/skeleton";
import type { Currency, Language } from "../../types/api/sitesApiTypes";
import { getSiteUrl } from "../../lib/domain-config";

interface SiteSettingsProps {
  siteId: string;
  onBack: () => void;
  onSiteDeleted?: () => void;
}

export function SiteSettings({ siteId, onBack, onSiteDeleted }: SiteSettingsProps) {
  const { site, isLoading, refetch } = useGetSiteById(siteId);
  const { updateSite, isLoading: isUpdating } = useUpdateSite();
  const { deleteSite, isLoading: isDeleting } = useDeleteSite();
  const { checkSlugAvailability } = useCheckSlugAvailability();
  const { suggestSlug } = useSuggestSlug();
  const { languages } = useGetLanguages();
  const { currencies } = useGetCurrencies();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    currency: "USD" as Currency,
    language: "EN" as Language,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState("");
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  useEffect(() => {
    if (site) {
      setFormData({
        name: site.name,
        slug: site.slug,
        description: site.description || "",
        currency: site.currency,
        language: site.language,
      });
    }
  }, [site]);

  const handleSlugChange = async (newSlug: string) => {
    setFormData(prev => ({ ...prev, slug: newSlug }));
    setSlugError(null);

    if (!newSlug || newSlug === site?.slug) {
      return;
    }

    setIsCheckingSlug(true);
    const isAvailable = await checkSlugAvailability(newSlug);
    setIsCheckingSlug(false);

    if (isAvailable === false) {
      setSlugError("This slug is already taken");
      const suggestion = await suggestSlug(newSlug);
      if (suggestion) {
        setSlugError(`This slug is taken. Suggested: ${suggestion.suggestedSlug}`);
      }
    } else if (isAvailable === true) {
      setSlugError(null);
    }
  };

  const handleSave = async () => {
    if (!site) return;

    if (slugError) {
      toast.error("Please fix the slug error before saving");
      return;
    }

    const updateData: any = {};
    if (formData.name !== site.name) updateData.name = formData.name;
    if (formData.slug !== site.slug) updateData.slug = formData.slug;
    if (formData.description !== (site.description || "")) updateData.description = formData.description;
    if (formData.currency !== site.currency) updateData.currency = formData.currency;
    if (formData.language !== site.language) updateData.language = formData.language;

    if (Object.keys(updateData).length === 0) {
      toast.info("No changes to save");
      return;
    }

    const updatedSite = await updateSite(siteId, updateData);
    if (updatedSite) {
      refetch();
    }
  };

  const handleDelete = async () => {
    if (!site) return;

    if (deleteConfirmationName !== site.name) {
      toast.error("The site name does not match. Please type the exact site name to confirm deletion.");
      return;
    }

    const success = await deleteSite(siteId);
    if (success) {
      setDeleteDialogOpen(false);
      setDeleteConfirmationName("");
      if (onSiteDeleted) {
        onSiteDeleted();
      } else {
        onBack();
      }
    }
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      setDeleteConfirmationName("");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Site not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasChanges = 
    formData.name !== site.name ||
    formData.slug !== site.slug ||
    formData.description !== (site.description || "") ||
    formData.currency !== site.currency ||
    formData.language !== site.language;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1>Site Settings</h1>
            <p className="text-muted-foreground">Manage your site configuration</p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Update your site's basic details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Site Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="My Store"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <div className="space-y-2">
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="my-store"
                className={slugError ? "border-destructive" : ""}
              />
              {isCheckingSlug && (
                <p className="text-xs text-muted-foreground">Checking availability...</p>
              )}
              {slugError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {slugError}
                </p>
              )}
                {formData.slug && !slugError && !isCheckingSlug && (
                  <p className="text-xs text-muted-foreground">
                    URL: {getSiteUrl(formData.slug)}
                  </p>
                )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="A brief description of your store"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Localization */}
      <Card>
        <CardHeader>
          <CardTitle>Localization</CardTitle>
          <CardDescription>Set your site's currency and language</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value as Currency }))}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies?.currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData(prev => ({ ...prev, language: value as Language }))}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages?.languages.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="destructive"
          onClick={() => setDeleteDialogOpen(true)}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Site
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isUpdating || !!slugError}
        >
          <Save className="h-4 w-4 mr-2" />
          {isUpdating ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={handleDeleteDialogOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <div>
                This action cannot be undone. This will permanently delete the site{" "}
                <span className="font-semibold">{site.name}</span> and all associated data.
              </div>
              <div className="space-y-2">
                <Label htmlFor="delete-confirmation" className="text-sm font-medium">
                  To confirm, please type the site name: <span className="font-semibold">{site.name}</span>
                </Label>
                <Input
                  id="delete-confirmation"
                  value={deleteConfirmationName}
                  onChange={(e) => setDeleteConfirmationName(e.target.value)}
                  placeholder="Enter site name"
                  className="w-full"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmationName("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting || deleteConfirmationName !== site.name}
            >
              {isDeleting ? "Deleting..." : "Delete Site"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


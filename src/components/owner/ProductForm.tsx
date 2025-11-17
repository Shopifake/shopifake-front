import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import {
  useCreateProduct,
  useUpdateProduct,
  useUpdateProductStatus,
  useGetProduct,
  useListCategories,
  useCreateCategory,
} from "../../hooks/catalog";
import { useCreateInventory } from "../../hooks/inventory";
import { useCreatePrice, useUpdatePrice, useGetActivePrice } from "../../hooks/pricing";
import { useGetSiteById } from "../../hooks/sites";
import type { ProductFilterRequest, ProductStatus } from "../../types/api/catalogApiTypes";

type ProductFormProps = {
  siteId: string;
  productId?: string;
  onBack: () => void;
};

const PRODUCT_STATUSES: ProductStatus[] = ["DRAFT", "PUBLISHED", "SCHEDULED"];

type FilterField = {
  key: string;
  value: string;
};

export function ProductForm({ siteId, productId, onBack }: ProductFormProps) {
  const [formState, setFormState] = useState({
    name: "",
    sku: "",
    description: "",
    imagesText: "",
    status: "DRAFT" as ProductStatus,
    scheduledPublishAt: "",
    priceAmount: "",
    priceCurrency: "",
    stockToAdd: "0",
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterField[]>([{ key: "", value: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const { site, isLoading: isLoadingSite } = useGetSiteById(siteId);
  const { categories, isLoading: isLoadingCategories, refetch: refetchCategories } = useListCategories(siteId);
  const { product, isLoading: isLoadingProduct } = useGetProduct(productId);
  const { price: activePrice, isLoading: isLoadingActivePrice } = useGetActivePrice(productId);
  const { createProduct, isLoading: isCreatingProduct } = useCreateProduct();
  const { updateProduct, isLoading: isUpdatingProduct } = useUpdateProduct();
  const { updateProductStatus, isLoading: isUpdatingStatus } = useUpdateProductStatus();
  const { createInventory, isLoading: isCreatingInventory } = useCreateInventory();
  const { createPrice, isLoading: isCreatingPrice } = useCreatePrice();
  const { updatePrice, isLoading: isUpdatingPrice } = useUpdatePrice();
  const { createCategory, isLoading: isCreatingCategory } = useCreateCategory();

  useEffect(() => {
    if (site?.currency) {
      setFormState((prev) => ({
        ...prev,
        priceCurrency: prev.priceCurrency || site.currency,
      }));
    }
  }, [site?.currency]);

  // Load existing product data when editing
  useEffect(() => {
    if (product) {
      setFormState({
        name: product.name || "",
        sku: product.sku || "",
        description: product.description || "",
        imagesText: product.images?.join("\n") || "",
        status: product.status || "DRAFT",
        scheduledPublishAt: product.scheduledPublishAt
          ? new Date(product.scheduledPublishAt).toISOString().slice(0, 16)
          : "",
        priceAmount: "",
        priceCurrency: site?.currency || "",
        stockToAdd: "0",
      });
      setSelectedCategories(product.categoryIds || []);
      setFilters(
        product.filters && product.filters.length > 0
          ? product.filters.map((f) => ({ key: f.key, value: f.value }))
          : [{ key: "", value: "" }]
      );
    }
  }, [product, site?.currency]);

  // Load active price when editing
  useEffect(() => {
    if (activePrice) {
      setFormState((prev) => ({
        ...prev,
        priceAmount: activePrice.amount.toString(),
        priceCurrency: activePrice.currency,
      }));
    }
  }, [activePrice]);

  // Load inventory when editing
  useEffect(() => {
    if (productId) {
      // Inventory will be loaded separately if needed for display
      // For now, we'll just allow adjustment in the form
    }
  }, [productId]);

  const sanitizedImages = useMemo(() => {
    return formState.imagesText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => !!line);
  }, [formState.imagesText]);

  const sanitizedFilters: ProductFilterRequest[] = useMemo(() => {
    return filters
      .filter((filter) => filter.key.trim() && filter.value.trim())
      .map((filter) => ({
        key: filter.key.trim(),
        value: filter.value.trim(),
      }));
  }, [filters]);

  const handleFilterChange = (index: number, field: keyof FilterField, value: string) => {
    setFilters((prev) => prev.map((filter, idx) => (idx === index ? { ...filter, [field]: value } : filter)));
  };

  const addFilterRow = () => {
    setFilters((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeFilterRow = (index: number) => {
    setFilters((prev) => prev.filter((_, idx) => idx !== index));
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    );
  };

  const isEditMode = Boolean(productId);
  const isSaving =
    isSubmitting ||
    isCreatingProduct ||
    isUpdatingProduct ||
    isUpdatingStatus ||
    isCreatingInventory ||
    isCreatingPrice ||
    isUpdatingPrice;
  const canCreateCategory = Boolean(newCategoryName.trim()) && !isCreatingCategory;
  const isLoading = isLoadingProduct || isLoadingSite || isLoadingCategories;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formState.name.trim()) {
      toast.error("Le nom du produit est requis.");
      return;
    }

    if (!formState.sku.trim()) {
      toast.error("Le SKU est requis.");
      return;
    }

    if (!formState.priceAmount) {
      toast.error("Le prix est requis.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && productId) {
        // Update existing product
        const updatePayload = {
          name: formState.name.trim(),
          sku: formState.sku.trim(),
          description: formState.description.trim() || undefined,
          images: sanitizedImages,
          categoryIds: selectedCategories,
          filters: sanitizedFilters,
        };

        const updatedProduct = await updateProduct(productId, updatePayload);
        if (!updatedProduct) {
          throw new Error("La mise à jour du produit a échoué.");
        }

        // Update status if changed
        if (product && product.status !== formState.status) {
          await updateProductStatus(productId, {
            status: formState.status,
            scheduledPublishAt: formState.scheduledPublishAt
              ? new Date(formState.scheduledPublishAt).toISOString()
              : undefined,
          });
        }

        // Update price if changed
        if (activePrice) {
          const newAmount = Number(formState.priceAmount);
          const newCurrency = formState.priceCurrency || site?.currency || "USD";
          if (activePrice.amount !== newAmount || activePrice.currency !== newCurrency) {
            await updatePrice(activePrice.id, {
              amount: newAmount,
              currency: newCurrency,
            });
          }
        } else {
          // Create new price if none exists
          await createPrice({
            productId,
            amount: Number(formState.priceAmount),
            currency: formState.priceCurrency || site?.currency || "USD",
          });
        }

        // In edit mode, inventory adjustments are done via the Adjust Inventory button in ProductList
        // No inventory adjustment here

        toast.success("Produit mis à jour avec succès.");
      } else {
        // Create new product
        const payload = {
          siteId,
          name: formState.name.trim(),
          sku: formState.sku.trim(),
          description: formState.description.trim() || undefined,
          images: sanitizedImages,
          categoryIds: selectedCategories,
          status: formState.status,
          scheduledPublishAt: formState.scheduledPublishAt
            ? new Date(formState.scheduledPublishAt).toISOString()
            : undefined,
          filters: sanitizedFilters,
        };

        const newProduct = await createProduct(payload);
        if (!newProduct) {
          throw new Error("La création du produit a échoué.");
        }

        const inventory = await createInventory({
          productId: newProduct.id,
          initialQuantity: Number(formState.stockToAdd) || 0,
        });

        if (!inventory) {
          throw new Error("L'initialisation de l'inventaire a échoué.");
        }

        const price = await createPrice({
          productId: newProduct.id,
          amount: Number(formState.priceAmount),
          currency: formState.priceCurrency || site?.currency || "USD",
        });

        if (!price) {
          throw new Error("L'ajout du prix a échoué.");
        }

        toast.success("Produit créé avec succès.");
      }

      refetchCategories();
      onBack();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : `Une erreur est survenue lors de ${isEditMode ? "la mise à jour" : "la création"} du produit.`;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1>{isEditMode ? "Modifier le produit" : "Ajouter un produit"}</h1>
          <p className="text-muted-foreground">
            {isLoading
              ? "Chargement..."
              : `Site cible : ${site?.name ?? siteId}${isEditMode && product ? ` - ${product.name}` : ""}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList>
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="media">Images</TabsTrigger>
            <TabsTrigger value="pricing">Prix & Stock</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
                <CardDescription>
                  Définissez les informations de base et la catégorisation du produit.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du produit</Label>
                    <Input
                      id="name"
                      value={formState.name}
                      onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="Ex. Bouquet printemps"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formState.sku}
                      onChange={(event) => setFormState((prev) => ({ ...prev, sku: event.target.value }))}
                      placeholder="PRD-001"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="status">Statut</Label>
                    <Select
                      value={formState.status}
                      onValueChange={(value) => setFormState((prev) => ({ ...prev, status: value as ProductStatus }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduledPublishAt">Publication programmée</Label>
                    <Input
                      id="scheduledPublishAt"
                      type="datetime-local"
                      value={formState.scheduledPublishAt}
                      onChange={(event) => setFormState((prev) => ({ ...prev, scheduledPublishAt: event.target.value }))}
                      disabled={formState.status !== "SCHEDULED"}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={5}
                    placeholder="Ajoutez une description détaillée..."
                    value={formState.description}
                    onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Catégories du site</CardTitle>
                <CardDescription>Sélectionnez les catégories dans lesquelles ce produit sera visible.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 space-y-3 rounded-lg border p-4">
                  <p className="text-sm font-medium">Créer une nouvelle catégorie</p>
                  <div className="flex flex-col gap-3 md:flex-row">
                    <Input
                      placeholder="Nom de la catégorie"
                      value={newCategoryName}
                      onChange={(event) => setNewCategoryName(event.target.value)}
                      disabled={isCreatingCategory}
                    />
                    <Button
                      type="button"
                      onClick={async () => {
                        if (!newCategoryName.trim()) {
                          toast.error("Veuillez saisir un nom de catégorie.");
                          return;
                        }

                        const created = await createCategory({ siteId, name: newCategoryName.trim() });
                        if (created) {
                          toast.success(`Catégorie "${created.name}" créée.`);
                          setNewCategoryName("");
                          setSelectedCategories((prev) => [...prev, created.id]);
                          refetchCategories();
                        }
                      }}
                      disabled={!canCreateCategory}
                    >
                      {isCreatingCategory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Créer
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Les catégories sont partagées par tout le site. Créez-les ici pour les réutiliser.
                  </p>
                </div>
                {isLoadingCategories ? (
                  <p className="text-sm text-muted-foreground">Chargement des catégories...</p>
                ) : categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucune catégorie n'est disponible pour ce site. Créez-en une depuis le backend pour l'utiliser ici.
                  </p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center gap-3 rounded-lg border p-3">
                        <Checkbox
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => toggleCategory(category.id)}
                        />
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Crée le {new Date(category.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Filtres personnalisés</CardTitle>
                <CardDescription>Ajoutez des attributs spécifiques (ex. couleur, matière).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {filters.map((filter, index) => (
                  <div key={`filter-${index}`} className="grid gap-3 md:grid-cols-5">
                    <div className="md:col-span-2">
                      <Label htmlFor={`filter-key-${index}`}>Nom</Label>
                      <Input
                        id={`filter-key-${index}`}
                        value={filter.key}
                        onChange={(event) => handleFilterChange(index, "key", event.target.value)}
                        placeholder="Ex. Couleur"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor={`filter-value-${index}`}>Valeur</Label>
                      <Input
                        id={`filter-value-${index}`}
                        value={filter.value}
                        onChange={(event) => handleFilterChange(index, "value", event.target.value)}
                        placeholder="Ex. Bleu nuit"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={() => removeFilterRow(index)}
                        disabled={filters.length === 1}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addFilterRow} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter un filtre
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Images produit</CardTitle>
                <CardDescription>Collez les URL des visuels (une URL par ligne).</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={8}
                  placeholder="https://exemple.com/visuel-1.jpg&#10;https://exemple.com/visuel-2.jpg"
                  value={formState.imagesText}
                  onChange={(event) => setFormState((prev) => ({ ...prev, imagesText: event.target.value }))}
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  {sanitizedImages.length} image(s) seront associées à ce produit.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Prix</CardTitle>
                <CardDescription>Définissez le prix actif à appliquer à ce produit.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price-amount">Montant</Label>
                  <Input
                    id="price-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formState.priceAmount}
                    onChange={(event) => setFormState((prev) => ({ ...prev, priceAmount: event.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price-currency">Devise</Label>
                  <Input
                    id="price-currency"
                    value={formState.priceCurrency}
                    onChange={(event) => setFormState((prev) => ({ ...prev, priceCurrency: event.target.value.toUpperCase() }))}
                    placeholder={site?.currency || "EUR"}
                  />
                </div>
              </CardContent>
            </Card>

            {!isEditMode && (
              <Card>
                <CardHeader>
                  <CardTitle>Inventaire</CardTitle>
                  <CardDescription>Définissez la quantité initiale en stock pour ce produit.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Label htmlFor="stock-to-add">Quantité initiale</Label>
                  <Input
                    id="stock-to-add"
                    type="number"
                    min="0"
                    step="1"
                    value={formState.stockToAdd}
                    onChange={(event) => {
                      const value = event.target.value;
                      // Only allow positive numbers
                      if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
                        setFormState((prev) => ({ ...prev, stockToAdd: value }));
                      }
                    }}
                    placeholder="0"
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 pt-6">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSaving}>
            Annuler
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSaving || isLoading}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Mettre à jour" : "Créer le produit"}
          </Button>
        </div>
      </form>
    </div>
  );
}

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
  useListFilters,
  useCreateFilter,
} from "../../hooks/catalog";
import { useCreateInventory } from "../../hooks/inventory";
import { useCreatePrice, useUpdatePrice, useGetActivePrice } from "../../hooks/pricing";
import { useGetSiteById } from "../../hooks/sites";
import type {
  CreateFilterRequest,
  FilterResponse,
  FilterType,
  ProductFilterAssignmentRequest,
  ProductStatus,
} from "../../types/api/catalogApiTypes";

type ProductFormProps = {
  siteId: string;
  productId?: string;
  onBack: () => void;
};

const PRODUCT_STATUSES: ProductStatus[] = ["DRAFT", "PUBLISHED", "SCHEDULED"];

type FilterAssignmentField = {
  filterId: string;
  textValue: string;
  numericValue: string;
  minValue: string;
  maxValue: string;
  startAt: string;
  endAt: string;
};

type NewFilterFormState = {
  key: string;
  displayName: string;
  type: FilterType;
  valuesText: string;
  unit: string;
  minBound: string;
  maxBound: string;
};

const createEmptyFilterAssignment = (filterId = ""): FilterAssignmentField => ({
  filterId,
  textValue: "",
  numericValue: "",
  minValue: "",
  maxValue: "",
  startAt: "",
  endAt: "",
});

const INITIAL_NEW_FILTER_FORM: NewFilterFormState = {
  key: "",
  displayName: "",
  type: "CATEGORICAL",
  valuesText: "",
  unit: "",
  minBound: "",
  maxBound: "",
};

const toInputDateTime = (value?: string) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().slice(0, 16);
};

const toISOStringIfValid = (value: string) => {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString();
};

const parseNumberOrUndefined = (value: string) => {
  if (!value.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
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
  const [filterAssignments, setFilterAssignments] = useState<FilterAssignmentField[]>([
    createEmptyFilterAssignment(),
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newFilterForm, setNewFilterForm] = useState<NewFilterFormState>(INITIAL_NEW_FILTER_FORM);

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
  const {
    filters: availableFilters,
    isLoading: isLoadingFilters,
    refetch: refetchFilters,
  } = useListFilters(siteId);
  const { createFilter, isLoading: isCreatingFilter } = useCreateFilter();

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
        scheduledPublishAt: toInputDateTime(product.scheduledPublishAt),
        priceAmount: "",
        priceCurrency: site?.currency || "",
        stockToAdd: "0",
      });
      setSelectedCategories(product.categoryIds || []);
      setFilterAssignments(
        product.filters && product.filters.length > 0
          ? product.filters.map((filter) => ({
              filterId: filter.filterId,
              textValue: filter.textValue ?? "",
              numericValue: filter.numericValue != null ? String(filter.numericValue) : "",
              minValue: filter.minValue != null ? String(filter.minValue) : "",
              maxValue: filter.maxValue != null ? String(filter.maxValue) : "",
              startAt: toInputDateTime(filter.startAt),
              endAt: toInputDateTime(filter.endAt),
            }))
          : [createEmptyFilterAssignment()]
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

  const sanitizedFilterAssignments: ProductFilterAssignmentRequest[] = useMemo(() => {
    return filterAssignments
      .filter((assignment) => assignment.filterId)
      .map((assignment) => {
        const payload: ProductFilterAssignmentRequest = {
          filterId: assignment.filterId,
        };

        if (assignment.textValue.trim()) {
          payload.textValue = assignment.textValue.trim();
        }
        const numericValue = parseNumberOrUndefined(assignment.numericValue);
        if (numericValue !== undefined) {
          payload.numericValue = numericValue;
        }
        const minValue = parseNumberOrUndefined(assignment.minValue);
        if (minValue !== undefined) {
          payload.minValue = minValue;
        }
        const maxValue = parseNumberOrUndefined(assignment.maxValue);
        if (maxValue !== undefined) {
          payload.maxValue = maxValue;
        }
        const startAt = toISOStringIfValid(assignment.startAt);
        if (startAt) {
          payload.startAt = startAt;
        }
        const endAt = toISOStringIfValid(assignment.endAt);
        if (endAt) {
          payload.endAt = endAt;
        }

        return payload;
      })
      .filter((payload) => {
        const { textValue, numericValue, minValue, maxValue, startAt, endAt } = payload;
        return Boolean(textValue ?? numericValue ?? minValue ?? maxValue ?? startAt ?? endAt);
      });
  }, [filterAssignments]);

  const handleFilterAssignmentChange = (index: number, field: keyof FilterAssignmentField, value: string) => {
    setFilterAssignments((prev) =>
      prev.map((assignment, idx) => (idx === index ? { ...assignment, [field]: value } : assignment)),
    );
  };

  const handleFilterSelection = (index: number, filterId: string) => {
    setFilterAssignments((prev) =>
      prev.map((assignment, idx) => (idx === index ? createEmptyFilterAssignment(filterId) : assignment)),
    );
  };

  const handleNewFilterTypeChange = (type: FilterType) => {
    setNewFilterForm((prev) => ({
      ...prev,
      type,
      valuesText: type === "CATEGORICAL" ? prev.valuesText : "",
      unit: type === "QUANTITATIVE" ? prev.unit : "",
      minBound: type === "QUANTITATIVE" ? prev.minBound : "",
      maxBound: type === "QUANTITATIVE" ? prev.maxBound : "",
    }));
  };

  const addFilterAssignmentRow = () => {
    setFilterAssignments((prev) => [...prev, createEmptyFilterAssignment()]);
  };

  const removeFilterAssignmentRow = (index: number) => {
    setFilterAssignments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const renderFilterValueFields = (
    definition: FilterResponse,
    assignment: FilterAssignmentField,
    index: number,
  ) => {
    switch (definition.type) {
      case "CATEGORICAL": {
        const hasPredefinedValues = (definition.values?.length ?? 0) > 0;
        return (
          <div className="space-y-2">
            <Label>Valeur</Label>
            {hasPredefinedValues ? (
              <Select
                value={assignment.textValue}
                onValueChange={(value) => handleFilterAssignmentChange(index, "textValue", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une valeur" />
                </SelectTrigger>
                <SelectContent>
                  {definition.values?.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={assignment.textValue}
                onChange={(event) => handleFilterAssignmentChange(index, "textValue", event.target.value)}
                placeholder="Saisissez une valeur"
              />
            )}
          </div>
        );
      }
      case "QUANTITATIVE": {
        const unitSuffix = definition.unit ? ` (${definition.unit})` : "";
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Valeur{unitSuffix}</Label>
              <Input
                type="number"
                value={assignment.numericValue}
                onChange={(event) => handleFilterAssignmentChange(index, "numericValue", event.target.value)}
                placeholder="Ex. 42"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Minimum</Label>
                <Input
                  type="number"
                  value={assignment.minValue}
                  onChange={(event) => handleFilterAssignmentChange(index, "minValue", event.target.value)}
                  placeholder="Min"
                />
              </div>
              <div className="space-y-2">
                <Label>Maximum</Label>
                <Input
                  type="number"
                  value={assignment.maxValue}
                  onChange={(event) => handleFilterAssignmentChange(index, "maxValue", event.target.value)}
                  placeholder="Max"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Renseignez soit une valeur simple, soit une plage de valeurs.
            </p>
          </div>
        );
      }
      case "DATETIME":
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Début</Label>
              <Input
                type="datetime-local"
                value={assignment.startAt}
                onChange={(event) => handleFilterAssignmentChange(index, "startAt", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fin</Label>
              <Input
                type="datetime-local"
                value={assignment.endAt}
                onChange={(event) => handleFilterAssignmentChange(index, "endAt", event.target.value)}
              />
            </div>
            <p className="md:col-span-2 text-xs text-muted-foreground">
              Laissez vide si la fenêtre temporelle ne s&apos;applique pas.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const getFilterTypeLabel = (type: FilterType) => {
    switch (type) {
      case "CATEGORICAL":
        return "Catégoriel";
      case "QUANTITATIVE":
        return "Quantitatif";
      case "DATETIME":
        return "Temporel";
      default:
        return type;
    }
  };

  const handleCreateFilter = async () => {
    if (!newFilterForm.key.trim()) {
      toast.error("La clé du filtre est requise.");
      return;
    }

    const payload: CreateFilterRequest = {
      siteId,
      key: newFilterForm.key.trim(),
      type: newFilterForm.type,
      displayName: newFilterForm.displayName.trim() || undefined,
    };

    if (newFilterForm.type === "CATEGORICAL") {
      const values = newFilterForm.valuesText
        .split("\n")
        .map((value) => value.trim())
        .filter(Boolean);

      if (values.length === 0) {
        toast.error("Ajoutez au moins une valeur pour ce filtre catégoriel.");
        return;
      }

      payload.values = values;
    }

    if (newFilterForm.type === "QUANTITATIVE") {
      if (newFilterForm.unit.trim()) {
        payload.unit = newFilterForm.unit.trim();
      }
      const minBound = parseNumberOrUndefined(newFilterForm.minBound);
      if (minBound !== undefined) {
        payload.minBound = minBound;
      }
      const maxBound = parseNumberOrUndefined(newFilterForm.maxBound);
      if (maxBound !== undefined) {
        payload.maxBound = maxBound;
      }
    }

    const created = await createFilter(payload);

    if (created) {
      toast.success(`Filtre "${created.displayName ?? created.key}" créé.`);
      setNewFilterForm({ ...INITIAL_NEW_FILTER_FORM });
      setFilterAssignments((prev) => {
        const emptyIndex = prev.findIndex((assignment) => !assignment.filterId);
        if (emptyIndex !== -1) {
          return prev.map((assignment, idx) =>
            idx === emptyIndex ? createEmptyFilterAssignment(created.id) : assignment,
          );
        }
        return [...prev, createEmptyFilterAssignment(created.id)];
      });
      await refetchFilters();
    }
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
  const canCreateFilter =
    Boolean(newFilterForm.key.trim()) &&
    (newFilterForm.type !== "CATEGORICAL" || Boolean(newFilterForm.valuesText.trim())) &&
    !isCreatingFilter;
  const isLoading = isLoadingProduct || isLoadingSite || isLoadingCategories || isLoadingFilters;

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
          filters: sanitizedFilterAssignments,
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
          filters: sanitizedFilterAssignments,
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
                    Aucune catégorie n'est disponible pour ce site. Utilisez le formulaire ci-dessus pour en créer une.
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
                <CardDescription>
                  Configurez et attribuez des filtres réutilisables (ex. couleur, matière, date).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium">Créer un filtre pour ce site</p>
                    <p className="text-xs text-muted-foreground">
                      Les filtres sont partagés entre tous vos produits et évitent les fautes de frappe.
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="filter-key">Clé</Label>
                      <Input
                        id="filter-key"
                        value={newFilterForm.key}
                        onChange={(event) => setNewFilterForm((prev) => ({ ...prev, key: event.target.value }))}
                        placeholder="Ex. color"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filter-display-name">Nom affiché (optionnel)</Label>
                      <Input
                        id="filter-display-name"
                        value={newFilterForm.displayName}
                        onChange={(event) =>
                          setNewFilterForm((prev) => ({ ...prev, displayName: event.target.value }))
                        }
                        placeholder="Couleur"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={newFilterForm.type} onValueChange={(value) => handleNewFilterTypeChange(value as FilterType)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CATEGORICAL">Catégoriel</SelectItem>
                          <SelectItem value="QUANTITATIVE">Quantitatif</SelectItem>
                          <SelectItem value="DATETIME">Temporel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {newFilterForm.type === "CATEGORICAL" && (
                    <div className="space-y-2">
                      <Label>Valeurs disponibles</Label>
                      <Textarea
                        rows={3}
                        placeholder={"Bleu\nRouge\nVert"}
                        value={newFilterForm.valuesText}
                        onChange={(event) => setNewFilterForm((prev) => ({ ...prev, valuesText: event.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">Une valeur par ligne.</p>
                    </div>
                  )}
                  {newFilterForm.type === "QUANTITATIVE" && (
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2 md:col-span-1">
                        <Label>Unité (optionnel)</Label>
                        <Input
                          value={newFilterForm.unit}
                          onChange={(event) => setNewFilterForm((prev) => ({ ...prev, unit: event.target.value }))}
                          placeholder="cm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Min (optionnel)</Label>
                        <Input
                          type="number"
                          value={newFilterForm.minBound}
                          onChange={(event) => setNewFilterForm((prev) => ({ ...prev, minBound: event.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max (optionnel)</Label>
                        <Input
                          type="number"
                          value={newFilterForm.maxBound}
                          onChange={(event) => setNewFilterForm((prev) => ({ ...prev, maxBound: event.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                  {newFilterForm.type === "DATETIME" && (
                    <p className="text-xs text-muted-foreground">
                      Les filtres temporels vous laisseront saisir des fenêtres de disponibilité par produit.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setNewFilterForm({ ...INITIAL_NEW_FILTER_FORM })}
                      disabled={isCreatingFilter}
                    >
                      Réinitialiser
                    </Button>
                    <Button type="button" onClick={handleCreateFilter} disabled={!canCreateFilter}>
                      {isCreatingFilter && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Créer le filtre
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Assigner des valeurs au produit</p>
                  {isLoadingFilters ? (
                    <p className="text-sm text-muted-foreground">Chargement des filtres...</p>
                  ) : availableFilters.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Créez un filtre ci-dessus pour l&apos;assigner à ce produit.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {filterAssignments.map((assignment, index) => {
                        const definition = availableFilters.find((filter) => filter.id === assignment.filterId);
                        return (
                          <div key={`filter-${index}`} className="space-y-4 rounded-lg border p-4">
                            <div className="grid gap-4 md:grid-cols-3">
                              <div className="space-y-2">
                                <Label>Filtre</Label>
                                <Select
                                  value={assignment.filterId}
                                  onValueChange={(value) => handleFilterSelection(index, value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez un filtre" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableFilters.map((filter) => (
                                      <SelectItem key={filter.id} value={filter.id}>
                                        {filter.displayName ?? filter.key} · {getFilterTypeLabel(filter.type)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="md:col-span-2">
                                {definition ? (
                                  renderFilterValueFields(definition, assignment, index)
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    Sélectionnez un filtre pour renseigner une valeur.
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Button
                                variant="ghost"
                                type="button"
                                onClick={() => removeFilterAssignmentRow(index)}
                                disabled={filterAssignments.length === 1}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addFilterAssignmentRow}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Assigner un filtre
                      </Button>
                    </div>
                  )}
                </div>
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

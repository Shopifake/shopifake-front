import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, Loader2, Package, RefreshCcw, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Skeleton } from "../ui/skeleton";
import { useGetSiteById } from "../../hooks/sites";
import { useListProducts } from "../../hooks/catalog";
import { useAdjustInventory, useListInventory } from "../../hooks/inventory";
import type { InventoryResponse } from "../../types/api/inventoryApiTypes";
import type { ProductResponse } from "../../types/api/catalogApiTypes";

const LOW_STOCK_THRESHOLD = 10;

type DerivedStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "NOT_TRACKED";
type StockFilter = "ALL" | DerivedStatus;

const FILTER_OPTIONS: { label: string; value: StockFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "In stock", value: "IN_STOCK" },
  { label: "Low stock", value: "LOW_STOCK" },
  { label: "Out of stock", value: "OUT_OF_STOCK" },
  { label: "Not tracked", value: "NOT_TRACKED" },
];

type StockRow = {
  product: ProductResponse;
  inventory: InventoryResponse | null;
  status: DerivedStatus;
};

const deriveStatus = (inventory: InventoryResponse | null): DerivedStatus => {
  if (!inventory) {
    return "NOT_TRACKED";
  }
  if (inventory.availableQuantity === 0) {
    return "OUT_OF_STOCK";
  }
  if (inventory.availableQuantity <= LOW_STOCK_THRESHOLD) {
    return "LOW_STOCK";
  }
  return "IN_STOCK";
};

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleString();
};

const StatusBadge = ({ status }: { status: DerivedStatus }) => {
  if (status === "OUT_OF_STOCK") {
    return <Badge variant="destructive">Out of stock</Badge>;
  }
  if (status === "LOW_STOCK") {
    return <Badge className="bg-[#F59E0B] hover:bg-[#F59E0B]/90">Low stock</Badge>;
  }
  if (status === "IN_STOCK") {
    return <Badge className="bg-[#22C55E] hover:bg-[#22C55E]/90">In stock</Badge>;
  }
  return <Badge variant="secondary">Not tracked</Badge>;
};

export function StockManagement({ siteId, onBack }: { siteId: string; onBack?: () => void }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StockFilter>("ALL");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quantityDelta, setQuantityDelta] = useState("");
  const [reason, setReason] = useState("");

  const { site, isLoading: isLoadingSite } = useGetSiteById(siteId);
  const { products, isLoading: isLoadingProducts } = useListProducts({ siteId });
  const { inventory, isLoading: isLoadingInventory, refetch: refetchInventory } = useListInventory();
  const { adjustInventory, isLoading: isAdjusting } = useAdjustInventory();

  const rows = useMemo<StockRow[]>(() => {
    const inventoryMap = new Map<string, InventoryResponse>();
    inventory.forEach((entry) => {
      inventoryMap.set(entry.productId, entry);
    });

    return products.map((product) => {
      const entry = inventoryMap.get(product.id) ?? null;
      return {
        product,
        inventory: entry,
        status: deriveStatus(entry),
      };
    });
  }, [inventory, products]);

  const selectedRow = useMemo(
    () => rows.find((row) => row.product.id === selectedProductId) ?? null,
    [rows, selectedProductId],
  );

  const lowStockRows = useMemo(() => rows.filter((row) => row.status === "LOW_STOCK"), [rows]);
  const outOfStockRows = useMemo(() => rows.filter((row) => row.status === "OUT_OF_STOCK"), [rows]);

  const summary = useMemo(() => {
    let totalUnits = 0;
    let trackedProducts = 0;

    rows.forEach((row) => {
      if (row.inventory) {
        trackedProducts += 1;
        totalUnits += row.inventory.availableQuantity;
      }
    });

    return {
      totalSkus: rows.length,
      trackedProducts,
      totalUnits,
      lowStock: lowStockRows.length,
      outOfStock: outOfStockRows.length,
      notTracked: rows.length - trackedProducts,
    };
  }, [rows, lowStockRows.length, outOfStockRows.length]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rows.filter(({ product, status }) => {
      const matchesSearch =
        term.length === 0 ||
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term);

      const matchesFilter = statusFilter === "ALL" || status === statusFilter;

      return matchesSearch && matchesFilter;
    });
  }, [rows, search, statusFilter]);

  const isLoadingData = isLoadingSite || isLoadingProducts || isLoadingInventory;

  const closeDialog = () => {
    setSelectedProductId(null);
    setQuantityDelta("");
    setReason("");
  };

  const handleAdjustStock = (productId: string) => {
    setSelectedProductId(productId);
    setQuantityDelta("");
    setReason("");
  };

  const handleSaveAdjustment = async () => {
    if (!selectedRow) {
      return;
    }

    const delta = Number(quantityDelta);
    if (!Number.isFinite(delta) || delta === 0) {
      toast.error("Veuillez saisir une quantité différente de zéro.");
      return;
    }

    if (!reason.trim()) {
      toast.error("Veuillez indiquer la raison de l'ajustement.");
      return;
    }

    const result = await adjustInventory(selectedRow.product.id, {
      quantityDelta: delta,
      reason: reason.trim(),
    });

    if (result) {
      toast.success(`Inventaire mis à jour. Nouveau stock: ${result.availableQuantity}`);
      closeDialog();
      refetchInventory();
    }
  };

  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to {isLoadingSite ? "Site Management" : site?.name || "Site Management"}
        </Button>
      )}

      <div className="flex flex-col gap-2">
        <h1>Stock Management - {isLoadingSite ? "Loading..." : site?.name || "Unknown site"}</h1>
        <p className="text-muted-foreground">
          Monitor inventory health, act on low stock alerts, and adjust levels across your catalog.
        </p>
      </div>

      {(lowStockRows.length > 0 || outOfStockRows.length > 0) && (
        <Card className="border-[#F59E0B]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
              <CardTitle className="text-[#F59E0B]">Attention needed</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {outOfStockRows.length} product(s) are out of stock and {lowStockRows.length} product(s) are running low.
            </p>
            <div className="flex flex-wrap gap-2">
              {[...outOfStockRows, ...lowStockRows].slice(0, 6).map((row) => (
                <Badge key={row.product.id} variant="secondary">
                  {row.product.name}
                </Badge>
              ))}
              {outOfStockRows.length + lowStockRows.length > 6 && (
                <Badge variant="outline">+{outOfStockRows.length + lowStockRows.length - 6} more</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Tracked SKUs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{summary.trackedProducts}</p>
            <p className="text-xs text-muted-foreground mt-1">{summary.totalSkus} total products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Units on hand</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{summary.totalUnits}</p>
            <p className="text-xs text-muted-foreground mt-1">Across tracked SKUs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Low stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[#F59E0B]">{summary.lowStock}</p>
            <p className="text-xs text-muted-foreground mt-1">{LOW_STOCK_THRESHOLD} units threshold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Out of stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-destructive">{summary.outOfStock}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.notTracked} product(s) not yet tracked
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by product name or SKU"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={statusFilter === option.value ? "default" : "outline"}
                  onClick={() => setStatusFilter(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={refetchInventory}
              disabled={isLoadingInventory}
            >
              {isLoadingInventory ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last update</TableHead>
                  <TableHead className="w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingData ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={`stock-skeleton-${index}`}>
                      <TableCell>
                        <Skeleton className="h-12 w-12 rounded-md" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="mt-2 h-3 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-28" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      {rows.length === 0
                        ? "No products found for this site."
                        : "No products match your current filters."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row) => {
                    const { product, inventory: inventoryRow, status } = row;
                    const firstImage = product.images?.[0];
                    const categories =
                      product.categories && product.categories.length > 0
                        ? product.categories.map((category) => category.name).join(", ")
                        : "Uncategorized";

                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          {firstImage ? (
                            <img
                              src={firstImage}
                              alt={product.name}
                              className="h-12 w-12 rounded-md object-cover"
                              onError={(event) => {
                                (event.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                              No image
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{product.name}</span>
                            <span className="text-xs text-muted-foreground">{categories}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                        <TableCell>
                          {inventoryRow ? (
                            <div>
                              <span
                                className={
                                  status === "OUT_OF_STOCK"
                                    ? "text-destructive"
                                    : status === "LOW_STOCK"
                                      ? "text-[#F59E0B]"
                                      : ""
                                }
                              >
                                {inventoryRow.availableQuantity} units
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {(inventoryRow.status || "NOT_TRACKED").replace(/_/g, " ").toLowerCase()}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not tracked</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={status} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(inventoryRow?.updatedAt || inventoryRow?.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleAdjustStock(product.id)}
                            disabled={!inventoryRow}
                          >
                            <Package className="h-4 w-4" />
                            Adjust
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedRow)} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajuster l'inventaire</DialogTitle>
            <DialogDescription>
              {selectedRow
                ? `Mettez à jour le stock pour ${selectedRow.product.name}. Utilisez une valeur positive pour ajouter du stock, négative pour en retirer.`
                : "Sélectionnez un produit à ajuster."}
            </DialogDescription>
          </DialogHeader>
          {selectedRow && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Stock actuel</span>
                  <span className="text-lg font-semibold">{selectedRow.inventory?.availableQuantity ?? 0}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Statut: {(selectedRow.inventory?.status || "NOT_TRACKED").replace(/_/g, " ").toLowerCase()}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity-delta">Variation de quantité</Label>
                <Input
                  id="quantity-delta"
                  type="number"
                  value={quantityDelta}
                  onChange={(event) => setQuantityDelta(event.target.value)}
                  placeholder="Ex: +10 pour ajouter, -5 pour retirer"
                  disabled={isAdjusting}
                />
                <p className="text-xs text-muted-foreground">
                  Saisissez une valeur positive pour ajouter du stock, négative pour en retirer.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adjust-reason">Raison de l'ajustement</Label>
                <Textarea
                  id="adjust-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={3}
                  placeholder="Réapprovisionnement, retour client, inventaire correctif..."
                  disabled={isAdjusting}
                />
              </div>
              {quantityDelta && !Number.isNaN(Number(quantityDelta)) && (
                <div className="rounded-lg border p-3 bg-blue-50 dark:bg-blue-950">
                  <p className="text-sm font-medium">Stock après ajustement</p>
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {(selectedRow.inventory?.availableQuantity ?? 0) + Number(quantityDelta)}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isAdjusting}>
              Annuler
            </Button>
            <Button onClick={handleSaveAdjustment} disabled={isAdjusting}>
              {isAdjusting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ajuster l'inventaire
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { TableCell, TableRow } from "../ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Edit, Trash2, MoreHorizontal, Loader2, Package, RefreshCcw } from "lucide-react";
import { useGetActivePrice } from "../../hooks/pricing";
import { useGetInventoryByProduct, useAdjustInventory } from "../../hooks/inventory";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import type { ProductResponse, ProductStatus } from "../../types/api/catalogApiTypes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { useUpdateProductStatus } from "../../hooks/catalog";

type ProductRowProps = {
  product: ProductResponse;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange?: () => void;
};

const PRODUCT_STATUSES: ProductStatus[] = ["DRAFT", "PUBLISHED", "SCHEDULED"];

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

export function ProductRow({ product, onEdit, onDelete, onStatusChange }: ProductRowProps) {
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [quantityDelta, setQuantityDelta] = useState("");
  const [reason, setReason] = useState("");
  const [nextStatus, setNextStatus] = useState<ProductStatus>(product.status);
  const [scheduledPublishAt, setScheduledPublishAt] = useState("");

  const { price, isLoading: isLoadingPrice } = useGetActivePrice(product.id);
  const { inventory, isLoading: isLoadingInventory, refetch: refetchInventory } = useGetInventoryByProduct(product.id);
  const { adjustInventory, isLoading: isAdjusting } = useAdjustInventory();
  const { updateProductStatus, isLoading: isUpdatingStatus } = useUpdateProductStatus();

  const firstImage = product.images && product.images.length > 0 ? product.images[0] : null;
  const categoryNames = product.categories?.map((c) => c.name).join(", ") || "Uncategorized";
  const statusDisplay = product.status.toLowerCase();
  const isPublished = product.status === "PUBLISHED";

  const handleAdjustInventory = async () => {
    const delta = Number(quantityDelta);
    if (isNaN(delta) || delta === 0) {
      toast.error("Veuillez saisir une quantité valide (différente de zéro).");
      return;
    }

    if (!reason.trim()) {
      toast.error("Veuillez saisir une raison pour cet ajustement.");
      return;
    }

    const result = await adjustInventory(product.id, {
      quantityDelta: delta,
      reason: reason.trim(),
    });

    if (result) {
      toast.success(`Inventaire ajusté avec succès. Nouveau stock: ${result.availableQuantity}`);
      setIsAdjustDialogOpen(false);
      setQuantityDelta("");
      setReason("");
      refetchInventory();
    }
  };

  const handleOpenStatusDialog = () => {
    setNextStatus(product.status);
    setScheduledPublishAt(toInputDateTime(product.scheduledPublishAt));
    setIsStatusDialogOpen(true);
  };

  const handleChangeStatus = async () => {
    if (nextStatus === "SCHEDULED" && !scheduledPublishAt) {
      toast.error("Veuillez définir une date de publication programmée.");
      return;
    }

    const payload = {
      status: nextStatus,
      scheduledPublishAt:
        nextStatus === "SCHEDULED" && scheduledPublishAt ? new Date(scheduledPublishAt).toISOString() : undefined,
    };

    const updated = await updateProductStatus(product.id, payload);
    if (updated) {
      toast.success(`Statut mis à jour: ${updated.status.toLowerCase()}`);
      setIsStatusDialogOpen(false);
      onStatusChange?.();
    }
  };

  return (
    <TableRow>
      <TableCell>
        {firstImage ? (
          <img
            src={firstImage}
            alt={product.name}
            className="h-12 w-12 rounded-md object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
      </TableCell>
      <TableCell>{product.name}</TableCell>
      <TableCell className="text-muted-foreground">{product.sku}</TableCell>
      <TableCell className="text-sm">{categoryNames}</TableCell>
      <TableCell>
        {isLoadingInventory ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : inventory ? (
          <span
            className={
              inventory.availableQuantity === 0
                ? "text-destructive"
                : inventory.availableQuantity < 20
                  ? "text-[#F59E0B]"
                  : ""
            }
          >
            {inventory.availableQuantity}
          </span>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        )}
      </TableCell>
      <TableCell>
        {isLoadingPrice ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : price ? (
          `${price.amount.toFixed(2)} ${price.currency}`
        ) : (
          <span className="text-muted-foreground">N/A</span>
        )}
      </TableCell>
      <TableCell>
        <Badge
          variant={isPublished ? "default" : "secondary"}
          className={isPublished ? "bg-[#22C55E] hover:bg-[#22C55E]/90" : ""}
        >
          {statusDisplay}
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleOpenStatusDialog}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Change status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsAdjustDialogOpen(true)}>
              <Package className="mr-2 h-4 w-4" />
              Adjust Inventory
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>

      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajuster l'inventaire</DialogTitle>
            <DialogDescription>
              Ajustez le stock pour {product.name}. Utilisez une valeur positive pour ajouter du stock, négative pour en retirer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {inventory && (
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Stock actuel</span>
                  <span className="text-lg font-semibold">{inventory.availableQuantity}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Statut: {inventory.status === "IN_STOCK" ? "En stock" : inventory.status === "OUT_OF_STOCK" ? "Rupture de stock" : "En réapprovisionnement"}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="quantity-delta">Variation de quantité</Label>
              <Input
                id="quantity-delta"
                type="number"
                value={quantityDelta}
                onChange={(e) => setQuantityDelta(e.target.value)}
                placeholder="Ex: +10 pour ajouter, -5 pour retirer"
                disabled={isAdjusting}
              />
              <p className="text-xs text-muted-foreground">
                Saisissez une valeur positive pour ajouter du stock, négative pour en retirer.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Raison de l'ajustement</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Réapprovisionnement, Retour client, Inventaire..."
                rows={3}
                disabled={isAdjusting}
              />
            </div>
            {quantityDelta && !isNaN(Number(quantityDelta)) && inventory && (
              <div className="rounded-lg border p-3 bg-blue-50 dark:bg-blue-950">
                <p className="text-sm font-medium">Stock après ajustement</p>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {inventory.availableQuantity + Number(quantityDelta)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAdjustDialogOpen(false);
                setQuantityDelta("");
                setReason("");
              }}
              disabled={isAdjusting}
            >
              Annuler
            </Button>
            <Button onClick={handleAdjustInventory} disabled={isAdjusting}>
              {isAdjusting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ajuster l'inventaire
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le statut</DialogTitle>
            <DialogDescription>
              Mettez à jour le statut de {product.name}. Utilisez l'option "Scheduled" pour planifier une publication.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={nextStatus}
                onValueChange={(value) => {
                  const typedValue = value as ProductStatus;
                  setNextStatus(typedValue);
                  if (typedValue !== "SCHEDULED") {
                    setScheduledPublishAt("");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un statut" />
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

            {nextStatus === "SCHEDULED" && (
              <div className="space-y-2">
                <Label htmlFor="schedule-date">Publication programmée</Label>
                <Input
                  id="schedule-date"
                  type="datetime-local"
                  value={scheduledPublishAt}
                  onChange={(event) => setScheduledPublishAt(event.target.value)}
                  disabled={isUpdatingStatus}
                />
                <p className="text-xs text-muted-foreground">
                  Définissez la date et l'heure auxquelles le produit sera automatiquement publié.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)} disabled={isUpdatingStatus}>
              Annuler
            </Button>
            <Button
              onClick={handleChangeStatus}
              disabled={isUpdatingStatus || (nextStatus === "SCHEDULED" && !scheduledPublishAt)}
            >
              {isUpdatingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mettre à jour le statut
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TableRow>
  );
}


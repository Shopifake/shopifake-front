import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { TableCell, TableRow } from "../ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Edit, Trash2, MoreHorizontal, Loader2, RefreshCcw } from "lucide-react";
import { useGetActivePrice } from "../../hooks/pricing";
import { useGetInventoryByProduct } from "../../hooks/inventory";
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
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<ProductStatus>(product.status);
  const [scheduledPublishAt, setScheduledPublishAt] = useState("");

  const { price, isLoading: isLoadingPrice } = useGetActivePrice(product.id);
  const { inventory, isLoading: isLoadingInventory } = useGetInventoryByProduct(product.id);
  const { updateProductStatus, isLoading: isUpdatingStatus } = useUpdateProductStatus();

  const firstImage = product.images && product.images.length > 0 ? product.images[0] : null;
  const categoryNames = product.categories?.map((c) => c.name).join(", ") || "Uncategorized";
  const statusDisplay = product.status.toLowerCase();
  const isPublished = product.status === "PUBLISHED";

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
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
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


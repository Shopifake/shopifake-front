export type InventoryStatus = "IN_STOCK" | "OUT_OF_STOCK" | "BACKORDERED";

export interface CreateInventoryRequest {
  productId: string;
  initialQuantity: number;
}

export interface AdjustInventoryRequest {
  quantityDelta: number;
  reason: string;
}

export interface InventoryResponse {
  id: string;
  productId: string;
  availableQuantity: number;
  status: InventoryStatus;
  replenishmentAt?: string;
  createdAt: string;
  updatedAt: string;
}


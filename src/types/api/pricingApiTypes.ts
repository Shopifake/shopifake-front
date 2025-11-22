export type PriceStatus = "ACTIVE" | "INACTIVE" | "EXPIRED";

export interface CreatePriceRequest {
  productId: string;
  amount: number;
  currency: string;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface UpdatePriceRequest {
  amount?: number;
  currency?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface PriceResponse {
  id: string;
  productId: string;
  amount: number;
  currency: string;
  status: PriceStatus;
  effectiveFrom?: string;
  effectiveTo?: string;
  createdAt: string;
  updatedAt: string;
}


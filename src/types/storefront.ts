import type { ProductResponse } from "./api/catalogApiTypes";
import type { InventoryResponse } from "./api/inventoryApiTypes";
import type { PriceResponse } from "./api/pricingApiTypes";
import type { MockProduct } from "../lib/mock-data";

export type StorefrontProductEntry =
  | {
      kind: "live";
      product: ProductResponse;
      price: PriceResponse | null;
      inventory: InventoryResponse | null;
    }
  | {
      kind: "mock";
      product: MockProduct;
    };


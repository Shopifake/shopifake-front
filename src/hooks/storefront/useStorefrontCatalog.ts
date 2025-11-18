import { useEffect, useState } from "react";
import { API_BASE_URL } from "../api-config";
import type { ProductResponse } from "../../types/api/catalogApiTypes";
import type { PriceResponse } from "../../types/api/pricingApiTypes";
import type { InventoryResponse } from "../../types/api/inventoryApiTypes";
import type { StorefrontProductEntry } from "../../types/storefront";

type FetchState = "idle" | "loading";

const fetchJsonSafely = async <T,>(url: string): Promise<T | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error(`Failed to fetch ${url}`, error);
    return null;
  }
};

export function useStorefrontCatalog(siteId?: string, enabled = true) {
  const [products, setProducts] = useState<StorefrontProductEntry[]>([]);
  const [status, setStatus] = useState<FetchState>("idle");

  useEffect(() => {
    if (!siteId || !enabled) {
      setProducts([]);
      setStatus("idle");
      return;
    }

    let cancelled = false;
    const fetchCatalog = async () => {
      setStatus("loading");
      try {
        const query = `?siteId=${encodeURIComponent(siteId)}`;
        const response = await fetch(`${API_BASE_URL}/api/catalog/products/public${query}`);

        if (!response.ok) {
          console.error("Failed to fetch storefront products", await response.text());
          if (!cancelled) {
            setProducts([]);
          }
          return;
        }

        const data = (await response.json()) as ProductResponse[];
        const enriched: StorefrontProductEntry[] = await Promise.all(
          data.map(async (product) => {
            const [price, inventory] = await Promise.all([
              fetchJsonSafely<PriceResponse>(`${API_BASE_URL}/api/prices/product/${product.id}/active`),
              fetchJsonSafely<InventoryResponse>(`${API_BASE_URL}/api/inventory/${product.id}`),
            ]);

            return {
              kind: "live",
              product,
              price,
              inventory,
            } satisfies StorefrontProductEntry;
          }),
        );

        if (!cancelled) {
          setProducts(enriched);
        }
      } catch (error) {
        console.error("Unable to load storefront catalog", error);
        if (!cancelled) {
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setStatus("idle");
        }
      }
    };

    fetchCatalog();

    return () => {
      cancelled = true;
    };
  }, [siteId, enabled]);

  return {
    products,
    isLoading: status === "loading",
  };
}


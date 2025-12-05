import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type CreateProductRequest,
  type ProductResponse,
  type ProductStatus,
  type UpdateProductRequest,
  type UpdateProductStatusRequest,
} from "../../types/api/catalogApiTypes";
import { API_BASE_URL } from "../api-config";

const buildQueryString = (params: Record<string, string | undefined>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.append(key, value);
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
};

const extractErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    if (data?.message) {
      return data.message as string;
    }
  } catch {
    // ignore JSON parse errors
  }
  return response.statusText || "Une erreur est survenue";
};

export function useListProducts(params: { siteId?: string; status?: ProductStatus } = {}) {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const siteId = params.siteId;
  const status = params.status;

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const query = buildQueryString({ siteId, status });
      const response = await fetch(`${API_BASE_URL}/api/catalog/products${query}`);

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      const data = (await response.json()) as ProductResponse[];
      setProducts(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Impossible de récupérer les produits");
      setError(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [siteId, status]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, isLoading, error, refetch: fetchProducts };
}

export function useListPublicProducts(siteId?: string) {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const query = buildQueryString({ siteId });
      const response = await fetch(`${API_BASE_URL}/api/catalog/products/public${query}`);

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      const data = (await response.json()) as ProductResponse[];
      setProducts(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Impossible de récupérer les produits publics");
      setError(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, isLoading, error, refetch: fetchProducts };
}

export function useGetProduct(productId?: string) {
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setProduct(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/catalog/products/${productId}`);

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      const data = (await response.json()) as ProductResponse;
      setProduct(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Impossible de récupérer le produit");
      setError(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, isLoading, error, refetch: fetchProduct };
}

export function useCreateProduct() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createProduct = async (payload: CreateProductRequest): Promise<ProductResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/catalog/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      const product = (await response.json()) as ProductResponse;
      return product;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Impossible de créer le produit");
      setError(error);
      toast.error(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createProduct, isLoading, error };
}

export function useUpdateProduct() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateProduct = async (productId: string, payload: UpdateProductRequest): Promise<ProductResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/catalog/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      const product = (await response.json()) as ProductResponse;
      return product;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Impossible de mettre à jour le produit");
      setError(error);
      toast.error(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateProduct, isLoading, error };
}

export function useUpdateProductStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateProductStatus = async (
    productId: string,
    payload: UpdateProductStatusRequest,
  ): Promise<ProductResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/catalog/products/${productId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      const product = (await response.json()) as ProductResponse;
      return product;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Impossible de mettre à jour le statut du produit");
      setError(error);
      toast.error(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateProductStatus, isLoading, error };
}

export function useDeleteProduct() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteProduct = async (productId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/catalog/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Impossible de supprimer le produit");
      setError(error);
      toast.error(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteProduct, isLoading, error };
}


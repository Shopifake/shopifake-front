import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { CategoryResponse, CreateCategoryRequest } from "../../types/api/catalogApiTypes";
import { API_BASE_URL } from "../api-config";

const extractErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    if (data?.message) {
      return data.message as string;
    }
  } catch {
    // ignore JSON parsing errors
  }
  return response.statusText || "Une erreur est survenue";
};

export function useListCategories(siteId?: string) {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const query = siteId ? `?siteId=${encodeURIComponent(siteId)}` : "";
      const response = await fetch(`${API_BASE_URL}/api/catalog/products/categories${query}`);

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      const data = (await response.json()) as CategoryResponse[];
      setCategories(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Impossible de récupérer les catégories");
      setError(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, isLoading, error, refetch: fetchCategories };
}

export function useCreateCategory() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createCategory = async (payload: CreateCategoryRequest): Promise<CategoryResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/catalog/products/categories`, {
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

      const category = (await response.json()) as CategoryResponse;
      return category;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Impossible de créer la catégorie");
      setError(error);
      toast.error(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createCategory, isLoading, error };
}

export function useDeleteCategory() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteCategory = async (categoryId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/catalog/products/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Impossible de supprimer la catégorie");
      setError(error);
      toast.error(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteCategory, isLoading, error };
}


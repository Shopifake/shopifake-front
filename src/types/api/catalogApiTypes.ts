export type ProductStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED";

export interface ProductFilterRequest {
  key: string;
  value: string;
}

export interface ProductFilterResponse extends ProductFilterRequest {
  id: string;
}

export interface CategoryResponse {
  id: string;
  siteId: string;
  name: string;
  createdAt: string;
}

export interface CreateCategoryRequest {
  siteId: string;
  name: string;
}

export interface CreateProductRequest {
  siteId: string;
  name: string;
  description?: string;
  images?: string[];
  categoryIds?: string[];
  sku: string;
  status?: ProductStatus;
  scheduledPublishAt?: string;
  filters?: ProductFilterRequest[];
}

export interface ProductResponse {
  id: string;
  siteId: string;
  name: string;
  description?: string;
  images: string[];
  categoryIds: string[];
  sku: string;
  status: ProductStatus;
  scheduledPublishAt?: string;
  filters: ProductFilterResponse[];
  categories: CategoryResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  images?: string[];
  categoryIds?: string[];
  sku?: string;
  filters?: ProductFilterRequest[];
}

export interface UpdateProductStatusRequest {
  status: ProductStatus;
  scheduledPublishAt?: string;
}


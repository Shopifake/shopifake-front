export type ProductStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED";

export type FilterType = "CATEGORICAL" | "QUANTITATIVE" | "DATETIME";

export interface CreateFilterRequest {
  siteId: string;
  key: string;
  type: FilterType;
  displayName?: string;
  values?: string[];
  unit?: string;
  minBound?: number;
  maxBound?: number;
}

export interface FilterResponse {
  id: string;
  siteId: string;
  key: string;
  type: FilterType;
  displayName?: string;
  values?: string[];
  unit?: string;
  minBound?: number;
  maxBound?: number;
  createdAt: string;
}

export interface ProductFilterAssignmentRequest {
  filterId: string;
  textValue?: string;
  numericValue?: number;
  minValue?: number;
  maxValue?: number;
  startAt?: string;
  endAt?: string;
}

export interface ProductFilterAssignmentResponse {
  filterId: string;
  key: string;
  displayName?: string;
  type: FilterType;
  unit?: string;
  textValue?: string;
  numericValue?: number;
  minValue?: number;
  maxValue?: number;
  startAt?: string;
  endAt?: string;
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
  filters?: ProductFilterAssignmentRequest[];
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
  filters: ProductFilterAssignmentResponse[];
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
  filters?: ProductFilterAssignmentRequest[];
}

export interface UpdateProductStatusRequest {
  status: ProductStatus;
  scheduledPublishAt?: string;
}


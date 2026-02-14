
export interface APISuccessResponse<T> {
    code: string;
    data: T;
    message: string;
    reqId: string;
    statusCode: number;
    success: true;
}

export interface ApiErrorResponse {
    code: string;
    message: string;
    reqId: string;
    statusCode: number;
    success: false;
}


export interface ProjectQueryParams {
  status?: string;
  minBudget?: number;
  maxBudget?: number;
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
  includeProgress?:boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  projectType: {
    id: string;
    label: string;
    value: string;
  };
  status: 'draft' | 'posted' | 'in_progress' | 'completed' | 'cancelled';
  location: string;
  budgetRange: {
    id: string;
    label: string;
    value: string;
  };
  timeline: {
    id: string;
    label: string;
    value: string;
  };
  startDate: string;
  endDate: string;
  applicationDeadline: string | null;
  requiredSkills: string[] | null;
  image: string | null;
  attachedDocuments: any[];
  bidCount: number;
  createdAt: string;
}

export type ApiResponse<T> = APISuccessResponse<T> | ApiErrorResponse;

/** Marketplace property (v1/marketplace response item) */
export interface MarketplaceProperty {
  id: string;
  title?: string;
  description?: string;
  location?: string;
  price?: number | string;
  amount?: number | string;
  image?: string | null;
  images?: string[];
  propertyType?: string | { id: string; label: string; value: string };
  bedrooms?: number;
  bathrooms?: number;
  area?: number | string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

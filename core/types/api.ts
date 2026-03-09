
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

// ─────────────────────────────────────────────────────────
//  Add these to your existing @/core/types/api.ts file
// ─────────────────────────────────────────────────────────

export type PaymentStatus =
  | 'instruction_sent'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'reversed'
  | 'cancelled'

export interface PaymentInstructionQueryParams {
  page?: number
  limit?: number
  status?: PaymentStatus
  projectId?: string   // uuid
}

export interface PaymentInstruction {
  id: string
  projectId: string
  milestoneId: string
  amount: number
  currency: string
  status: PaymentStatus
  instructionSentAt?: string   // ISO datetime
  statusUpdatedAt?: string
  paidAt?: string
  cancelledAt?: string
  note?: string
  statusUpdateNote?: string
  createdAt?: string
  updatedAt?: string

  project?: {
    id: string
    title: string
  }

  milestone?: {
    id: string
    name: string
    completionDate?: string    // "YYYY-MM-DD"
  }

  client?: {
    id: string
    name: string
    email: string
  }

  builder?: {
    id: string
    name: string
    email: string
  }
}


export interface PaymentInstructionsApiResponse {
  code: string
  message: string
  reqId: string
  statusCode: number
  success: boolean
  data: {
    instructions: PaymentInstruction[]
    pagination: {
      currentPage: number
      totalItems: number
      itemsPerPage: number
      totalPages: number
      hasNextPage: boolean
      hasPreviousPage: boolean
    }
  }
}

// ─────────────────────────────────────────────────────────
//  Add these to your existing @/core/types/api.ts file
// ─────────────────────────────────────────────────────────

export type FundingStatus =
  | 'pending_verification'
  | 'verified'
  | 'rejected'
  | 'cancelled'

export interface FundingLogQueryParams {
  page?: number
  limit?: number
  status?: FundingStatus
}

export interface ProofDocument {
  id: string
  fileName: string
  originalName: string
  mimeType: string
  fileSize: number
  publicUrl: string
}

export interface FundingLog {
  id: string
  amount: number
  currency: string
  paymentDate: string          // "YYYY-MM-DD"
  reference: string
  note?: string
  status: FundingStatus
  statusUpdatedAt?: string     // ISO datetime
  verifiedAt?: string
  statusUpdateNote?: string
  proofDocument?: ProofDocument
  createdAt?: string
  updatedAt?: string
}

/* Full API response shape */
export interface FundingLogsApiResponse {
  code: string
  message: string
  reqId: string
  statusCode: number
  success: boolean
  data: {
    fundings: FundingLog[]
    pagination: {
      currentPage: number
      totalItems: number
      itemsPerPage: number
      totalPages: number
      hasNextPage: boolean
      hasPreviousPage: boolean
    }
  }
}
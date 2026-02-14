export interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
  statusDetails: {
    id: string;
    label: string;
    value: string;
    description: string;
    color: string;
    isFinalStatus: boolean;
  };
  projectType: {
    id: string;
    label: string;
    value: string;
  };
  timeline: {
    id: string;
    label: string;
    value: string;
    description: string;
  };
  budgetRange: {
    id: string;
    label: string;
    value: string;
    minAmount: string;
    maxAmount: string;
    description: string;
  };
}

export interface ProjectsResponse {
  code: string;
  data: {
    projects: Project[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      nextPage: number | null;
      previousPage: number | null;
    };
    filters: {
      includeProgress: boolean;
    };
  };
  message: string;
  reqId: string;
  statusCode: number;
  success: boolean;
}






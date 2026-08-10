export interface ServiceCategory {
  readonly id: number;
  readonly organizationId: number;
  readonly name: string;
  readonly description: string | null;
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ServiceCategoryRequest {
  readonly name: string;
  readonly description: string | null;
  readonly active: boolean | null;
}

export interface CatalogService {
  readonly id: number;
  readonly organizationId: number;
  readonly categoryId: number | null;
  readonly name: string;
  readonly description: string | null;
  readonly durationMinutes: number;
  readonly preparationMinutes: number;
  readonly cleanupMinutes: number;
  readonly price: number | null;
  readonly currencyCode: string;
  readonly requiresApproval: boolean;
  readonly allowsOnlineBooking: boolean;
  readonly active: boolean;
  readonly colorCode: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CatalogServiceRequest {
  readonly categoryId: number | null;
  readonly name: string;
  readonly description: string | null;
  readonly durationMinutes: number;
  readonly preparationMinutes: number | null;
  readonly cleanupMinutes: number | null;
  readonly price: number | null;
  readonly currencyCode: string | null;
  readonly requiresApproval: boolean | null;
  readonly allowsOnlineBooking: boolean | null;
  readonly active: boolean | null;
  readonly colorCode: string | null;
}

export interface BranchServiceAssignment {
  readonly branchId: number;
  readonly serviceId: number;
  readonly serviceName: string;
  readonly active: boolean;
  readonly createdAt: string;
}

export interface BranchServiceAssignmentRequest {
  readonly active: boolean | null;
}

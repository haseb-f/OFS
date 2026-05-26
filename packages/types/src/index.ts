// ── Tenant ────────────────────────────────────────────────────────────────────

export interface ITenant {
  id: string;
  name: string;
  nameAr: string;
  subdomain: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITenantContext {
  readonly tenantId: string;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface IAuthenticatedUser {
  userId: string;
  email: string;
  role: string;
}

export interface ITenantUser {
  id: string;
  tenantId: string;
  userId: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
}

// ── API Response Envelope ─────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  requestId: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    messageAr: string;
    message: string;
    fields?: Record<string, string[]>;
  };
  requestId: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ── Pagination ────────────────────────────────────────────────────────────────

export interface CursorPaginationRequest {
  cursor?: string;
  limit: number;
}

export interface OffsetPaginationRequest {
  page: number;
  pageSize: number;
}

export interface CursorPaginationResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface OffsetPaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Status & Workflow ─────────────────────────────────────────────────────────

export interface StatusConfig<TStatus extends string> {
  labelAr: string;
  label: string;
  colour: string;
  allowedTransitions: TStatus[];
}

export type StatusConfigMap<TStatus extends string> = Record<TStatus, StatusConfig<TStatus>>;

export interface WorkflowTransitionContext {
  actorId: string;
  tenantId: string;
  requestId: string;
  resourceType: string;
  resourceId: string;
  reason?: string;
}

// ── Audit ─────────────────────────────────────────────────────────────────────

export interface AuditEvent {
  tenantId: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  requestId: string;
  ipAddress?: string;
}

// ── RBAC ──────────────────────────────────────────────────────────────────────

export const PERMISSIONS = {
  // Tenant
  TENANT_READ: 'TENANT:READ',
  TENANT_WRITE: 'TENANT:WRITE',
  // User
  USER_READ: 'USER:READ',
  USER_INVITE: 'USER:INVITE',
  USER_REMOVE: 'USER:REMOVE',
  // Settings
  SETTINGS_READ: 'SETTINGS:READ',
  SETTINGS_WRITE: 'SETTINGS:WRITE',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ── Utility Types ─────────────────────────────────────────────────────────────

export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

export type Prettify<T> = { [K in keyof T]: T[K] } & {};

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Exhaustiveness checker — use in default switch branches */
export function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${String(x)}`);
}

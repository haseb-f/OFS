export interface PermissionResponse {
  id: string;
  resource: string;
  action: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

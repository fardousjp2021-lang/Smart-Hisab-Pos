export function getActiveWorkspaceId(): string {
  try {
    return localStorage.getItem('nexus_workspace_id') || 'default';
  } catch {
    return 'default';
  }
}

export function withWorkspaceId<T extends Record<string, any>>(data: T, workspaceId?: string): T & { workspaceId: string } {
  return {
    ...data,
    workspaceId: workspaceId || getActiveWorkspaceId()
  };
}

export const BUSINESS_COLLECTIONS = [
  'products',
  'sales',
  'customers',
  'suppliers',
  'purchases',
  'quotations',
  'expenses'
];

export const DATA_SCHEMA_VERSION = '1.0.0';

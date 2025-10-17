export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
}

export interface UserRole {
  id: string
  user_id: string
  role_id: string
  created_at: string
}

export type Permission = 
  | 'admin:read'
  | 'admin:write' 
  | 'admin:delete'
  | 'stores:read'
  | 'stores:write'
  | 'stores:delete'
  | 'products:read'
  | 'products:write'
  | 'products:delete'
  | 'orders:read'
  | 'orders:write'
  | 'orders:delete'

export const ROLES = {
  ADMIN: 'admin',
  STORE_OWNER: 'store_owner', 
  CUSTOMER: 'customer'
} as const

export type RoleName = typeof ROLES[keyof typeof ROLES]

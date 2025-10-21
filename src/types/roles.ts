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
  | 'orders:update'
  | 'orders:create'
  | 'orders:delete'
  | 'reviews:read'
  | 'reviews:write'
  | 'reviews:delete'
  | 'tracking:read'
  | 'tracking:write'
  | 'location:write'
  | 'profile:read'
  | 'profile:write'
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'analytics:read'
  | 'analytics:write'
  | 'disputes:read'
  | 'disputes:write'

export const ROLES = {
  ADMIN: 'admin',
  STORE_OWNER: 'store_owner', 
  CUSTOMER: 'customer',
  CLIENTE: 'cliente',
  TIENDA: 'tienda',
  REPARTIDOR: 'repartidor',
  MODERADOR: 'moderador'
} as const

export type RoleName = typeof ROLES[keyof typeof ROLES]

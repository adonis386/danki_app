import { createClient } from '@/lib/supabase/client'
import { Role, UserRole, Permission, ROLES } from '@/types/roles'

export class RoleService {
  private supabase = createClient()

  // Obtener todos los roles
  async getRoles(): Promise<Role[]> {
    const { data, error } = await this.supabase
      .from('roles')
      .select('*')
      .order('name')

    if (error) {
      throw new Error(`Error al obtener roles: ${error.message}`)
    }

    return data || []
  }

  // Obtener rol por ID
  async getRoleById(id: string): Promise<Role | null> {
    const { data, error } = await this.supabase
      .from('roles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Error al obtener rol: ${error.message}`)
    }

    return data
  }

  // Obtener rol por nombre
  async getRoleByName(name: string): Promise<Role | null> {
    const { data, error } = await this.supabase
      .from('roles')
      .select('*')
      .eq('name', name)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Error al obtener rol: ${error.message}`)
    }

    return data
  }

  // Obtener rol del usuario actual
  async getUserRole(userId: string): Promise<Role | null> {
    const { data, error } = await this.supabase
      .from('user_roles')
      .select(`
        role_id,
        roles (
          id,
          name,
          description,
          permissions
        )
      `)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.log('Error al obtener rol del usuario:', error)
      if (error.code === 'PGRST116') {
        return null
      }
      // No lanzar error, solo retornar null
      return null
    }

    return data?.roles || null
  }

  // Asignar rol a usuario
  async assignRoleToUser(userId: string, roleId: string): Promise<UserRole> {
    const { data, error } = await this.supabase
      .from('user_roles')
      .insert([{ user_id: userId, role_id: roleId }])
      .select()
      .single()

    if (error) {
      throw new Error(`Error al asignar rol: ${error.message}`)
    }

    return data
  }

  // Actualizar rol de usuario
  async updateUserRole(userId: string, roleId: string): Promise<UserRole> {
    const { data, error } = await this.supabase
      .from('user_roles')
      .update({ role_id: roleId })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Error al actualizar rol: ${error.message}`)
    }

    return data
  }

  // Verificar si usuario tiene permiso
  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('user_roles')
      .select(`
        roles (
          permissions
        )
      `)
      .eq('user_id', userId)
      .single()

    if (error || !data?.roles) {
      return false
    }

    const permissions: string[] = data.roles.permissions || []
    return permissions.includes(permission)
  }

  // Obtener permisos del usuario
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const { data, error } = await this.supabase
      .from('user_roles')
      .select(`
        roles (
          permissions
        )
      `)
      .eq('user_id', userId)
      .single()

    if (error || !data?.roles) {
      return []
    }

    return data.roles.permissions || []
  }

  // Verificar si usuario es admin
  async isAdmin(userId: string): Promise<boolean> {
    const role = await this.getUserRole(userId)
    return role?.name === ROLES.ADMIN
  }

  // Verificar si usuario es store owner
  async isStoreOwner(userId: string): Promise<boolean> {
    const role = await this.getUserRole(userId)
    return role?.name === ROLES.STORE_OWNER
  }

  // Verificar si usuario es customer
  async isCustomer(userId: string): Promise<boolean> {
    const role = await this.getUserRole(userId)
    return role?.name === ROLES.CUSTOMER
  }
}

// Instancia singleton del servicio
export const roleService = new RoleService()

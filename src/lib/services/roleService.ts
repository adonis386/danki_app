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

    // Si data.roles es un array, tomamos el primer elemento, sino retornamos el objeto
    const rolesData: any = data?.roles
    if (rolesData) {
      return Array.isArray(rolesData) ? rolesData[0] : rolesData
    }
    return null
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

    const rolesData: any = data.roles
    const permissions: string[] = Array.isArray(rolesData) 
      ? rolesData[0]?.permissions || []
      : rolesData?.permissions || []
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

    const rolesData: any = data.roles
    return Array.isArray(rolesData)
      ? rolesData[0]?.permissions || []
      : rolesData?.permissions || []
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

  // Verificar si usuario es tienda
  async isTienda(userId: string): Promise<boolean> {
    const role = await this.getUserRole(userId)
    return role?.name === ROLES.TIENDA
  }

  // Verificar si usuario es repartidor
  async isRepartidor(userId: string): Promise<boolean> {
    const role = await this.getUserRole(userId)
    return role?.name === ROLES.REPARTIDOR
  }

  // Verificar si usuario es moderador
  async isModerador(userId: string): Promise<boolean> {
    const role = await this.getUserRole(userId)
    return role?.name === ROLES.MODERADOR
  }

  // Verificar si usuario es cliente
  async isCliente(userId: string): Promise<boolean> {
    const role = await this.getUserRole(userId)
    return role?.name === ROLES.CLIENTE
  }

  // Obtener tienda asociada al usuario
  async getTiendaByUserId(userId: string): Promise<{ id: string; nombre: string } | null> {
    const { data, error } = await this.supabase
      .from('user_roles')
      .select(`
        tienda_id,
        tiendas (
          id,
          nombre
        )
      `)
      .eq('user_id', userId)
      .single()

    if (error || !data?.tiendas) {
      return null
    }

    const tiendasData: any = data.tiendas
    return Array.isArray(tiendasData) ? tiendasData[0] : tiendasData
  }

  // Obtener repartidor asociado al usuario
  async getRepartidorByUserId(userId: string): Promise<{ id: string; nombre: string } | null> {
    const { data, error } = await this.supabase
      .from('user_roles')
      .select(`
        repartidor_id,
        repartidores (
          id,
          nombre
        )
      `)
      .eq('user_id', userId)
      .single()

    if (error || !data?.repartidores) {
      return null
    }

    const repartidoresData: any = data.repartidores
    return Array.isArray(repartidoresData) ? repartidoresData[0] : repartidoresData
  }
}

// Instancia singleton del servicio
export const roleService = new RoleService()

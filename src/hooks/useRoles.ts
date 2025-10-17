'use client'

import { useState, useEffect, useCallback } from 'react'
import { roleService } from '@/lib/services/roleService'
import { Role, Permission, ROLES } from '@/types/roles'
import { useAuth } from './useAuth'
import { useNotification } from './useNotification'

export function useUserRole() {
  const { user } = useAuth()
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const { showError } = useNotification()

  const fetchUserRole = useCallback(async () => {
    if (!user?.id) {
      setUserRole(null)
      setPermissions([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const role = await roleService.getUserRole(user.id)
      const userPermissions = await roleService.getUserPermissions(user.id)
      
      setUserRole(role)
      setPermissions(userPermissions)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      showError('Error al cargar rol', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user?.id, showError])

  useEffect(() => {
    fetchUserRole()
  }, [fetchUserRole])

  const hasPermission = useCallback((permission: Permission): boolean => {
    return permissions.includes(permission)
  }, [permissions])

  const isAdmin = useCallback((): boolean => {
    return userRole?.name === ROLES.ADMIN
  }, [userRole])

  const isStoreOwner = useCallback((): boolean => {
    return userRole?.name === ROLES.STORE_OWNER
  }, [userRole])

  const isCustomer = useCallback((): boolean => {
    return userRole?.name === ROLES.CUSTOMER
  }, [userRole])

  const canManageStores = useCallback((): boolean => {
    return hasPermission('stores:write') || isAdmin()
  }, [hasPermission, isAdmin])

  const canManageProducts = useCallback((): boolean => {
    return hasPermission('products:write') || isAdmin()
  }, [hasPermission, isAdmin])

  const canManageUsers = useCallback((): boolean => {
    return hasPermission('admin:write') || isAdmin()
  }, [hasPermission, isAdmin])

  return {
    userRole,
    permissions,
    loading,
    hasPermission,
    isAdmin,
    isStoreOwner,
    isCustomer,
    canManageStores,
    canManageProducts,
    canManageUsers,
    refetch: fetchUserRole,
  }
}

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const { showError } = useNotification()

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true)
      const data = await roleService.getRoles()
      setRoles(data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      showError('Error al cargar roles', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  return {
    roles,
    loading,
    refetch: fetchRoles,
  }
}

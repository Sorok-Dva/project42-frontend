import { Role, useUser } from '../contexts/UserContext'
import { hasPermission } from '../helpers/permissionHelper'
import { Categories } from '../config/permissions'

export const usePermissions = () => {
  const { user } = useUser()

  const checkPermission = (
    category: Categories<Role>,
    permission: string
  ): boolean => {
    // @TODO: Fix this
    // @ts-ignore
    return hasPermission(user?.role || 'User', category, permission)
  }

  return { checkPermission }
}

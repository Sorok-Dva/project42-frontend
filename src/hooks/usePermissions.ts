import { useUser } from '../contexts/UserContext'
import { hasPermission } from '../helpers/permissionHelper'
import { Categories } from '../config/permissions'
import { Role } from 'types/user'

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

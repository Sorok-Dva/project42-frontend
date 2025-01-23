import {
  ROLE_PERMISSIONS,
  Roles,
  Categories,
  Permission
} from '../config/permissions'

export function hasPermission<
  R extends Roles,
  C extends Categories<R>
>(
  role: R,
  category: C,
  permission: Permission<R, C>
): boolean {
  const perms = ROLE_PERMISSIONS[role][category]
  // @TODO: Fix this
  // @ts-ignore
  return perms.includes(permission)
}

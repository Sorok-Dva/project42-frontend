import { User } from 'types/user'

const rolesHierarchy = [
  'SuperAdmin',
  'Admin',
  'Developer',
  'Moderator',
  'ModeratorTest',
  'Animator',
  'User',
] as const

export type RoleName = typeof rolesHierarchy[number]

export const rolify = (role: string, isMale = true) => {
  switch (role) {
  case 'SuperAdmin':
    return {
      name: 'Fondateur',
      color: '#982726',
    }
  case 'Admin':
    return {
      name: isMale ? 'Administrateur' : 'Administratrice',
      color: '#982726',
    }
  case 'Developers':
    return {
      name: isMale ? 'Développeur' : 'Développeuse',
      color: 'blue',
    }
  case 'Moderator':
    return {
      name: isMale ? 'Modérateur' : 'Modératrice',
      color: 'green',
    }
  case 'ModeratorTest':
    return {
      name: isMale ? 'Modérateur en test' : 'Modératrice en test',
      color: 'green',
    }
  case 'Animator':
    return {
      name: isMale ? 'Animateur' : 'Animatrice',
      color: '#c8c80e',
    }
  case 'User':
    return {
      name: isMale ? 'Joueur' : 'Joueuse',
      color: isMale ? '#2baaf7' : '#e15fc3',
    }
  default:
    return null
  }
}

export function hasRole (user: User, requiredRole: RoleName) {
  const requiredIndex = rolesHierarchy.indexOf(requiredRole)
  if (requiredIndex === -1) return false

  if (!user || !user.role) {
    return false
  }

  const userRoleName = user.role as RoleName
  const userIndex = rolesHierarchy.indexOf(userRoleName)

  // Si l’utilisateur est dans la hiérarchie et qu’il est "au-dessus"
  if (userIndex !== -1 && userIndex <= requiredIndex) {
    return true
  }

  return false
}

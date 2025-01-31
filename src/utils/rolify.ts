export const rolify = (role: string) => {
  switch (role) {
  case 'SuperAdmin':
    return {
      name: 'Fondateur',
      color: '#982726',
    }
  case 'Admin':
    return {
      name: 'Administrateur',
      color: '#982726',
    }
  case 'Developers':
    return {
      name: 'Développeur',
      color: 'blue',
    }
  case 'Moderator':
    return {
      name: 'Modérateur',
      color: 'green',
    }
  case 'ModeratorTest':
    return {
      name: 'Modérateur en test',
      color: 'green',
    }
  case 'Animator':
    return {
      name: 'Animateur',
      color: '#c8c80e',
    }
  default:
    return null
  }
}

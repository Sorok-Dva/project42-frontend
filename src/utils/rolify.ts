export const rolify = (role: string, isMale = true) => {
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
  case 'User':
    return {
      name: isMale ? 'Joueur' : 'Joueuse',
      color: isMale ? '#2baaf7' : '#e15fc3',
    }
  default:
    return null
  }
}

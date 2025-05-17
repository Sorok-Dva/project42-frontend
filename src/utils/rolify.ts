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

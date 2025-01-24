import { ROLE_PERMISSIONS } from '../config/permissions'
import { Role } from '../context/UserContext'

export function initModeration(currentUserRole: Role) {
  const userPermissions = ROLE_PERMISSIONS[currentUserRole]

  const logger = (log: any) => currentUserRole === 'User' ? null : console.log(`[MODERATION] ${log}`)

  logger(`Permissions de l'utilisateur: ${JSON.stringify(userPermissions)}`)
  function kickUser(nickname: string) {
    logger(`Utilisateur ${nickname} expulsé.`)
  }

  function banUser(nickname: string) {
    logger(`Utilisateur ${nickname} banni.`)
  }

  function muteUser(nickname: string) {
    logger(`Utilisateur ${nickname} réduit au silence (mute).`)
  }

  function warnUser(nickname: string, reason: string) {
    logger(`Utilisateur ${nickname} averti pour raison: ${reason}.`)
  }

  function handleChatCommand(command: string, entity: string, reason: string) {
    if (!(userPermissions.gamePowers as readonly string[]).includes(command)) {
      console.log(`Permission refusée : vous ne pouvez pas exécuter la commande "${command}"`)
      return
    }

    switch (command) {
    case 'kick':
      kickUser(entity)
      break
    case 'ban':
      banUser(entity)
      break
    case 'mute':
      muteUser(entity)
      break
    case 'warn':
      warnUser(entity, reason)
      break
    default:
      console.log(`Commande inconnue : ${command}`)
    }
  }

  return {
    handleChatCommand,
    getUserPermissions: () => userPermissions,
  }
}

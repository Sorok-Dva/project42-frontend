const normaliser = (text: string): string => text
  .toLowerCase()
  .normalize('NFD') // Décompose les caractères accentués
  .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
  .replace(/[@$!%*?&]/g, 'a') // Remplace les caractères spéciaux courants
  .replace(/[^a-z0-9]/g, '') // Supprime tout sauf les lettres et chiffres

const forbiddenNicknames = [
  // Noms réservés
  'systeme',
  'moderation',
  'administrateur',
  'admin',
  'mod',
  'support',
  'help',
  'bot',
  'assistant',
  'staff',
  'team',

  // Insultes et termes offensants (non exhaustif)
  'con',
  'connard',
  'abruti',
  'enculé',
  'salopard',
  'putain',
  'merde',
  'batard',
  'bouffon',
  'débile',
  'hitler',

  // Variantes possibles
  'sysadmin',
  'modérateur',
  'superadmin',
  'root',
  'superuser',
  'administrator',

  // Expressions offensantes (attention au contexte)
  'fuck',
  'shit',
  'bitch',
  'bastard',
  'asshole',
  'whore',
]

export const isForbiddenNickname = (nickname: string): boolean => {
  const nickNormalise = normaliser(nickname)
  return forbiddenNicknames
    .some(forbidden => nickNormalise.includes(normaliser(forbidden)))
}

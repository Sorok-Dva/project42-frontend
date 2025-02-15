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

export const isForbiddenEmail = (email: string): boolean => {
  const forbiddenEmails = [
    'yopmail.com',
    'get2mail.fr',
    'jetable.org',
    'spamgourmet.com',
    'trbvm.com ',
    'trashmail.*',
    'trash-mail.at',
    'rcpt.at',
    'kurzepost.de',
    'wegwerfmail.*',
    'objectmail.com',
    'proxymail.eu',
    'sofimail.com',
    'mail-temporaire.fr',
    'mailhazard.com',
    'anonymbox.com',
    'meltmail.com',
    'mt2014.com',
    'sharklasers.com',
    'grr.la',
    'guerrillamail.*',
    'guerrillamailblock.com',
    'spam4.me',
    'filzmail.com',
    'mailinator.com',
    'mailexpire.com',
    'mailcatch.com',
    'spambox.us',
    'dispostable.com',
    'mintemail.com',
    'incognitomail.org',
    'mytempemail.com',
    'e4ward.com',
    'mailnull.com',
    'spamspot.com',
    'spamfree24.org',
    'tempemail.net',
    'onewaymail.com',
    'mailscrap.com',
    'tempail.com',
    'uroid.com',
    'spamobox.com',
    'deadaddress.com',
    'mailincubator.com',
    'sneakemail.com',
    'orange.fr',
    'wanadoo.fr',
    'laposte.net',
  ]

  return forbiddenEmails.includes(email.split('@')[1])
}

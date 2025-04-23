export const ROLE_PERMISSIONS = {
  SuperAdmin: {
    game: ['create', 'edit', 'dissolve', 'view', 'bypassPassword'],
    gamePowers: [
      'modo', 'messageTo', 'warn', 'kick', 'ban', 'mute', 'unmute',
      'addTimer', 'removeTimer', 'setTimer', 'nick', 'crea',
      'setNight', 'setDay', 'stop', 'card',
      'startPhase', 'endPhase', 'kill', 'revive',
      'listCards', 'mp', '42', 'forceReload',
    ],
    godPowers: ['addBot', 'removeBot', 'editBot', 'seeBot'],
    animationPowers: [
      'music', 'video', 'image', 'dice', 'text', 'timer',
      'quiz', 'poll', 'vote', 'question', 'answer', 'bonusPoints'
    ],
    site: [
      'achievement', 'warn', 'ban', 'rename', 'addPoints',
      'ip', 'ipComment', 'antecedents', 'moderationNotes', 'stalk',
      'userRole', 'dcInfos', 'removeSignature', 'guildAdmin'
    ],
  },
  Admin: {
    game: ['create', 'edit', 'dissolve', 'view', 'bypassPassword'],
    gamePowers: [
      'modo', 'messageTo', 'warn', 'kick', 'ban', 'mute', 'unmute',
      'addTimer', 'removeTimer', 'setTimer', 'nick', 'crea',
      'setNight', 'setDay', 'stop', 'card',
      'startPhase', 'endPhase', 'kill', 'revive',
      'listCards', 'mp', '42', 'forceReload',
    ],
    godPowers: ['addBot', 'removeBot', 'editBot', 'seeBot'],
    animationPowers: [
      'music', 'video', 'image', 'dice', 'text', 'timer',
      'quiz', 'poll', 'vote', 'question', 'answer', 'bonusPoints'
    ],
    site: [
      'achievement', 'warn', 'ban', 'rename', 'addPoints',
      'ip', 'ipComment', 'antecedents', 'moderationNotes', 'stalk',
      'userRole', 'dcInfos', 'removeSignature', 'guildAdmin'
    ],
  },
  Developer: {
    game: ['create', 'edit', 'dissolve', 'view', 'bypassPassword'],
    gamePowers: [
      'modo', 'messageTo', 'warn', 'kick', 'ban', 'mute', 'unmute',
      'addTimer', 'removeTimer', 'setTimer', 'nick', 'crea',
      'setNight', 'setDay', 'stop', 'card',
      'startPhase', 'endPhase', 'kill', 'revive',
      'listCards', 'mp', '42', 'forceReload',
    ],
    godPowers: [],
    animationPowers: [
      'music', 'video', 'image', 'dice', 'text', 'timer',
      'quiz', 'poll', 'vote', 'question', 'answer', 'bonusPoints'
    ],
    site: [
      'achievement', 'ip', 'ipComment', 'antecedents', 'moderationNotes',
    ],
  },
  Moderator: {
    game: ['create', 'edit', 'dissolve', 'view', 'bypassPassword'],
    gamePowers: [
      'modo', 'warn', 'kick', 'ban', 'mute', 'unmute',
      'crea', 'mp', '42',
    ],
    godPowers: [],
    animationPowers: [],
    site: [
      'warn', 'ban', 'rename',
      'ip', 'ipComment', 'antecedents', 'moderationNotes', 'stalk',
      'dcInfos', 'removeSignature'
    ],
  },
  ModeratorTest: {
    game: ['create', 'edit', 'view'],
    gamePowers: [
      'modo', 'warn', 'kick', 'mute', 'unmute', 'mp', '42',
    ],
    godPowers: [],
    animationPowers: [],
    site: [
      'warn', 'antecedents', 'moderationNotes', 'dcInfos'
    ],
  },
  Animator: {
    game: ['create', 'view'],
    gamePowers: [ 'addTimer', 'removeTimer', 'setTimer', 'message', 'mp', '42' ],
    godPowers: [ 'setNight', 'setDay' ],
    animationPowers: [
      'music', 'video', 'image', 'dice', 'text', 'timer',
      'quiz', 'poll', 'vote', 'question', 'answer', 'bonusPoints'
    ],
    site: [],
  },
  User: {
    game: ['create', 'view'],
    gamePowers: ['42'],
    godPowers: [],
    animationPowers: [],
    site: [],
  },
  Banned: {
    game: ['view'],
    gamePowers: [],
    godPowers: [],
    animationPowers: [],
    site: [],
  },
} as const satisfies {
  [role: string]: {
    [category: string]: readonly string[]
  }
}

export type Roles = keyof typeof ROLE_PERMISSIONS

export type Categories<R extends Roles> = keyof (typeof ROLE_PERMISSIONS)[R];

export type Permission<R extends Roles, C extends Categories<R>> =
  (typeof ROLE_PERMISSIONS)[R][C] extends readonly (infer Elem)[]
    ? Elem
    : never

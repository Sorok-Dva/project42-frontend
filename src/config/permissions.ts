export const ROLE_PERMISSIONS = {
  SuperAdmin: {
    game: ['create', 'edit', 'dissolve', 'view', 'bypassPassword'],
    gamePowers: [
      'modo', 'messageTo', 'warn', 'kick', 'ban', 'mute', 'unmute',
      'giveRole', 'removeRole', 'editRole', 'seeRole',
      'addTimer', 'removeTimer', 'setTimer', 'nick', 'crea',
      'setNight', 'setDay', 'stop', 'card',
      'startPhase', 'endPhase', 'kill', 'revive',
      'listCards'
    ],
    godPowers: ['addBot', 'removeBot', 'editBot', 'seeBot'],
    animationPowers: [
      'music', 'video', 'image', 'dice', 'text', 'timer',
      'quiz', 'poll', 'vote', 'question', 'answer',
    ],
    site: ['achievement'],
  },
  Admin: {
    game: ['create', 'edit', 'dissolve', 'view', 'bypassPassword'],
    gamePowers: [
      'modo', 'messageTo', 'warn', 'kick', 'ban', 'mute', 'unmute',
      'giveRole', 'removeRole', 'editRole', 'seeRole',
      'addTimer', 'removeTimer', 'setTimer', 'nick', 'crea',
      'setNight', 'setDay', 'stop', 'card',
      'startPhase', 'endPhase', 'kill', 'revive',
      'listCards'
    ],
    godPowers: ['addBot', 'removeBot', 'editBot', 'seeBot'],
    animationPowers: [
      'music', 'video', 'image', 'dice', 'text', 'timer',
      'quiz', 'poll', 'vote', 'question', 'answer',
    ],
    site: ['achievement'],
  },
  Developer: {
    game: ['create', 'edit', 'dissolve', 'view', 'bypassPassword'],
    gamePowers: [
      'modo', 'messageTo', 'warn', 'kick', 'ban', 'mute', 'unmute',
      'giveRole', 'removeRole', 'editRole', 'seeRole',
      'addTimer', 'removeTimer', 'setTimer', 'nick', 'crea',
      'setNight', 'setDay', 'stop', 'card',
      'startPhase', 'endPhase', 'kill', 'revive',
      'listCards'
    ],
    godPowers: [],
    animationPowers: [
      'music', 'video', 'image', 'dice', 'text', 'timer',
      'quiz', 'poll', 'vote', 'question', 'answer',
    ],
    site: ['achievement'],
  },
  Moderator: {
    game: ['create', 'edit', 'dissolve', 'view', 'bypassPassword'],
    gamePowers: [
      'modo', 'warn', 'kick', 'ban', 'mute', 'unmute',
      'giveRole', 'removeRole', 'editRole', 'seeRole',
      'setTimer', 'crea', 'stop',
    ],
    godPowers: [],
    animationPowers: [],
    site: [],
  },
  ModeratorTest: {
    game: ['create', 'edit', 'view'],
    gamePowers: [
      'modo', 'warn', 'kick', 'mute', 'unmute',
    ],
    godPowers: [],
    animationPowers: [],
    site: [],
  },
  Animator: {
    game: ['create', 'view'],
    gamePowers: [ 'addTimer', 'removeTimer', 'setTimer', 'message', 'messageTo' ],
    godPowers: ['setNight', 'setDay',],
    animationPowers: [
      'music', 'video', 'image', 'dice', 'text', 'timer',
      'quiz', 'poll', 'vote', 'question', 'answer',
    ],
    site: [],
  },
  User: {
    game: ['create', 'view'],
    gamePowers: [],
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

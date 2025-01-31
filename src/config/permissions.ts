export const ROLE_PERMISSIONS = {
  SuperAdmin: {
    game: ['create', 'edit', 'delete', 'view'],
    gamePowers: [
      'message', 'messageTo', 'warn', 'kick', 'ban', 'mute', 'unmute',
      'giveRole', 'removeRole', 'editRole', 'seeRole',
      'addTimer', 'removeTimer', 'nick', 'crea',
      'setNight', 'setDay',
    ],
    godPowers: ['addBot', 'removeBot', 'editBot', 'seeBot'],
    animationPowers: [
      'music', 'video', 'image', 'dice', 'text', 'timer',
      'quiz', 'poll', 'vote', 'question', 'answer',
    ],
  },
  Admin: {
    game: ['create', 'edit', 'delete', 'view'],
    gamePowers: [
      'message', 'messageTo', 'warn', 'kick', 'ban', 'mute', 'unmute',
      'giveRole', 'removeRole', 'editRole', 'seeRole',
      'addTimer', 'removeTimer', 'nick', 'crea',
      'setNight', 'setDay',
    ],
    godPowers: ['addBot', 'removeBot', 'editBot', 'seeBot'],
    animationPowers: [
      'music', 'video', 'image', 'dice', 'text', 'timer',
      'quiz', 'poll', 'vote', 'question', 'answer',
    ],
  },
  Developer: {
    game: ['create', 'edit', 'delete', 'view'],
    gamePowers: [
      'message', 'messageTo', 'warn', 'kick', 'ban', 'mute', 'unmute',
      'giveRole', 'removeRole', 'editRole', 'seeRole',
      'addTimer', 'removeTimer', 'nick', 'crea',
      'setNight', 'setDay',
    ],
    godPowers: [],
    animationPowers: [
      'music', 'video', 'image', 'dice', 'text', 'timer',
      'quiz', 'poll', 'vote', 'question', 'answer',
    ],
  },
  Moderator: {
    game: ['create', 'edit', 'delete', 'view'],
    gamePowers: [
      'message', 'warn', 'kick', 'ban', 'mute', 'unmute',
      'giveRole', 'removeRole', 'editRole', 'seeRole',
      'addTimer', 'removeTimer', 'crea',
    ],
    godPowers: [],
    animationPowers: [],
  },
  ModeratorTest: {
    game: ['create', 'edit', 'view'],
    gamePowers: [
      'message', 'warn', 'kick', 'mute', 'unmute',
    ],
    godPowers: [],
    animationPowers: [],
  },
  Animator: {
    game: ['create', 'view'],
    gamePowers: [ 'message', 'messageTo', 'addTimer', 'removeTimer' ],
    godPowers: ['setNight', 'setDay',],
    animationPowers: [
      'music', 'video', 'image', 'dice', 'text', 'timer',
      'quiz', 'poll', 'vote', 'question', 'answer',
    ],
  },
  User: {
    game: ['create', 'view'],
    gamePowers: [],
    godPowers: [],
    animationPowers: [],
  },
  Banned: {
    game: ['view'],
    gamePowers: [],
    godPowers: [],
    animationPowers: [],
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

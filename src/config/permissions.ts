export const ROLE_PERMISSIONS = {
  SuperAdmin: {
    game: ['create', 'edit', 'delete', 'view', 'bypassPassword'],
    gamePowers: [
      'modo', 'messageTo', 'warn', 'kick', 'ban', 'mute', 'unmute',
      'giveRole', 'removeRole', 'editRole', 'seeRole',
      'addTimer', 'removeTimer', 'setTimer', 'nick', 'crea',
      'setNight', 'setDay', 'stop', 'card',
      'startPhase', 'endPhase', 'kill', 'revive',
    ],
    godPowers: ['addBot', 'removeBot', 'editBot', 'seeBot'],
    animationPowers: [
      'music', 'video', 'image', 'dice', 'text', 'timer',
      'quiz', 'poll', 'vote', 'question', 'answer',
    ],
  },
  Admin: {
    game: ['create', 'edit', 'delete', 'view', 'bypassPassword'],
    gamePowers: [
      'modo', 'messageTo', 'warn', 'kick', 'ban', 'mute', 'unmute',
      'giveRole', 'removeRole', 'editRole', 'seeRole',
      'addTimer', 'removeTimer', 'setTimer', 'nick', 'crea',
      'setNight', 'setDay', 'stop', 'card',
      'startPhase', 'endPhase', 'kill', 'revive',
    ],
    godPowers: ['addBot', 'removeBot', 'editBot', 'seeBot'],
    animationPowers: [
      'music', 'video', 'image', 'dice', 'text', 'timer',
      'quiz', 'poll', 'vote', 'question', 'answer',
    ],
  },
  Developer: {
    game: ['create', 'edit', 'delete', 'view', 'bypassPassword'],
    gamePowers: [
      'modo', 'messageTo', 'warn', 'kick', 'ban', 'mute', 'unmute',
      'giveRole', 'removeRole', 'editRole', 'seeRole',
      'addTimer', 'removeTimer', 'setTimer', 'nick', 'crea',
      'setNight', 'setDay', 'stop', 'card',
      'startPhase', 'endPhase', 'kill', 'revive',
    ],
    godPowers: [],
    animationPowers: [
      'music', 'video', 'image', 'dice', 'text', 'timer',
      'quiz', 'poll', 'vote', 'question', 'answer',
    ],
  },
  Moderator: {
    game: ['create', 'edit', 'delete', 'view', 'bypassPassword'],
    gamePowers: [
      'modo', 'warn', 'kick', 'ban', 'mute', 'unmute',
      'giveRole', 'removeRole', 'editRole', 'seeRole',
      'setTimer', 'crea', 'stop',
    ],
    godPowers: [],
    animationPowers: [],
  },
  ModeratorTest: {
    game: ['create', 'edit', 'view'],
    gamePowers: [
      'modo', 'warn', 'kick', 'mute', 'unmute',
    ],
    godPowers: [],
    animationPowers: [],
  },
  Animator: {
    game: ['create', 'view'],
    gamePowers: [ 'addTimer', 'removeTimer', 'setTimer', 'message', 'messageTo'],
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

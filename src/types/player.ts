export interface Player {
  nickname: string
  realNickname: string
  ready: boolean
  alive: boolean
  cardId?: number
  target?: string
  inLove: boolean
  isSister: boolean
  isBrother: boolean
  isCharmed: boolean
  isInfected: boolean
  customVote?: number
  id?: string | number
  canVote?: boolean
}

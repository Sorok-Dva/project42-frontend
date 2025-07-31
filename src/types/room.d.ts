export interface Player {
  playerId: number
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
  faction?: 'Alien' | 'Station' | 'Solo'
  customVote?: number
  id?: string | number
  card?: { id: number; name: string; description: string; }
  canVote: boolean
  guide: string | null
  hasUsedAbility: false,
}

export interface Card {
  id: number
  name: string
  type: string
  description: string
  imageUrl?: string
}

export interface RoomAttributes {
  id?: number
  name: string
  creator: string
  instance: number
  type: number
  maxPlayers: number
  anonymousVotes: boolean
  privateGame: boolean
  discordChannelId?: string | null
  password: string | null
  status: 'waiting' | 'in_progress' | 'completed'
  phase: number
  limitPhase: Date
  timer: number
  currentRound: number
  maxRounds: number
  kicked?: string
  captain?: string | null
  savedPlayer?: string | null
  aliensVictim?: string | null
  couple1?: string | null
  couple2?: string | null
  deathElixir?: string | null
  lifeElixir?: string | null
  isHunterPhasePending?: boolean
  whiteFlag?: boolean
  anonymousGame?: boolean
  pointsMultiplier: number
  players?: Player[]
  cards?: Card[]
  createdAt?: Date
  updatedAt?: Date
}

export interface RoomStats {
  totalRooms: number
  activeRooms: number
  completedRooms: number
  averagePlayers: number
  totalPoints: number
  roomsByType: {
    type: number
    count: number
    label: string
  }[]
  roomsByStatus: {
    status: string
    count: number
  }[]
  pointsDistribution: {
    date: string
    points: number
  }[]
  playerVictories: {
    role: string
    victories: number
  }[]
}

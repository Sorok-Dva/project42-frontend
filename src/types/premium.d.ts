export interface PremiumPlayerStats {
  id: number
  nickname: string
  isAlive: boolean
  lastMessageTime: number | null
  messageCount: number
  goodVotes: number
  badVotes: number
  neutralVotes: number
}

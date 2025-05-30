export interface Guild {
  id: number
  name: string
  tag: string
  description: string
  signature: string
  leader: number
  banner: string
  points: number
  money: number
  createdAt: Date
  members: Array<{
    isOnline: boolean
    id: number
    userId: number
    role: string
    user: {
      id: number
      nickname: string
      avatar: string
      points: number
    }
  }>
}

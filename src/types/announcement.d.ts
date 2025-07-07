export interface Announcement {
  id: number
  guildId: number
  author: { id: number; nickname: string }
  content: string
  createdAt: string
}

export interface Announcement {
  id: number
  guildId: number
  author: number
  user: { nickname: string; avatar: string, guildMembership: { role: string } }
  content: string
  createdAt: string
}

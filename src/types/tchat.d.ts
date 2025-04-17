export interface User {
  id: string
  nickname: string
  avatar?: string
  status: 'online' | 'offline' | 'away' | 'busy'
  lastSeen?: Date
}

export interface OnlineUser {
  id : number
  isOnline : boolean
  user: {
    nickname : string
    avatar : string
  }
}

export interface GuildMessage {
  id? : number
  guildId? : number
  user?: {
    nickname?: string
  }
  userId : number
  nickname : string
  message : string
  createdAt : Date
  isSystem? : boolean
}

export interface PrivateMessage {
  conversationId: number
  senderId: number
  receiverId: number
  message: string
  timestamp: Date
  read: boolean
}

export interface Conversation {
  id: number
  participants: {
    id: number
    nickname: string
  }[]
  lastMessage?: PrivateMessage
  unreadCount: number
}

export type Role =
  'SuperAdmin'
  | 'Admin'
  | 'Developer'
  | 'Moderator'
  | 'ModeratorTest'
  | 'Animator'
  | 'User'
  | 'Banned'

export interface User {
  id: number;
  email: string;
  oldEmail: string;
  nickname: string;
  avatar: string;
  role: Role;
  roleId: number;
  isAdmin: boolean;
  isMale?: boolean;
  validated: boolean;
  lastNicknameChange: Date;
  level: number;
  points?: number;
  credits?: number;
  title: string;
  signature?: string;
  discordId?: string;
  premium?: Date;
  updatedAt?: Date;
  createdAt?: Date;
  token: string;
  behaviorPoints?: number;
  moderatorPoints?: number;
  guildMembership?: {
    role: string;
    guild: {
      id: number;
      name: string;
      tag: string;
      leader: number;
      banner: string;
    }
  },
  registerIp?: string;
  lastLoginIp?: string;
}

export interface UserProfile extends User {
  avatar: string;
  isAdmin: boolean;
}

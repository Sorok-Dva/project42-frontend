import { User } from 'types/user'

export interface Category {
  id: number
  name: string
  icon: string
}

export interface TagType {
  id: number
  name: string
  color: string
}

export interface Promotion {
  id: number
  discountPercentage: number
  endDate: Date | null
}

export interface AvatarSkin {
  id: number,
  rpmId: string,
  name: string
  locked: boolean,
  type: string,
  bodytype: string,
  gender: string,
  iconUrl: string,
}

export interface Item {
  id: number
  resourceId: number
  name: string
  description: string
  price: number
  discountPrice: number | null
  image: string
  categoryId: number
  category: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  isNew: boolean
  isFeatured: boolean
  enable: boolean
  tagId: number | null
  tag: TagType
  promotion: Promotion | null
  avatarSkin?: AvatarSkin
}

export interface ShopData {
  categories: Category[]
  items: Item[]
  tags: TagType[]
}

export interface UserInventory {
  itemId: number
  equipped: boolean
  quantity: number
}

export interface CreditPack {
  id: number
  credits: number
  price: number
  bonus: number
  popular: boolean
}

export interface PremiumPlan {
  id: number
  name: string
  discount: number
  duration: number
  price: number
  credits: number
  popular: boolean
}

export interface Transaction {
  id: number;
  userId: number;
  itemId?: number | null;
  premiumPlanId?: number | null;
  creditsPackId?: number | null;
  price?: string;// DECIMAL(10,2) est mappé sur string
  credits?: number;
  type: 'item_bought' | 'premium_bought' | 'credits_bought' | 'gift_sent' | 'gift_received';
  giftTo?: number | null;
  giftFrom?: number | null;
  status: 'pending' | 'completed' | 'canceled';
  item?: Item
  premiumPlan?: PremiumPlan
  creditsPack?: CreditPack
  user: User,
  recipient?: User,
  sender?: User,
  createdAt: Date;
  updatedAt?: Date;
}

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
}

export interface ShopData {
  categories: Category[]
  items: Item[]
  tags: TagType[]
}

export interface UserInventory {
  itemId: number
  equipped: boolean
}

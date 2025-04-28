export interface Card {
  id : number
  name : string
  description : string
  imageUrl : string
  createdAt : Date
  updatedAt : Date
}

export type CardFormData = Omit<Card, 'id' | 'createdAt' | 'updatedAt'>

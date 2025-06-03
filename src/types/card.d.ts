export interface Card {
  id : number
  name : string
  description : string
  imageUrl : string
  status: 'alive' | 'dead';
  createdAt : Date
  updatedAt : Date
}

export type CardFormData = Omit<Card, 'id' | 'createdAt' | 'updatedAt'>

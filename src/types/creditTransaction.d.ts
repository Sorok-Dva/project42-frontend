export interface CreditTransaction {
  id: number;
  userId: number;
  gameId?: number | null;
  itemId?: number | null;
  premiumPlanId?: number | null;
  creditsPackId?: number | null;
  credits: number;
  oldAmount: number;
  newAmount: number;
  giftFrom?: number | null;
  type: 'game' | 'daily_reward' | 'shop_item' | 'shop_credits' | 'shop_premium' | 'events' | 'gift' | 'admin';
  description: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  user?: {
    id: number;
    nickname: string;
    email: string;
    avatar?: string;
  };
  giftSender?: {
    id: number;
    nickname: string;
    avatar?: string;
  };
  item?: {
    id: number;
    name: string;
    price: number;
  };
  premiumPlan?: {
    id: number;
    name: string;
    price: number;
  };
  creditsPack?: {
    id: number;
    credits: number;
    price: number;
  };
  game?: {
    id: number;
    name: string;
  };
}

export interface TransactionStats {
  totalTransactions: number;
  totalCreditsAdded: number;
  totalCreditsSpent: number;
  netCredits: number;
  transactionsByType: {
    type: string;
    count: number;
    totalCredits: number;
  }[];
  dailyTransactions: {
    date: string;
    added: number;
    spent: number;
  }[];
  monthlyTransactions: {
    month: string;
    added: number;
    spent: number;
  }[];
}

export interface UserTransactionStats extends TransactionStats {
  userId: number;
  nickname: string;
  currentCredits: number;
  firstTransaction: string;
  lastTransaction: string;
}

export interface TransactionFilters {
  userId?: number;
  username?: string;
  type?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  minCredits?: number;
  maxCredits?: number;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedTransactions {
  transactions: CreditTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

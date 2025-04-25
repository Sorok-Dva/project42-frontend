export interface News {
  id: number;
  title: string;
  content: string;
  author: {
    id: number;
    nickname: string;
    avatar?: string;
  };
  publishDate: Date | string;
  updatedAt?: Date | string;
  createdAt?: Date | string;
  tags: string;
  image?: string;
  featured?: boolean;
}

export interface NewsFilters {
  page: number;
  limit: number;
  tag?: string;
  search?: string;
}

export interface NewsPaginationResult {
  news: News[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

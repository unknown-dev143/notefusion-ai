export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

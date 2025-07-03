export interface PaginatedResponse<T> {
  items: T[],
  info: {
    count: number,
    page: number,
    pageSize: number,
  }
}

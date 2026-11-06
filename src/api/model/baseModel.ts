export interface BasicPageParams {
  page: number;
  size: number;
}

export interface BasicFetchResult<T> {
  records: T[];
  total: number;
}

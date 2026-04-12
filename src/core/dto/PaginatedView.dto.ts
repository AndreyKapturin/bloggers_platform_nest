export class PaginatedView<T> {
  pagesCount!: number;
  page!: number;
  pageSize!: number;
  totalCount!: number;
  items!: T[];

  static toView<T>(
    page: number,
    pageSize: number,
    totalCount: number,
    items: T[],
  ): PaginatedView<T> {
    const paginatedView = new this<T>();
    paginatedView.page = page;
    paginatedView.pageSize = pageSize;
    paginatedView.totalCount = totalCount;
    paginatedView.pagesCount = Math.ceil(totalCount / pageSize);
    paginatedView.items = items;
    return paginatedView;
  }
}

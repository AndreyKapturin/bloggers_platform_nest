import { Type } from 'class-transformer';

export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_SORT_DIRECTION = SortDirection.Desc;

export class BaseQueryParamsDto {
  @Type(() => Number)
  pageNumber: number = 1;

  @Type(() => Number)
  pageSize: number = DEFAULT_PAGE_SIZE;

  sortDirection: SortDirection = DEFAULT_SORT_DIRECTION;

  get skip() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}

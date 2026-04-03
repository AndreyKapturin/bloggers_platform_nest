import { Type } from "class-transformer";

export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export class BaseQueryParamsDto {
  @Type(() => Number)
  pageNumber: number = 1;

  @Type(() => Number)
  pageSize: number = 10;

  sortDirection: SortDirection = SortDirection.Desc

  get skip() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}
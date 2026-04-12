import { BaseQueryParamsDto } from "../../../../core/dto/BaseQueryParams.dto";

export enum BlogsSortBy {
  CreatedAt = 'createdAt',
  Name = 'name',
}

export class BlogsQueryParamsDto extends BaseQueryParamsDto {
  sortBy = BlogsSortBy.CreatedAt;
  searchNameTerm: string | null = null;
}

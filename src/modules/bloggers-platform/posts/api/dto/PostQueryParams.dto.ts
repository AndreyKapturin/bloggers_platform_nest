import { BaseQueryParamsDto } from "../../../../../core/dto/BaseQueryParams.dto";

export enum PostsSortBy {
  Title = 'title',
  BlogName = 'blogName',
  CreatedAt = 'createdAt',
}

export class PostsQueryParamsDto extends BaseQueryParamsDto {
  sortBy = PostsSortBy.CreatedAt;
}

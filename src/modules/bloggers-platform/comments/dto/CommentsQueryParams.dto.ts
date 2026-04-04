import { BaseQueryParamsDto } from 'src/core/dto/BaseQueryParams.dto';

export enum CommentsSortBy {
  CreatedAt = 'createdAt'
}

export class CommentsQueryParamsDto extends BaseQueryParamsDto {
  sortBy = CommentsSortBy.CreatedAt;
}

import { BaseQueryParamsDto } from '../../../../../core/dto/BaseQueryParams.dto';

export enum UsersSortBy {
  CreatedAt = 'createdAt',
  Login = 'login',
}

export class UserQueryParamsDto extends BaseQueryParamsDto {
  sortBy = UsersSortBy.CreatedAt;
  searchLoginTerm: string | null = null;
  searchEmailTerm: string | null = null;
}
